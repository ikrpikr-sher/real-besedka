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
TITLE_RE = re.compile(r"<title\b[^>]*>([\s\S]*?)</title>", re.I)
SLUG_H1_RE = re.compile(r"Категория[:\s]+[«\"]?([a-z0-9-]{3,})", re.I)
GENERIC_OG_IMAGE_RE = re.compile(r"/images/hero-besedka\.(?:jpe?g|webp|png)", re.I)
CYR_VOWELS = set("аеёиоуыэюяАЕЁИОУЫЭЮЯ")
MOJIBAKE_RE = re.compile(r"[ÐÑÃÂ�]")
ARTICLE_RE = re.compile(r"<article\b[^>]*>([\s\S]*?)</article>", re.I)


def parse_og(body: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for key, value in OG_RE.findall(body or ""):
        found[key.lower()] = value
    for value, key in OG_RE_REV.findall(body or ""):
        found.setdefault(key.lower(), value)
    return found


def parse_og_images(body: str) -> list[str]:
    found: list[str] = []
    for key, value in OG_RE.findall(body or ""):
        if key.lower() == "image" and value:
            found.append(value)
    for value, key in OG_RE_REV.findall(body or ""):
        if key.lower() == "image" and value:
            found.append(value)
    seen: set[str] = set()
    out: list[str] = []
    for url in found:
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


def product_specific_og_images(images: list[str]) -> list[str]:
    return [url for url in images if url and not GENERIC_OG_IMAGE_RE.search(url)]


def looks_garbled_ru(text: str) -> bool:
    """Сломанная кириллица: mojibake или слова без гласных (как 25.08 в блоге)."""
    if not text:
        return False
    if "�" in text or MOJIBAKE_RE.search(text):
        return True
    words = re.findall(r"[А-Яа-яЁё]{4,}", text)
    if not words:
        return False
    no_vowel = [w for w in words if not any(ch in CYR_VOWELS for ch in w)]
    return len(no_vowel) >= 2 or (len(no_vowel) == 1 and len(words) <= 3)


def _strip_tags(raw: str) -> str:
    text = re.sub(r"<[^>]+>", "", raw or "")
    return re.sub(r"\s+", " ", text).strip()


def parse_title(body: str) -> str:
    match = TITLE_RE.search(body or "")
    return _strip_tags(match.group(1)) if match else ""


def article_text_len(body: str) -> int:
    chunks = ARTICLE_RE.findall(body or "")
    return sum(len(_strip_tags(chunk)) for chunk in chunks)


def parse_jsonld_types(body: str) -> list[str]:
    return re.findall(r'"@type"\s*:\s*"([^"]+)"', body or "")


def parse_h1(body: str) -> list[str]:
    out: list[str] = []
    for raw in H1_RE.findall(body or ""):
        text = _strip_tags(raw)
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


def _sitemap_body() -> str:
    from sources.live import _get

    resp = _get(f"{SITE_URL.rstrip('/')}/sitemap.xml")
    return resp.get("body") or ""


def _blog_category_paths(sitemap_xml: str | None = None) -> list[str]:
    locs = re.findall(
        r"<loc>(https?://[^<]+/blog/category/[^<]+)</loc>",
        sitemap_xml if sitemap_xml is not None else _sitemap_body(),
        re.I,
    )
    if locs:
        return [re.sub(r"^https?://[^/]+", "", loc.rstrip("/")) for loc in locs[:2]]
    return ["/blog/category/sovety"]


def _recent_blog_post_paths(n: int = 6, sitemap_xml: str | None = None) -> list[str]:
    body = sitemap_xml if sitemap_xml is not None else _sitemap_body()
    pairs = re.findall(
        r"<url>\s*<loc>(https?://[^<]+/blog/[^<]+)</loc>\s*(?:<lastmod>([^<]+)</lastmod>)?",
        body,
        re.I | re.S,
    )
    posts: list[tuple[str, str]] = []
    for loc, lastmod in pairs:
        path = re.sub(r"^https?://[^/]+", "", loc.rstrip("/"))
        if "/blog/category/" in path or "/blog/tag/" in path or path == "/blog":
            continue
        posts.append((path, lastmod or ""))
    posts.sort(key=lambda row: row[1], reverse=True)
    if not posts:
        locs = re.findall(r"<loc>(https?://[^<]+/blog/[^<]+)</loc>", body, re.I)
        for loc in locs:
            path = re.sub(r"^https?://[^/]+", "", loc.rstrip("/"))
            if "/blog/category/" in path or "/blog/tag/" in path or path == "/blog":
                continue
            posts.append((path, ""))
    return [p for p, _ in posts[:n]]


def check_live_onpage() -> dict[str, Any]:
    """SEO-сигналы с прода: товарный OG, schema, H1 блога, поиск."""
    issues: list[dict[str, Any]] = []
    pages: list[dict[str, Any]] = []

    missing_product_image: list[str] = []
    wrong_og_type: list[str] = []
    product_titles: list[str] = []
    sitemap_xml = _sitemap_body()
    for path in _product_paths(5):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        og = parse_og(body)
        images = parse_og_images(body)
        specific = product_specific_og_images(images)
        types = parse_jsonld_types(body)
        title = parse_title(body)
        if title:
            product_titles.append(title)
        row = {
            "path": path,
            "status": resp.get("status"),
            "og_type": og.get("type"),
            "og_image": bool(images),
            "og_image_product": bool(specific),
            "og_title": og.get("title") or title,
            "jsonld": types,
        }
        pages.append(row)
        if resp.get("status") != 200:
            continue
        if not specific:
            missing_product_image.append(path)
        if og.get("type") != "product":
            wrong_og_type.append(path)

    if missing_product_image:
        issues.append(
            {
                "priority": "P1",
                "category": "on-page",
                "problem": "На карточках нет товарного og:image (только сайтный hero или пусто)",
                "url": f"{SITE_URL}{missing_product_image[0]}",
                "cause": f"выборка {', '.join(missing_product_image)}",
                "impact": "Превью в Telegram/VK/соцсетях без фото товара — слабее CTR шаринга",
                "fact_kind": "verified",
            }
        )
    elif wrong_og_type:
        issues.append(
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "На карточках og:type=website вместо product (og:image товара уже есть)",
                "url": f"{SITE_URL}{wrong_og_type[0]}",
                "cause": f"выборка {', '.join(wrong_og_type[:5])}",
                "impact": "Соцсети хуже понимают карточку как товар",
                "fact_kind": "verified",
            }
        )

    titles_unique = bool(product_titles) and len(set(product_titles)) == len(product_titles)

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

    katalog = fetch(f"{SITE_URL.rstrip('/')}/katalog")
    kat_types = parse_jsonld_types(katalog.get("body") or "")
    pages.append({"path": "/katalog", "status": katalog.get("status"), "jsonld": kat_types})
    if katalog.get("status") == 200 and "BreadcrumbList" not in kat_types:
        issues.append(
            {
                "priority": "P2",
                "category": "schema",
                "problem": "На хабе /katalog нет JSON-LD BreadcrumbList",
                "url": f"{SITE_URL}/katalog",
                "cause": f"типы: {', '.join(kat_types) or 'нет'}",
                "impact": "Крошки каталога не видны поиску",
                "fact_kind": "verified",
            }
        )

    blog_category_human = True
    for path in _blog_category_paths(sitemap_xml):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        h1s = parse_h1(body)
        pages.append({"path": path, "status": resp.get("status"), "h1": h1s})
        slug_h1 = next((h for h in h1s if SLUG_H1_RE.search(h)), None)
        if resp.get("status") == 200 and slug_h1:
            blog_category_human = False
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

    garbled_posts: list[str] = []
    for path in _recent_blog_post_paths(6, sitemap_xml):
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        title = parse_title(body)
        h1s = parse_h1(body)
        h1 = h1s[0] if h1s else ""
        pages.append(
            {
                "path": path,
                "status": resp.get("status"),
                "title": title,
                "h1": h1s,
                "article_len": article_text_len(body),
                "garbled": looks_garbled_ru(title) or looks_garbled_ru(h1),
            }
        )
        if resp.get("status") == 200 and (looks_garbled_ru(title) or looks_garbled_ru(h1)):
            garbled_posts.append(path)
    if garbled_posts:
        issues.append(
            {
                "priority": "P1",
                "category": "content",
                "problem": f"В блоге битая кириллица в title/H1: {', '.join(garbled_posts[:5])}",
                "url": f"{SITE_URL}{garbled_posts[0]}",
                "cause": "mojibake или выпавшие гласные в кириллице",
                "impact": "Статья не читается в выдаче и на странице",
                "fact_kind": "verified",
            }
        )

    poisk = fetch(f"{SITE_URL.rstrip('/')}/katalog/poisk")
    poisk_robots = ""
    robots_m = re.search(
        r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']*)["\']',
        poisk.get("body") or "",
        re.I,
    )
    if not robots_m:
        robots_m = re.search(
            r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']robots["\']',
            poisk.get("body") or "",
            re.I,
        )
    if robots_m:
        poisk_robots = robots_m.group(1)
    pages.append({"path": "/katalog/poisk", "status": poisk.get("status"), "robots": poisk_robots})
    if poisk.get("status") == 200 and "noindex" not in poisk_robots.lower():
        issues.append(
            {
                "priority": "P2",
                "category": "indexation",
                "problem": "Пустой /katalog/poisk без noindex (в sitemap есть служебный URL поиска)",
                "url": f"{SITE_URL}/katalog/poisk",
                "cause": f"robots={poisk_robots or 'нет'}",
                "impact": "Тонкая страница поиска может попасть в индекс",
                "fact_kind": "verified",
            }
        )

    return {
        "pages": pages,
        "issues": issues,
        "product_titles_unique": titles_unique,
        "product_title_sample": product_titles,
        "product_og_image_specific": not bool(missing_product_image),
        "product_og_type_ok": not bool(wrong_og_type),
        "blog_category_human": blog_category_human,
        "garbled_blog": garbled_posts,
    }
