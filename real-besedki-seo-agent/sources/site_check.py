from __future__ import annotations

import json
import random
import re
import ssl
import socket
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

from config import SITE_URL
from sources.catalog import parse_catalog
from sources.live import TIMEOUT, USER_AGENT, _get, _parse_html, _ssl_context

KEY_ROUTES = (
    "/",
    "/katalog",
    "/blog",
    "/kontakty",
    "/uslugi",
    "/materialy",
    "/o-kompanii",
)

SEARCH_QUERIES = (
    ("B-51", "latin article"),
    ("В51", "cyrillic article"),
)


def _resolve_image_url(base: str, rel: str) -> tuple[str, int | None]:
    url = rel if rel.startswith("http") else f"{base}{rel}"
    resp = _get(url)
    if resp.get("status") == 200:
        return url, 200
    if url.endswith(".png"):
        for ext in (".webp", ".jpg", ".jpeg"):
            alt = url[:-4] + ext
            alt_resp = _get(alt)
            if alt_resp.get("status") == 200:
                return alt, 200
    return url, resp.get("status")


def _catalog_with_media() -> list[dict[str, Any]]:
    from config import SITE_CODE_ROOT

    products = parse_catalog()
    path = SITE_CODE_ROOT / "data" / "katalog.json"
    if not path.exists():
        return products
    raw = json.loads(path.read_text(encoding="utf-8"))
    items = raw if isinstance(raw, list) else raw.get("items") or []
    by_slug = {str(i.get("slug")): i for i in items if isinstance(i, dict)}
    out = []
    for p in products:
        item = by_slug.get(p["slug"]) or {}
        images = item.get("images") or []
        out.append({**p, "images": images, "model3d": item.get("model3d")})
    return out


def _check_search(base: str, query: str) -> dict[str, Any]:
    path = f"/katalog/poisk?q={quote(query)}"
    url = f"{base}{path}"
    resp = _get(url)
    ok = resp.get("status") == 200
    body = resp.get("body") or ""
    found = False
    if ok and body:
        lowered = body.lower()
        q = query.lower().replace("-", "")
        found = q in lowered or query.lower() in lowered or "b-51" in lowered or "b51" in lowered
    return {
        "path": path,
        "query": query,
        "status": resp.get("status"),
        "ok": ok and found,
        "error": resp.get("error"),
    }


def _sample_sitemap_urls(base: str, sample_size: int = 20) -> list[dict[str, Any]]:
    sm = _get(f"{base}/sitemap.xml")
    if sm.get("status") != 200:
        return [{"error": "sitemap unavailable", "status": sm.get("status")}]
    locs = re.findall(r"<loc>([^<]+)</loc>", sm.get("body") or "")
    if not locs:
        return [{"error": "no loc in sitemap"}]
    pick = locs if len(locs) <= sample_size else random.sample(locs, sample_size)
    results = []
    for loc in pick:
        resp = _get(loc)
        rel = loc.replace(base, "") if loc.startswith(base) else loc
        results.append(
            {
                "url": loc,
                "path": rel,
                "status": resp.get("status"),
                "ok": resp.get("status") == 200,
            }
        )
    return results


def _ssl_expiry(host: str = "real-besedki.ru") -> dict[str, Any]:
    try:
        ctx = _ssl_context()
        with socket.create_connection((host, 443), timeout=TIMEOUT) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert()
        not_after = cert.get("notAfter")
        if not not_after:
            return {"host": host, "ok": True, "expires": None}
        expires = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days = (expires - datetime.now(timezone.utc)).days
        return {
            "host": host,
            "ok": days > 7,
            "expires": expires.date().isoformat(),
            "days_left": days,
        }
    except Exception as exc:
        return {"host": host, "ok": False, "error": str(exc)}


