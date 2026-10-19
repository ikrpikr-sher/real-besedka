from __future__ import annotations

import random
import re
from typing import Any

from config import SITE_URL
from site_health.http_probe import fetch

OG_RE = re.compile(
    r'<meta[^>]+(?:property|name)=["\']og:([^"\']+)["\'][^>]+content=["\']([^"\']*)["\']',
    re.I,
)
OG_RE_REV = re.compile(
    r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']og:([^"\']+)["\']',
    re.I,
)
H1_RE = re.compile(r"<h1\b[^>]*>([\s\S]*?)</h1>", re.I)
SLUG_H1_RE = re.compile(r"Категория[:\s]+[«\"]?([a-z0-9-]{3,})", re.I)


def parse_og(body: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for key, value in OG_RE.findall(body or ""):
        found[key.lower()] = value
    for value, key in OG_RE_REV.findall(body or ""):
        found.setdefault(key.lower(), value)
    return found


def parse_jsonld_types(body: str) -> list[str]:
    return re.findall(r'"@type"\s*:\s*"([^"]+)"', body or "")


def parse_h1(body: str) -> list[str]:
    out: list[str] = []
    for raw in H1_RE.findall(body or ""):
        text = re.sub(r"<[^>]+>", "", raw)
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            out.append(text)
    return out


def origin_healthy(internal: dict[str, Any], client: dict[str, Any], ua: dict[str, Any] | None = None) -> bool:
    """Origin считается живым: маршруты 200, форма и телефон на главной."""
    paths = internal.get("paths") or []
    if not paths or not all(p.get("ok") for p in paths):
        return False
    if not client.get("home_form") or not client.get("home_tel"):
        return False
    ua_results = (ua or {}).get("results") or []
    if ua_results and any((r.get("status") != 200) for r in ua_results):
        return False
    return True


def classify_product_og(og: dict[str, str]) -> str | None:
    """missing-image — P1; type-not-product — P2, если фото уже есть."""
    if not og.get("image"):
        return "missing-image"
    if (og.get("type") or "") != "product":
        return "type-not-product"
    return None


def _product_paths(n: int = 3) -> list[str]:
    from sources.catalog import parse_catalog

    catalog = parse_catalog()
    if not catalog:
        return ["/katalog/besedki-s-ostekleniem/b-22"]
    sample = catalog if len(catalog) <= n else random.sample(catalog, n)
    return [p["path"] for p in sample]


def _blog_category_paths() -> list[str]:
    from sources.live import _get

    resp = _get(f"{SITE_URL.rstrip('/')}/sitemap.xml")
    body = resp.get("body") or ""
    locs = re.findall(r"<loc>(https?://[^<]+/blog/category/[^<]+)</loc>", body, re.I)
    if locs:
        return [re.sub(r"^https?://[^/]+", "", loc.rstrip("/")) for loc in locs[:2]]
    return ["/blog/category/sovety"]


def check_live_onpage() -> dict[str, Any]:
    """SEO-сигналы с прода: товарный OG, ContactPage, H1 категорий блога."""
    issues: list[dict[str, Any]] = []
    pages: list[dict[str, Any]] = []

    og_bad: list[str] = []
    og_type_only: list[str] = []
    for path in _product_paths(3):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        og = parse_og(body)
        types = parse_jsonld_types(body)
        row = {
            "path": path,
            "status": resp.get("status"),
            "og_type": og.get("type"),
            "og_image": bool(og.get("image")),
            "og_title": og.get("title"),
            "jsonld": types,
        }
        pages.append(row)
        if resp.get("status") != 200:
            continue
        kind = classify_product_og(og)
        if kind == "missing-image":
            og_bad.append(path)
        elif kind == "type-not-product":
            og_type_only.append(path)

    if og_bad:
        issues.append(
            {
                "priority": "P1",
                "category": "on-page",
                "problem": "На карточках нет og:image",
                "url": f"{SITE_URL}{og_bad[0]}",
                "cause": f"выборка {', '.join(og_bad)}: нет og:image",
                "impact": "Превью в Telegram/VK/соцсетях без фото товара — слабее CTR шаринга",
                "fact_kind": "verified",
            }
        )
    if og_type_only:
        sampled = [p for p in pages if p.get("path") in og_type_only]
        has_product = bool(sampled) and all("Product" in (p.get("jsonld") or []) for p in sampled)
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": (
                    "На карточках og:type не product при живом og:image и JSON-LD Product"
                    if has_product
                    else "На карточках og:type не product при живом og:image"
                ),
                "url": f"{SITE_URL}{og_type_only[0]}",
                "cause": f"выборка {', '.join(og_type_only)}: og:type≠product, og:image есть",
                "impact": (
                    "Поиск уже видит Product. В мессенджерах ссылка может открыться как страница сайта, не как товар"
                    if has_product
                    else "В мессенджерах ссылка может открыться как страница сайта, не как товар"
                ),
                "fact_kind": "verified",
            }
        )

    kontakty = fetch(f"{SITE_URL.rstrip('/')}/kontakty")
    k_body = kontakty.get("body") or ""
    k_types = parse_jsonld_types(k_body)
    pages.append({"path": "/kontakty", "status": kontakty.get("status"), "jsonld": k_types})
    if kontakty.get("status") == 200 and "ContactPage" not in k_types:
        issues.append(
            {
                "priority": "P2",
                "category": "schema",
                "problem": "На /kontakty нет JSON-LD ContactPage",
                "url": f"{SITE_URL}/kontakty",
                "cause": f"типы: {', '.join(k_types) or 'нет'}",
                "impact": "Поиск хуже понимает страницу контактов",
                "fact_kind": "verified",
            }
        )

    for path in _blog_category_paths():
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        h1s = parse_h1(body)
        pages.append({"path": path, "status": resp.get("status"), "h1": h1s})
        slug_h1 = next((h for h in h1s if SLUG_H1_RE.search(h)), None)
        if resp.get("status") == 200 and slug_h1:
            issues.append(
                {
                    "priority": "P2",
                    "category": "on-page",
                    "problem": f"H1 категории блога — slug: «{slug_h1}»",
                    "url": f"{SITE_URL}{path}",
                    "cause": "title/H1 берут slug вместо человекочитаемого названия",
                    "impact": "Слабый сниппет категории в выдаче",
                    "fact_kind": "verified",
                }
            )
            break

    for path, needed in (
        ("/katalog", "BreadcrumbList"),
        ("/materialy/fanera-pol", "BreadcrumbList"),
        ("/materialy/metall-karkas", "BreadcrumbList"),
    ):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        types = parse_jsonld_types(body)
        pages.append({"path": path, "status": resp.get("status"), "jsonld": types})
        if resp.get("status") == 200 and needed not in types:
            issues.append(
                {
                    "priority": "P2",
                    "category": "schema",
                    "problem": f"На {path} нет JSON-LD {needed}",
                    "url": f"{SITE_URL}{path}",
                    "cause": f"типы: {', '.join(types) or 'нет'}",
                    "impact": "Хлебные крошки в выдаче не подтверждены разметкой",
                    "fact_kind": "verified",
                }
            )

    return {"pages": pages, "issues": issues}
