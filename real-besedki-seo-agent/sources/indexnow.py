from __future__ import annotations

import json
import os
import re
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from config import SITE_URL
from site_health.seo import SITEMAP_CHROME, SITEMAP_INFO_PREFIXES, sitemap_path
from site_health.sku_aliases import CATEGORY_RELOCATIONS, CORE_SKUS, relocation_old_paths
from sources.live import TIMEOUT, USER_AGENT, _get, _ssl_context

CANONICAL_BASE = SITE_URL.rstrip("/")
INDEXNOW_ENDPOINTS = (
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
)
YANDEX_ENDPOINTS = (
    "https://yandex.com/indexnow",
    "https://yandex.ru/indexnow",
)
OGON_SLUG_RE = re.compile(r"^b-(7[4-9]|8\d|9[0-4])$")
KEY_HINT_PATH = "/indexnow-key.txt"


def blocked_alias_paths() -> frozenset[str]:
    blocked: set[str] = set()
    for sku in CORE_SKUS:
        blocked.update(sku["aliases"])
    for move in CATEGORY_RELOCATIONS:
        blocked.update(relocation_old_paths(move))
    return frozenset(blocked)


def is_blocked_indexnow_path(path: str) -> bool:
    """Never ping search, blog, size hubs, 404 aliases, admin."""
    p = (path or "").split("?", 1)[0].rstrip("/") or "/"
    if p == "/katalog/poisk" or p.startswith("/katalog/poisk/"):
        return True
    if p.startswith("/blog"):
        return True
    if p == "/katalog/razmer" or p.startswith("/katalog/razmer/"):
        return True
    if p.startswith("/admin") or p.startswith("/api"):
        return True
    if p in blocked_alias_paths():
        return True
    return False


def _commercial_roots(paths: list[str]) -> list[str]:
    out: list[str] = []
    for path in paths:
        if path.count("/") != 1:
            continue
        if path in SITEMAP_CHROME:
            continue
        if any(path == pref or path.startswith(pref + "/") for pref in SITEMAP_INFO_PREFIXES):
            continue
        if path.startswith("/blog"):
            continue
        out.append(path)
    return sorted(set(out))


def _category_hubs(paths: list[str]) -> list[str]:
    hubs: set[str] = set()
    for path in paths:
        if not re.fullmatch(r"/katalog/[^/]+/[^/]+", path):
            continue
        if path.startswith("/katalog/razmer/") or path.startswith("/katalog/poisk"):
            continue
        hubs.add("/katalog/" + path.split("/")[2])
    return sorted(hubs)


def _ogon_cards(paths: list[str]) -> list[str]:
    out = []
    for path in paths:
        if not re.fullmatch(r"/katalog/[^/]+/[^/]+", path):
            continue
        slug = path.rsplit("/", 1)[-1]
        if OGON_SLUG_RE.fullmatch(slug):
            out.append(path)
    return sorted(set(out))


def _live_loft_cards(paths: list[str]) -> list[str]:
    out = []
    for move in CATEGORY_RELOCATIONS:
        prefix = str(move["new_prefix"]).rstrip("/")
        for slug in move.get("slugs") or ():
            path = f"{prefix}/{slug}"
            if path in paths:
                out.append(path)
    return sorted(set(out))


def build_priority_urls(locs: list[str]) -> list[str]:
    """Commercial set for IndexNow. Never poisk, blog, noindex size hubs, or 404 aliases."""
    paths = [sitemap_path(loc) for loc in locs]
    path_set = set(paths)
    chosen: list[str] = []

    def add(path: str, *, require_in_map: bool = True) -> None:
        p = path.rstrip("/") or "/"
        if is_blocked_indexnow_path(p):
            return
        if require_in_map and p != "/" and p not in path_set and not p.startswith("/materialy/"):
            # materials + chrome may sit outside commercial count; still allow core.
            if p not in ("/katalog", "/kontakty"):
                return
        if p not in chosen:
            chosen.append(p)

    for core in ("/", "/katalog", "/kontakty"):
        add(core)
    for hub in _category_hubs(paths):
        add(hub, require_in_map=False)
    for root in _commercial_roots(paths):
        add(root)
    for material in ("/materialy/fanera-pol", "/materialy/metall-karkas"):
        if material not in chosen:
            chosen.append(material)
    for card in _ogon_cards(paths):
        add(card)
    for card in _live_loft_cards(paths):
        add(card)
    return [CANONICAL_BASE + ("" if p == "/" else p) for p in chosen]


def discover_indexnow_key() -> dict[str, Any]:
    hint = _get(CANONICAL_BASE + KEY_HINT_PATH)
    key = (hint.get("body") or "").strip().splitlines()[0].strip() if hint.get("status") == 200 else ""
    if not re.fullmatch(r"[A-Za-z0-9-]{8,128}", key):
        return {"ok": False, "error": "indexnow key file missing or invalid", "key_location": None}
    key_path = f"/{key}.txt"
    confirm = _get(CANONICAL_BASE + key_path)
    body = (confirm.get("body") or "").strip()
    if confirm.get("status") != 200 or key not in body:
        return {
            "ok": False,
            "error": f"{key_path} status {confirm.get('status')}",
            "key": key,
            "key_location": CANONICAL_BASE + KEY_HINT_PATH,
        }
    return {
        "ok": True,
        "key": key,
        "key_location": CANONICAL_BASE + key_path,
    }


def _post_indexnow(endpoint: str, payload: dict[str, Any], timeout: int = TIMEOUT) -> dict[str, Any]:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = Request(
        endpoint,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": USER_AGENT,
        },
    )
    try:
        with urlopen(req, timeout=timeout, context=_ssl_context()) as resp:
            raw = resp.read().decode("utf-8", "replace")
            return {"endpoint": endpoint, "status": resp.status, "body": raw[:400]}
    except HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace") if exc.fp else ""
        return {"endpoint": endpoint, "status": exc.code, "body": raw[:400], "error": str(exc)}
    except (URLError, TimeoutError, OSError) as exc:
        return {"endpoint": endpoint, "status": None, "body": "", "error": str(exc)}


def submit_priority_indexnow(*, locs: list[str] | None = None) -> dict[str, Any]:
    if locs is None:
        sm = _get(f"{CANONICAL_BASE}/sitemap.xml")
        locs = re.findall(r"<loc>([^<]+)</loc>", sm.get("body") or "")
    urls = build_priority_urls(locs)
    if any("/katalog/poisk" in u for u in urls):
        raise AssertionError("IndexNow list must not include /katalog/poisk")
    key_info = discover_indexnow_key()
    result: dict[str, Any] = {
        "url_count": len(urls),
        "urls": urls,
        "key_ok": bool(key_info.get("ok")),
        "submissions": [],
    }
    if not key_info.get("ok"):
        result["error"] = key_info.get("error")
        return result
    payload = {
        "host": "real-besedki.ru",
        "key": key_info["key"],
        "keyLocation": key_info["key_location"],
        "urlList": urls,
    }
    for endpoint in INDEXNOW_ENDPOINTS:
        result["submissions"].append(_post_indexnow(endpoint, payload))
    if os.environ.get("INDEXNOW_YANDEX", "").strip() == "1":
        for endpoint in YANDEX_ENDPOINTS:
            result["submissions"].append(_post_indexnow(endpoint, payload, timeout=8))
    return result
