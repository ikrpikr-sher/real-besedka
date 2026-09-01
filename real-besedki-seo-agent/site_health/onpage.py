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
GENERIC_HERO_RE = re.compile(r"/images/hero-besedka", re.I)
TITLE_RE = re.compile(r"<title>([^<]+)</title>", re.I)


def classify_product_og(og: dict[str, str]) -> list[str]:
    """Виды проблем OG: missing_image (P1), generic_hero (P2), type_website (P2)."""
    image = og.get("image") or ""
    og_type = (og.get("type") or "").lower()
    kinds: list[str] = []
    if not image:
        kinds.append("missing_image")
        return kinds
    if GENERIC_HERO_RE.search(image):
        kinds.append("generic_hero")
    if og_type != "product":
        kinds.append("type_website")
    return kinds


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

    missing_image: list[str] = []
    type_website: list[str] = []
    generic_hero: list[str] = []
    titles: list[str] = []
    has_og_image = False
    product_og_type: str | None = None

    for path in _product_paths(5):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        og = parse_og(body)
        types = parse_jsonld_types(body)
        title_m = TITLE_RE.search(body)
        title = (title_m.group(1).strip() if title_m else "") or (og.get("title") or "")
        if title:
            titles.append(title)
        kinds = classify_product_og(og) if resp.get("status") == 200 else []
        if og.get("image"):
            has_og_image = True
        if og.get("type"):
            product_og_type = og.get("type")
        row = {
            "path": path,
            "status": resp.get("status"),
            "og_type": og.get("type"),
            "og_image": bool(og.get("image")),
            "og_image_url": og.get("image"),
            "og_title": og.get("title"),
            "title": title,
            "jsonld": types,
            "og_kinds": kinds,
        }
        pages.append(row)
        if "missing_image" in kinds:
            missing_image.append(path)
        if "type_website" in kinds:
            type_website.append(path)
        if "generic_hero" in kinds:
            generic_hero.append(path)

    if missing_image:
        issues.append(
            {
                "priority": "P1",
                "category": "on-page",
                "problem": "На карточках нет og:image",
                "url": f"{SITE_URL}{missing_image[0]}",
                "cause": f"выборка {', '.join(missing_image)}: нет og:image",
                "impact": "Превью в Telegram/VK/соцсетях без фото товара — слабее CTR шаринга",
                "fact_kind": "verified",
            }
        )
    if type_website:
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "og:type=website на карточках (фото есть — это не «нет OG»)",
                "url": f"{SITE_URL}{type_website[0]}",
                "cause": f"выборка {', '.join(type_website)}: og:type≠product, og:image есть",
                "impact": "Соцсети и поиск хуже понимают карточку как товар",
                "fact_kind": "verified",
            }
        )
    if generic_hero:
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "og:image карточки — общий hero сайта, не фото модели",
                "url": f"{SITE_URL}{generic_hero[0]}",
                "cause": f"выборка {', '.join(generic_hero)}: /images/hero-besedka",
                "impact": "В превью шаринга не видно конкретной модели",
                "fact_kind": "verified",
            }
        )

    kontakty = fetch(f"{SITE_URL.rstrip('/')}/kontakty")
    k_body = kontakty.get("body") or ""
    k_types = parse_jsonld_types(k_body)
    has_contact_page = "ContactPage" in k_types
    pages.append({"path": "/kontakty", "status": kontakty.get("status"), "jsonld": k_types})
    if kontakty.get("status") == 200 and not has_contact_page:
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

    katalog = fetch(f"{SITE_URL.rstrip('/')}/katalog")
    kat_body = katalog.get("body") or ""
    kat_types = parse_jsonld_types(kat_body)
    has_katalog_breadcrumbs = "BreadcrumbList" in kat_types
    pages.append({"path": "/katalog", "status": katalog.get("status"), "jsonld": kat_types})
    if katalog.get("status") == 200 and not has_katalog_breadcrumbs:
        issues.append(
            {
                "priority": "P2",
                "category": "schema",
                "problem": "На /katalog нет JSON-LD BreadcrumbList",
                "url": f"{SITE_URL}/katalog",
                "cause": f"типы: {', '.join(kat_types) or 'нет'}",
                "impact": "Хабу каталога хуже хлебные крошки в выдаче",
                "fact_kind": "verified",
            }
        )

    blog_h1_human = True
    for path in _blog_category_paths():
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        h1s = parse_h1(body)
        pages.append({"path": path, "status": resp.get("status"), "h1": h1s})
        slug_h1 = next((h for h in h1s if SLUG_H1_RE.search(h)), None)
        if resp.get("status") == 200 and slug_h1:
            blog_h1_human = False
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

    titles_unique = len(titles) >= 2 and len(set(titles)) == len(titles)

    return {
        "pages": pages,
        "issues": issues,
        "product_titles_unique": titles_unique,
        "has_contact_page": has_contact_page,
        "has_katalog_breadcrumbs": has_katalog_breadcrumbs,
        "blog_h1_human": blog_h1_human,
        "product_og_image": has_og_image,
        "product_og_type": product_og_type,
    }
