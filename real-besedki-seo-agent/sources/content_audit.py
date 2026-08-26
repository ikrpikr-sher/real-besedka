from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from config import SITE_CODE_ROOT, SITE_URL

PROEKTY_LINK_RE = re.compile(r"\]\(/proekty[^)]*\)")


def _dpk_as_default_floor(text: str) -> bool:
    """ДПК как опция при поле фанера — не ошибка брифа."""
    lowered = text.lower()
    if "дпк" not in lowered:
        return False
    if "фанер" in lowered and ("опц" in lowered or "базов" in lowered):
        return False
    return "дпк" in lowered and "фанер" not in lowered


def _live_product_og() -> dict[str, Any]:
    from sources.catalog import parse_catalog
    from sources.live import _get
    from site_health.onpage import parse_og

    catalog = parse_catalog()
    if not catalog:
        return {"checked": False, "product_og_image": False, "product_og_type": None, "site_default_og": False}
    home = _get(f"{SITE_URL.rstrip('/')}/")
    home_og = parse_og(home.get("body") or "")
    item = catalog[0]
    resp = _get(item["url"])
    body = resp.get("body") or ""
    og = parse_og(body)
    og_image = bool(og.get("image"))
    site_default = bool(og_image and og.get("image") == home_og.get("image") and (og.get("type") or "") != "product")
    return {
        "checked": resp.get("status") == 200,
        "url": item.get("path"),
        "product_og_image": og_image and not site_default,
        "product_og_type": og.get("type"),
        "site_default_og": site_default,
        "og_image_url": og.get("image"),
    }


def _live_titles_unique(n: int = 8) -> dict[str, Any]:
    from sources.catalog import parse_catalog
    from sources.live import _get
    from site_health.onpage import parse_title

    catalog = parse_catalog()
    if not catalog:
        return {"checked": False, "unique": False, "sample": 0}
    sample = catalog[:n]
    titles: list[str] = []
    for item in sample:
        resp = _get(item["url"])
        if resp.get("status") != 200:
            continue
        title = parse_title(resp.get("body") or "")
        if title:
            titles.append(title)
    unique = len(titles) >= 4 and len(set(titles)) == len(titles)
    return {"checked": bool(titles), "unique": unique, "sample": len(titles)}


def audit_content(repo_root: Path | None = None) -> dict[str, Any]:
    root = repo_root or SITE_CODE_ROOT
    blog_dir = root / "content" / "blog"
    proekty_links = 0
    proekty_files: list[str] = []
    if blog_dir.exists():
        for path in sorted(blog_dir.glob("*.mdx")):
            text = path.read_text(encoding="utf-8")
            count = len(PROEKTY_LINK_RE.findall(text))
            if count:
                proekty_links += count
                proekty_files.append(f"{path.name} ({count})")

    product_meta = root / "app" / "katalog" / "[category]" / "[slug]" / "page.tsx"
    has_og_products = False
    if product_meta.exists():
        text = product_meta.read_text(encoding="utf-8")
        has_og_products = "openGraph" in text

    blog_category = root / "app" / "blog" / "category" / "[category]" / "page.tsx"
    blog_category_slug_h1 = False
    if blog_category.exists():
        text = blog_category.read_text(encoding="utf-8")
        blog_category_slug_h1 = "Категория:" in text or "category" in text.lower()

    seo_path = root / "data" / "seo.json"
    seo_home_dpk = False
    if seo_path.exists():
        seo_home_dpk = _dpk_as_default_floor(seo_path.read_text(encoding="utf-8"))

    live_og = _live_product_og()
    if live_og.get("checked") and live_og.get("product_og_image") and (live_og.get("product_og_type") or "") == "product":
        has_og_products = True
    live_titles = _live_titles_unique(8)

    return {
        "proekty_links": proekty_links,
        "proekty_files": proekty_files,
        "product_open_graph": has_og_products,
        "product_og_live": live_og,
        "live_titles_unique": bool(live_titles.get("unique")),
        "live_titles": live_titles,
        "blog_category_slug_h1": blog_category_slug_h1,
        "seo_json_mentions_dpk": seo_home_dpk,
        "site_code_missing": not root.exists(),
    }
