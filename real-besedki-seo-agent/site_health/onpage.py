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
GENERIC_OG_RE = re.compile(r"/images/hero-besedka(?:\.|$)", re.I)


def parse_og(body: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for key, value in OG_RE.findall(body or ""):
        found[key.lower()] = value
    for value, key in OG_RE_REV.findall(body or ""):
        found.setdefault(key.lower(), value)
    return found


def parse_jsonld_types(body: str) -> list[str]:
    return re.findall(r'"@type"\s*:\s*"([^"]+)"', body or "")


def classify_product_og(og: dict[str, str]) -> dict[str, bool]:
    """og:image есть = превью работает. Нет фото — P1. type≠product / общий hero — P2."""
    image = og.get("image") or ""
    return {
        "has_image": bool(image),
        "generic_hero": bool(image) and bool(GENERIC_OG_RE.search(image)),
        "type_product": (og.get("type") or "") == "product",
    }


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

    no_image: list[str] = []
    generic_hero: list[str] = []
    wrong_type: list[str] = []
    og_titles: list[str] = []
    for path in _product_paths(3):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        og = parse_og(body)
        flags = classify_product_og(og)
        types = parse_jsonld_types(body)
        row = {
            "path": path,
            "status": resp.get("status"),
            "og_type": og.get("type"),
            "og_image": flags["has_image"],
            "og_image_url": og.get("image"),
            "og_title": og.get("title"),
            "og_generic_hero": flags["generic_hero"],
            "jsonld": types,
        }
        pages.append(row)
        if resp.get("status") != 200:
            continue
        if not flags["has_image"]:
            no_image.append(path)
        elif flags["generic_hero"]:
            generic_hero.append(path)
        if not flags["type_product"]:
            wrong_type.append(path)
        if og.get("title"):
            og_titles.append(og["title"])

    if no_image:
        issues.append(
            {
                "priority": "P1",
                "category": "on-page",
                "problem": "На карточках нет og:image",
                "url": f"{SITE_URL}{no_image[0]}",
                "cause": f"выборка {', '.join(no_image)}: нет og:image",
                "impact": "Превью в Telegram/VK/соцсетях без фото товара — слабее CTR шаринга",
                "fact_kind": "verified",
            }
        )
    elif generic_hero:
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "og:image карточек — общий hero сайта, не фото модели",
                "url": f"{SITE_URL}{generic_hero[0]}",
                "cause": f"выборка {', '.join(generic_hero)}: /images/hero-besedka",
                "impact": "В шаринге одна и та же обложка, не товар",
                "fact_kind": "verified",
            }
        )
    if wrong_type and not no_image:
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "og:type карточек = website, не product",
                "url": f"{SITE_URL}{wrong_type[0]}",
                "cause": f"выборка {', '.join(wrong_type)}: og:image есть, og:type≠product",
                "impact": "Соцсети могут не взять товарный сниппет; превью с фото уже есть",
                "fact_kind": "verified",
            }
        )
    if og_titles and len(og_titles) != len(set(og_titles)):
        first_product = next((p["path"] for p in pages if p.get("og_title")), "/katalog")
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "В выборке карточек повторяются og:title",
                "url": f"{SITE_URL}{first_product}",
                "cause": "одинаковые og:title на разных URL",
                "impact": "Слабая уникальность сниппета в шаринге",
                "fact_kind": "verified",
            }
        )

    katalog = fetch(f"{SITE_URL.rstrip('/')}/katalog")
    k_hub_body = katalog.get("body") or ""
    k_hub_types = parse_jsonld_types(k_hub_body)
    pages.append({"path": "/katalog", "status": katalog.get("status"), "jsonld": k_hub_types})
    if katalog.get("status") == 200 and "BreadcrumbList" not in k_hub_types:
        issues.append(
            {
                "priority": "P2",
                "category": "schema",
                "problem": "На хабе /katalog нет JSON-LD BreadcrumbList",
                "url": f"{SITE_URL}/katalog",
                "cause": f"типы: {', '.join(k_hub_types) or 'нет'}",
                "impact": "Поиск хуже понимает иерархию каталога",
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

    return {"pages": pages, "issues": issues}
