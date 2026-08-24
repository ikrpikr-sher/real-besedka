from __future__ import annotations

import time
from typing import Any

from sources.jsonhttp import request_json, sleep_retry_after

CLOUD_TOP = "https://searchapi.api.cloud.yandex.net/v2/wordstat/topRequests"
LEGACY_TOP = "https://api.wordstat.yandex.net/v1/topRequests"


class WordstatError(RuntimeError):
    pass


def top_requests_cloud(
    phrase: str,
    *,
    api_key: str,
    folder_id: str,
    region_id: str = "213",
    num_phrases: int = 50,
) -> dict[str, Any]:
    status, payload, headers = request_json(
        "POST",
        CLOUD_TOP,
        headers={"Authorization": f"Api-Key {api_key}"},
        body={
            "phrase": phrase,
            "numPhrases": num_phrases,
            "regions": [str(region_id)],
            "devices": ["DEVICE_ALL"],
            "folderId": folder_id,
        },
    )
    if status == 429:
        sleep_retry_after(headers, 2.0)
        return top_requests_cloud(
            phrase,
            api_key=api_key,
            folder_id=folder_id,
            region_id=region_id,
            num_phrases=num_phrases,
        )
    if status != 200:
        raise WordstatError(_err(status, payload))
    return payload if isinstance(payload, dict) else {}


def top_requests_legacy(
    phrase: str,
    *,
    oauth_token: str,
    region_id: str = "213",
    num_phrases: int = 50,
) -> dict[str, Any]:
    status, payload, headers = request_json(
        "POST",
        LEGACY_TOP,
        headers={"Authorization": f"Bearer {oauth_token}"},
        body={
            "phrase": phrase,
            "regions": [int(region_id) if str(region_id).isdigit() else region_id],
            "devices": ["all"],
            "numPhrases": num_phrases,
        },
    )
    if status == 429:
        sleep_retry_after(headers, 2.0)
        return top_requests_legacy(
            phrase,
            oauth_token=oauth_token,
            region_id=region_id,
            num_phrases=num_phrases,
        )
    if status != 200:
        raise WordstatError(_err(status, payload))
    return payload if isinstance(payload, dict) else {}


def expand_phrases(
    seeds: list[str],
    *,
    api_key: str = "",
    folder_id: str = "",
    oauth_token: str = "",
    region_id: str = "213",
    num_phrases: int = 50,
    depth: int = 1,
    pause: float = 1.1,
) -> list[dict[str, Any]]:
    if api_key and folder_id:
        fetch = lambda p: top_requests_cloud(
            p, api_key=api_key, folder_id=folder_id, region_id=region_id, num_phrases=num_phrases
        )
        source = "wordstat-cloud"
    elif oauth_token:
        fetch = lambda p: top_requests_legacy(
            p, oauth_token=oauth_token, region_id=region_id, num_phrases=num_phrases
        )
        source = "wordstat-v1"
    else:
        raise WordstatError(
            "Нет ключа Wordstat. Нужны YANDEX_WORDSTAT_API_KEY + YANDEX_FOLDER_ID "
            "(Yandex Cloud Search API) либо YANDEX_WORDSTAT_TOKEN (v1)."
        )

    from database.yadro_store import cache_get, cache_put

    def fetch_cached(phrase: str) -> dict[str, Any]:
        cached = cache_get(phrase, region_id)
        if cached:
            return cached
        data = fetch(phrase)
        cache_put(phrase, region_id, data)
        time.sleep(pause)
        return data

    seen: dict[str, dict[str, Any]] = {}
    queue = [(seed, 0, seed) for seed in seeds]
    while queue:
        phrase, level, seed = queue.pop(0)
        data = fetch_cached(phrase)
        rows = _extract_rows(data, seed=seed, source=source, kind="related")
        for row in rows:
            key = row["query"].casefold()
            prev = seen.get(key)
            if prev is None or (row.get("ws") or 0) > (prev.get("ws") or 0):
                seen[key] = row
            if depth > 1 and level == 0 and (row.get("ws") or 0) >= 50:
                child = row["query"]
                if child.casefold() not in {q.casefold() for q, _, _ in queue} and child.casefold() != phrase.casefold():
                    queue.append((child, 1, seed))
        for row in _extract_assoc(data, seed=seed, source=source):
            key = row["query"].casefold()
            if key not in seen:
                seen[key] = row
    return list(seen.values())


def _extract_rows(data: dict[str, Any], *, seed: str, source: str, kind: str) -> list[dict[str, Any]]:
    items = (
        data.get("results")
        or data.get("topRequests")
        or data.get("response", {}).get("results")
        or []
    )
    out = []
    for item in items:
        if not isinstance(item, dict):
            continue
        phrase = str(item.get("phrase") or item.get("text") or item.get("query") or "").strip()
        if not phrase:
            continue
        count = item.get("count") or item.get("value") or item.get("ws") or 0
        try:
            count = int(count)
        except (TypeError, ValueError):
            count = 0
        out.append(
            {
                "query": phrase,
                "ws": count,
                "wsk": None,
                "seed": seed,
                "source": source,
                "kind": kind,
            }
        )
    return out


def _extract_assoc(data: dict[str, Any], *, seed: str, source: str) -> list[dict[str, Any]]:
    items = data.get("associations") or []
    out = []
    for item in items:
        if not isinstance(item, dict):
            continue
        phrase = str(item.get("phrase") or item.get("text") or "").strip()
        if not phrase:
            continue
        count = item.get("count") or 0
        try:
            count = int(count)
        except (TypeError, ValueError):
            count = 0
        out.append(
            {
                "query": phrase,
                "ws": count,
                "wsk": None,
                "seed": seed,
                "source": source,
                "kind": "association",
            }
        )
    return out


def _err(status: int, payload: Any) -> str:
    if isinstance(payload, dict):
        msg = payload.get("message") or payload.get("error") or payload.get("error_description")
        if msg:
            return f"Wordstat HTTP {status}: {msg}"
    return f"Wordstat HTTP {status}"
