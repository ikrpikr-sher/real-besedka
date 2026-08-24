from __future__ import annotations

import time
from typing import Any

from sources.jsonhttp import request_json, sleep_retry_after

BASE = "https://api.keys.so"


class KeysoError(RuntimeError):
    pass


def _headers(token: str) -> dict[str, str]:
    return {"X-Keyso-TOKEN": token, "auth-token": token}


def verify_token(token: str) -> tuple[bool, str]:
    """Дешёвая проверка ключа. Не запускает парсер и не тратит пакет фраз."""
    token = token.strip()
    if not token:
        return False, "пустой токен"
    status, payload, _headers_out = request_json(
        "GET",
        BASE + "/wordstat/list",
        headers=_headers(token),
        query={"page": 1, "per_page": 1},
    )
    if status == 200:
        return True, "Keys.so принял токен"
    if status == 401:
        return False, "Keys.so: токен не принят (401)"
    if status == 403:
        return False, "Keys.so: нет доступа к API (нужен тариф Профессиональный или Корпоративный)"
    if status == 429:
        return True, "Keys.so: токен живой, сработал лимит запросов"
    msg = ""
    if isinstance(payload, dict):
        msg = str(payload.get("message") or payload.get("error") or "")
    return False, f"Keys.so HTTP {status}" + (f": {msg}" if msg else "")


def _call(
    method: str,
    path: str,
    token: str,
    *,
    body: Any = None,
    query: dict[str, Any] | None = None,
) -> Any:
    status, payload, headers = request_json(
        method,
        BASE + path,
        headers=_headers(token),
        body=body,
        query=query,
    )
    if status == 429:
        sleep_retry_after(headers, 1.2)
        return _call(method, path, token, body=body, query=query)
    if status != 200:
        raise KeysoError(_err(status, payload))
    return payload


def expand_keywords(
    seeds: list[str],
    token: str,
    *,
    base: str = "msk",
    similarity: int = 30,
    poll_sec: float = 3.0,
    timeout_sec: float = 420.0,
) -> list[dict[str, Any]]:
    """Keys.so «Расширение ключевых фраз» — тот же инструмент, что в UI."""
    created = _call(
        "POST",
        "/tools/extended_keywords",
        token,
        body={
            "base": base,
            "list": seeds,
            "config": {
                "similarity": similarity,
                "deleteDuplicate": True,
                "additions": False,
            },
        },
    )
    uid = str((created or {}).get("uid") or "").strip()
    if not uid:
        raise KeysoError("Keys.so extended_keywords не вернул uid")
    _wait_state(token, f"/tools/extended_keywords/state/{uid}", poll_sec, timeout_sec)
    return _paginate(token, f"/tools/extended_keywords/{uid}", extra_query={"sort": "wsk|desc"})


def keywords_by_list(
    phrases: list[str],
    token: str,
    *,
    base: str = "msk",
    poll_sec: float = 3.0,
    timeout_sec: float = 420.0,
) -> list[dict[str, Any]]:
    created = _call(
        "POST",
        "/tools/keywords_by_list",
        token,
        body={"base": base, "list": phrases},
    )
    uid = str((created or {}).get("uid") or "").strip()
    if not uid:
        raise KeysoError("Keys.so keywords_by_list не вернул uid")
    deadline = time.time() + timeout_sec
    path = f"/tools/keywords_by_list/{base}:{uid}"
    while time.time() < deadline:
        try:
            return _paginate(token, path, extra_query={"base": base, "sort": "wsk|desc"})
        except KeysoError as exc:
            if "404" in str(exc):
                time.sleep(poll_sec)
                continue
            raise
        time.sleep(poll_sec)
    raise KeysoError("Keys.so keywords_by_list: таймаут ожидания отчёта")


def wordstat_collect_phrases(
    seeds: list[str],
    token: str,
    *,
    name: str,
    region_id: int = 213,
    poll_sec: float = 5.0,
    timeout_sec: float = 600.0,
) -> list[dict[str, Any]]:
    """Онлайн-парсер Wordstat Keys.so, type=0 — сбор похожих фраз."""
    created = _call(
        "POST",
        "/wordstat/create-project",
        token,
        body={
            "data": {
                "type": 0,
                "name": name,
                "regionId": region_id,
                "words": seeds,
                "source": 1,
            }
        },
    )
    project_id = (created or {}).get("id")
    if not project_id:
        raise KeysoError("Keys.so wordstat/create-project не вернул id")
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        status = _call(
            "GET",
            "/wordstat/get-project-status",
            token,
            query={"id": project_id},
        )
        batches = int((status or {}).get("batches") or 0)
        total = int((status or {}).get("batches_total") or 0)
        if total and batches >= total:
            break
        time.sleep(poll_sec)
    else:
        raise KeysoError("Keys.so wordstat: таймаут парсинга")
    return _paginate(
        token,
        "/wordstat/report",
        extra_query={"projectId": project_id, "sort": "ws|desc"},
    )


