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
TITLE_RE = re.compile(r"<title[^>]*>([\s\S]*?)</title>", re.I)
ARTICLE_RE = re.compile(r"<article\b[^>]*>([\s\S]*?)</article>", re.I)

# Транслит из slug → кириллическая основа, которая должна быть в title/H1.
# Ловит порчу вроде «теклопакет», «Бесека», «ваи по беседу».
BLOG_SLUG_STEMS = (
    ("steklopaket", "стеклопакет"),
    ("svai", "сваи"),
    ("moskovsk", "московск"),
    ("oblast", "област"),
    ("fasad", "фасад"),
    ("besedka", "беседк"),
    ("besedku", "беседк"),
    ("skolko", "скольк"),
    ("metallichesk", "металлическ"),
    ("mangal", "мангал"),
)

BROKEN_TITLE_FRAGMENTS = (
    "теклопакет",
    "ваи по беседу",
    "бесека",
    "пд ключ",
    "склько",
    "мсковск",
    "бласти",
)


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


def parse_title(body: str) -> str:
    match = TITLE_RE.search(body or "")
    if not match:
        return ""
    text = re.sub(r"<[^>]+>", "", match.group(1))
    return re.sub(r"\s+", " ", text).strip()


def article_text_len(body: str) -> int:
    raw = ARTICLE_RE.search(body or "")
    chunk = raw.group(1) if raw else ""
    text = re.sub(r"<script[\s\S]*?</script>", " ", chunk, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return len(text)


def slug_stems_missing(slug: str, title: str) -> list[str]:
    """Какие основы из slug отсутствуют в title/H1 (признак битой кириллицы)."""
    hay = (title or "").lower()
    missing: list[str] = []
    for token, stem in BLOG_SLUG_STEMS:
        if token in (slug or "") and stem not in hay:
            missing.append(f"{token}→{stem}")
    return missing


def _blog_article_locs(limit: int = 8) -> list[str]:
    from sources.live import _get

    resp = _get(f"{SITE_URL.rstrip('/')}/sitemap.xml")
    body = resp.get("body") or ""
    rows: list[tuple[str, str]] = []
    for block in re.findall(r"<url>([\s\S]*?)</url>", body):
        loc_m = re.search(r"<loc>([^<]+)</loc>", block)
        if not loc_m:
            continue
        loc = loc_m.group(1).strip()
        path = re.sub(r"^https?://[^/]+", "", loc.rstrip("/"))
        if not path.startswith("/blog/"):
            continue
        if path in ("/blog",) or path.startswith("/blog/category/") or path.startswith("/blog/tag/"):
            continue
        lastmod_m = re.search(r"<lastmod>([^<]+)</lastmod>", block)
        lastmod = lastmod_m.group(1) if lastmod_m else ""
        rows.append((lastmod, path))
    rows.sort(reverse=True)
    return [path for _, path in rows[:limit]]


def check_live_blog_quality() -> dict[str, Any]:
    """Свежие статьи блога: битые title/H1 и тонкий текст."""
    issues: list[dict[str, Any]] = []
    pages: list[dict[str, Any]] = []
    garbled: list[str] = []
    thin: list[str] = []

    for path in _blog_article_locs(8):
        slug = path.rsplit("/", 1)[-1]
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        title = parse_title(body)
        h1s = parse_h1(body)
        hay = " ".join([title, *h1s])
        missing = slug_stems_missing(slug, hay)
        broken = [frag for frag in BROKEN_TITLE_FRAGMENTS if frag in hay.lower()]
        length = article_text_len(body)
        row = {
            "path": path,
            "status": resp.get("status"),
            "title": title,
            "h1": h1s,
            "missing_stems": missing,
            "broken_fragments": broken,
            "article_len": length,
        }
        pages.append(row)
        if resp.get("status") == 200 and (missing or broken):
            garbled.append(path)
        if resp.get("status") == 200 and length and length < 500:
            thin.append(path)

    if garbled:
        issues.append(
            {
                "priority": "P1",
                "category": "content",
                "problem": f"В блоге битые title/H1 (выпали буквы): {', '.join(garbled[:5])}",
                "url": f"{SITE_URL}{garbled[0]}",
                "cause": "свежие статьи lastmod: slug-основа не находится в title/H1",
                "impact": "Сниппет в выдаче с опечатками, падает доверие и CTR",
                "fact_kind": "verified",
                "evidence": {"paths": garbled, "pages": [p for p in pages if p["path"] in garbled]},
            }
        )
    if thin:
        issues.append(
            {
                "priority": "P2",
                "category": "content",
                "problem": f"Тонкие статьи блога (<500 знаков в article): {', '.join(thin[:5])}",
                "url": f"{SITE_URL}{thin[0]}",
                "cause": "article короче 500 символов",
                "impact": "Слабый коммерческий ответ, риск фильтра качества",
                "fact_kind": "verified",
            }
        )
    return {"pages": pages, "issues": issues}


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

    og_bad: list[str] = []
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
        if resp.get("status") == 200 and (og.get("type") != "product" or not og.get("image")):
            og_bad.append(path)

    if og_bad:
        sample = pages[0] if pages else {}
        issues.append(
            {
                "priority": "P1",
                "category": "on-page",
                "problem": "На карточках нет товарного Open Graph (og:image + og:type=product)",
                "url": f"{SITE_URL}{og_bad[0]}",
                "cause": (
                    f"выборка {', '.join(og_bad)}: og:type={sample.get('og_type') or 'нет'}, "
                    "og:image сайтный (не hero товара) или отсутствует"
                ),
                "impact": "Превью в Telegram/VK/соцсетях без фото товара — слабее CTR шаринга",
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

    blog_q = check_live_blog_quality()
    pages.extend(blog_q.get("pages") or [])
    issues.extend(blog_q.get("issues") or [])
    return {"pages": pages, "issues": issues}
