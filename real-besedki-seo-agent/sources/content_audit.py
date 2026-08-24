from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from config import SITE_CODE_ROOT

PROEKTY_LINK_RE = re.compile(r"\]\(/proekty[^)]*\)")


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
        seo_home_dpk = "дпк" in seo_path.read_text(encoding="utf-8").lower()

    return {
        "proekty_links": proekty_links,
        "proekty_files": proekty_files,
        "product_open_graph": has_og_products,
        "blog_category_slug_h1": blog_category_slug_h1,
        "seo_json_mentions_dpk": seo_home_dpk,
    }