def domain_dashboard(token: str, domain: str, *, base: str = "msk", tries: int = 8) -> dict[str, Any] | None:
    """Видимость домена. 202 = отчёт ещё строится."""
    last_err: Exception | None = None
    for _ in range(tries):
        try:
            data = _call(
                "GET",
                "/report/simple/domain_dashboard",
                token,
                query={"base": base, "domain": domain},
            )
            return data if isinstance(data, dict) else None
        except KeysoError as exc:
            last_err = exc
            text = str(exc)
            if "202" in text or "подготавливает" in text:
                time.sleep(8)
                continue
            if any(code in text for code in ("400", "404", "422")):
                return None
            raise
    if last_err:
        raise last_err
    return None


def organic_keywords(
    token: str,
    domain: str,
    *,
    base: str = "msk",
    pages: int = 1,
    sort: str = "wsk|desc",
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for page in range(1, pages + 1):
        data = _call(
            "GET",
            "/report/simple/organic/keywords",
            token,
            query={
                "base": base,
                "domain": domain,
                "page": page,
                "per_page": 100,
                "sort": sort,
            },
        )
        chunk = (data or {}).get("data") if isinstance(data, dict) else []
        rows.extend([x for x in chunk or [] if isinstance(x, dict)])
        last = int((data or {}).get("last_page") or page) if isinstance(data, dict) else page
        if page >= last or not chunk:
            break
        time.sleep(1.1)
    return rows


def organic_sitepages(
    token: str,
    domain: str,
    *,
    base: str = "msk",
    per_page: int = 15,
) -> list[dict[str, Any]]:
    data = _call(
        "GET",
        "/report/simple/organic/sitepages",
        token,
        query={"base": base, "domain": domain, "page": 1, "per_page": per_page},
    )
    chunk = (data or {}).get("data") if isinstance(data, dict) else []
    return [x for x in chunk or [] if isinstance(x, dict)]


def keyword_dashboard(token: str, keyword: str, *, base: str = "msk") -> dict[str, Any] | None:
    data = _call(
        "GET",
        "/report/simple/keyword_dashboard",
        token,
        query={"base": base, "keyword": keyword},
    )
    return data if isinstance(data, dict) else None


def concurents_by_keywords(
    phrases: list[str],
    token: str,
    *,
    base: str = "msk",
    poll_sec: float = 3.0,
    timeout_sec: float = 180.0,
) -> list[dict[str, Any]]:
    created = _call(
        "POST",
        "/tools/concurents_by_keywords",
        token,
        body={"base": base, "list": phrases},
    )
    uid = str((created or {}).get("uid") or "").strip()
    if not uid:
        raise KeysoError("Keys.so concurents_by_keywords не вернул uid")
    _wait_state(token, f"/tools/concurents_by_keywords/state/{uid}", poll_sec, timeout_sec)
    return _paginate(token, f"/tools/concurents_by_keywords/{uid}")


def normalize_row(item: dict[str, Any], *, seed: str = "", source: str = "keyso") -> dict[str, Any] | None:
    phrase = str(
        item.get("destination_key")
        or item.get("word")
        or item.get("phrase")
        or item.get("query")
        or item.get("key")
        or ""
    ).strip()
    if not phrase:
        return None
    ws = _int(item.get("ws") or item.get("count"))
    wsk = _int(item.get("wsk") or item.get("swsk") or item.get("qwsk"))
    return {
        "query": phrase,
        "ws": ws,
        "wsk": wsk,
        "seed": seed or str(item.get("source_key") or item.get("initial_word") or ""),
        "source": source,
        "kind": str(item.get("type") or "extended"),
        "ads": _int(item.get("adscnt")),
    }


def _wait_state(token: str, path: str, poll_sec: float, timeout_sec: float) -> None:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        data = _call("GET", path, token)
        progress = _int((data or {}).get("progress"))
        state = (data or {}).get("state")
        if progress >= 100 or state in (10, "10", "done", "ready", "complete"):
            return
        time.sleep(poll_sec)
    raise KeysoError(f"Keys.so таймаут: {path}")


def _paginate(token: str, path: str, extra_query: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    page = 1
    per_page = 100
    rows: list[dict[str, Any]] = []
    while True:
        query = {"page": page, "per_page": per_page}
        if extra_query:
            query.update(extra_query)
        data = _call("GET", path, token, query=query)
        chunk = []
        if isinstance(data, dict):
            chunk = data.get("data") or data.get("items") or data.get("keys") or []
            last = int(data.get("last_page") or page)
        elif isinstance(data, list):
            chunk = data
            last = page
        else:
            break
        rows.extend([x for x in chunk if isinstance(x, dict)])
        if page >= last or not chunk:
            break
        page += 1
        time.sleep(1.1)
    return rows


def _int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _err(status: int, payload: Any) -> str:
    if isinstance(payload, dict):
        msg = payload.get("message") or payload.get("error")
        if msg:
            return f"Keys.so HTTP {status}: {msg}"
    return f"Keys.so HTTP {status}"
