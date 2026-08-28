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
SITE_HERO_IMAGE_RE = re.compile(r"hero-besedka|/images/hero[-_]", re.I)
POISK_SITEMAP_RE = re.compile(r"<loc>(https?://[^<]+/katalog/poisk/?)</loc>", re.I)


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


def og_image_is_generic(url: str | None) -> bool:
    """Сайтный hero /images/hero-besedka — не фото модели."""
    return bool(url and SITE_HERO_IMAGE_RE.search(url))


def product_og_issues(rows: list[dict[str, Any]], site_url: str = SITE_URL) -> list[dict[str, Any]]:
    """P1 только если нет og:image. type=website / общий hero — P2."""
    ok = [r for r in rows if r.get("status") == 200]
    if not ok:
        return []
    missing_image = [r["path"] for r in ok if not r.get("og_image")]
    not_product = [r["path"] for r in ok if (r.get("og_type") or "") != "product"]
    generic = [r["path"] for r in ok if r.get("og_image") and og_image_is_generic(r.get("og_image_url"))]
    issues: list[dict[str, Any]] = []
    if missing_image:
        issues.append(
            {
                "priority": "P1",
                "category": "on-page",
                "problem": "На карточках нет og:image",
                "url": f"{site_url.rstrip('/')}{missing_image[0]}",
                "cause": f"выборка {', '.join(missing_image)}: нет og:image",
                "impact": "Превью в Telegram/VK/соцсетях без фото — слабее CTR шаринга",
                "fact_kind": "verified",
            }
        )
        return issues
    if not_product or generic:
        parts: list[str] = []
        if not_product:
            parts.append("og:type≠product")
        if generic:
            parts.append("og:image=сайтный hero")
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "На карточках нет товарного og:type=product / уникального og:image",
                "url": f"{site_url.rstrip('/')}{(not_product or generic)[0]}",
                "cause": f"выборка {', '.join(sorted(set(not_product + generic)))}: {', '.join(parts)}",
                "impact": "Шаринг работает с общим фото; тип website хуже для товарной выдачи",
                "fact_kind": "verified",
            }
        )
    return issues


def titles_are_unique(titles: list[str]) -> bool | None:
    clean = [t.strip() for t in titles if t and t.strip()]
    if len(clean) < 2:
        return None
    return len(set(clean)) == len(clean)


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
    """SEO-сигналы с прода: товарный OG, ContactPage, H1 категорий блога, поиск."""
    from sources.live import _get

    issues: list[dict[str, Any]] = []
    pages: list[dict[str, Any]] = []
    product_rows: list[dict[str, Any]] = []

    for path in _product_paths(4):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        og = parse_og(body)
        types = parse_jsonld_types(body)
        title_m = re.search(r"<title>([\s\S]*?)</title>", body or "", re.I)
        title = re.sub(r"\s+", " ", title_m.group(1)).strip() if title_m else og.get("title") or ""
        row = {
            "path": path,
            "status": resp.get("status"),
            "og_type": og.get("type"),
            "og_image": bool(og.get("image")),
            "og_image_url": og.get("image") or "",
            "og_title": og.get("title"),
            "title": title,
            "jsonld": types,
        }
        pages.append(row)
        product_rows.append(row)

    issues.extend(product_og_issues(product_rows))

    katalog = fetch(f"{SITE_URL.rstrip('/')}/katalog")
    k_hub_types = parse_jsonld_types(katalog.get("body") or "")
    pages.append({"path": "/katalog", "status": katalog.get("status"), "jsonld": k_hub_types})
    if katalog.get("status") == 200 and "BreadcrumbList" not in k_hub_types:
        issues.append(
            {
                "priority": "P2",
                "category": "schema",
                "problem": "На хабе /katalog нет JSON-LD BreadcrumbList",
                "url": f"{SITE_URL}/katalog",
                "cause": f"типы: {', '.join(k_hub_types) or 'нет'}",
                "impact": "Хуже понимание иерархии каталога",
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

    sm = _get(f"{SITE_URL.rstrip('/')}/sitemap.xml")
    sm_body = sm.get("body") or ""
    poisk_in_sitemap = bool(POISK_SITEMAP_RE.search(sm_body))
    empty_search = fetch(f"{SITE_URL.rstrip('/')}/katalog/poisk")
    es_body = empty_search.get("body") or ""
    es_robots = ""
    rob = re.search(
        r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)',
        es_body,
        re.I,
    )
    if not rob:
        rob = re.search(
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']robots["\']',
            es_body,
            re.I,
        )
    if rob:
        es_robots = rob.group(1).lower()
    x_robots = ((empty_search.get("headers") or {}).get("x-robots-tag") or "").lower()
    empty_search_noindex = "noindex" in es_robots or "noindex" in x_robots
    pages.append(
        {
            "path": "/katalog/poisk",
            "status": empty_search.get("status"),
            "robots_meta": es_robots or None,
            "in_sitemap": poisk_in_sitemap,
        }
    )
    if empty_search.get("status") == 200 and poisk_in_sitemap and not empty_search_noindex:
        issues.append(
            {
                "priority": "P2",
                "category": "indexation",
                "problem": "Пустой /katalog/poisk в sitemap без noindex",
                "url": f"{SITE_URL}/katalog/poisk",
                "cause": "в sitemap есть /katalog/poisk, robots meta без noindex (у ?q= — noindex)",
                "impact": "Риск индекса тонкой страницы поиска",
                "fact_kind": "verified",
            }
        )

    ok_products = [r for r in product_rows if r.get("status") == 200]
    signals = {
        "product_og_image": bool(ok_products) and all(r.get("og_image") for r in ok_products),
        "product_og_type_product": bool(ok_products)
        and all((r.get("og_type") or "") == "product" for r in ok_products),
        "product_og_image_generic": any(og_image_is_generic(r.get("og_image_url")) for r in ok_products),
        "product_titles_unique": titles_are_unique(
            [str(r.get("title") or r.get("og_title") or "") for r in ok_products]
        ),
        "contact_page": "ContactPage" in k_types,
        "katalog_breadcrumbs": "BreadcrumbList" in k_hub_types,
        "blog_category_h1_human": blog_h1_human,
        "empty_search_in_sitemap": poisk_in_sitemap,
        "empty_search_noindex": empty_search_noindex,
    }
    return {"pages": pages, "issues": issues, "signals": signals}