def _client_signals(base: str) -> dict[str, Any]:
    home = _get(f"{base}/")
    body = home.get("body") or ""
    parsed = _parse_html(body) if body else {}
    tel_links = len(re.findall(r'href=["\']tel:', body, re.I))
    forms = len(re.findall(r"<form\b", body, re.I))
    has_phone_text = bool(re.search(r"\+7[\s(]?\d{3}|8\s*\(?800|тел\.?", body, re.I))
    has_cta = bool(re.search(r"расч|заяв|консульт|под ключ", body, re.I))
    kontakty = _get(f"{base}/kontakty")
    k_body = kontakty.get("body") or ""
    kontakty_tel = len(re.findall(r'href=["\']tel:', k_body, re.I)) if kontakty.get("status") == 200 else 0
    return {
        "home_status": home.get("status"),
        "tel_links": tel_links,
        "kontakty_tel_links": kontakty_tel,
        "forms": forms,
        "has_phone_text": has_phone_text,
        "has_cta_text": has_cta,
        "title": parsed.get("title"),
        "description": parsed.get("description"),
    }


def run_site_check(
    *,
    site_url: str = SITE_URL,
    product_sample: int = 10,
    sitemap_sample: int = 20,
) -> dict[str, Any]:
    base = site_url.rstrip("/")
    catalog = _catalog_with_media()

    routes: list[dict[str, Any]] = []
    for path in KEY_ROUTES:
        resp = _get(f"{base}{path}")
        routes.append(
            {
                "path": path,
                "status": resp.get("status"),
                "ok": resp.get("status") == 200,
                "error": resp.get("error"),
            }
        )

    search = [_check_search(base, q) for q, _ in SEARCH_QUERIES]

    products: list[dict[str, Any]] = []
    sample = catalog if len(catalog) <= product_sample else random.sample(catalog, product_sample)
    for item in sample:
        resp = _get(item["url"])
        images = item.get("images") or []
        hero = images[0] if images else None
        hero_ok = None
        hero_status = None
        body = resp.get("body") or ""
        if not hero and body:
            live_hero = re.search(
                r'(?:src|href)="(/images/[^"]+\.(?:webp|jpg|jpeg|png)[^"]*)"',
                body,
                re.I,
            )
            if live_hero:
                hero = live_hero.group(1)
        if hero:
            _, hero_status = _resolve_image_url(base, hero)
            hero_ok = hero_status == 200
        model3d = item.get("model3d")
        glb_ok = None
        glb_status = None
        if not model3d and body:
            live_glb = re.search(r'(/[\w./-]+\.glb)', body, re.I)
            if live_glb:
                model3d = live_glb.group(1)
        if model3d:
            glb_url = model3d if str(model3d).startswith("http") else f"{base}{model3d}"
            glb_resp = _get(glb_url)
            glb_status = glb_resp.get("status")
            glb_ok = glb_resp.get("status") == 200
        products.append(
            {
                "slug": item["slug"],
                "path": item["path"],
                "page_status": resp.get("status"),
                "page_ok": resp.get("status") == 200,
                "hero": hero,
                "hero_status": hero_status,
                "hero_ok": hero_ok,
                "glb_ok": glb_ok,
                "glb_status": glb_status,
            }
        )

    sitemap_urls = _sample_sitemap_urls(base, sitemap_sample)
    sitemap_fail = [u for u in sitemap_urls if not u.get("ok") and "error" not in u]
    ssl_info = _ssl_expiry()
    client = _client_signals(base)

    photos_ok = sum(1 for p in products if p.get("hero_ok") is True)
    photos_total = sum(1 for p in products if p.get("hero_ok") is not None)
    pages_ok = sum(1 for r in routes if r.get("ok"))
    search_ok = sum(1 for s in search if s.get("ok"))

    return {
        "site_url": base,
        "routes": routes,
        "search": search,
        "products": products,
        "sitemap_sample": sitemap_urls,
        "sitemap_sample_failures": len(sitemap_fail),
        "sitemap_sample_size": len([u for u in sitemap_urls if "error" not in u]),
        "ssl": ssl_info,
        "client_signals": client,
        "summary": {
            "routes_ok": pages_ok,
            "routes_total": len(routes),
            "search_ok": search_ok,
            "search_total": len(search),
            "product_pages_ok": sum(1 for p in products if p.get("page_ok")),
            "product_sample": len(products),
            "photos_ok": photos_ok,
            "photos_total": photos_total,
            "glb_ok": sum(1 for p in products if p.get("glb_ok") is True),
            "glb_total": sum(1 for p in products if p.get("glb_ok") is not None),
        },
    }
