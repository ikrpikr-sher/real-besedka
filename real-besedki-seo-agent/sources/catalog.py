from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from config import SITE_CODE_ROOT, SITE_URL

PRODUCT_LOC_RE = re.compile(
    r"^https?://[^/]+/katalog/([^/]+)/([^/?#]+)/?$",
    re.I,
)


def _catalog_path(root: Path) -> Path | None:
    for candidate in (
        root / "data" / "katalog.json",
        root / "data" / "katalog.prod.json",
    ):
        if candidate.exists():
            return candidate
    return None


def parse_catalog_from_sitemap(sitemap_xml: str | None = None) -> list[dict[str, Any]]:
    """Карточки с прода, если lokal katalog.json нет. Цены не выдумываем."""
    body = sitemap_xml
    if body is None:
        from sources.live import _get

        resp = _get(f"{SITE_URL.rstrip('/')}/sitemap.xml")
        if resp.get("status") != 200:
            return []
        body = resp.get("body") or ""
    products: list[dict[str, Any]] = []
    seen: set[str] = set()
    for loc in re.findall(r"<loc>([^<]+)</loc>", body):
        match = PRODUCT_LOC_RE.match(loc.strip())
        if not match:
            continue
        category, slug = match.group(1), match.group(2)
        if category == "poisk":
            continue
        rel = f"/katalog/{category}/{slug}"
        if rel in seen:
            continue
        seen.add(rel)
        products.append(
            {
                "slug": slug,
                "category": category,
                "title": slug,
                "size": "",
                "priceFrom": None,
                "path": rel,
                "url": loc.rstrip("/"),
                "name": slug,
                "source": "sitemap",
            }
        )
    return products


def parse_catalog(repo_root: Path | None = None) -> list[dict[str, Any]]:
    root = repo_root or SITE_CODE_ROOT
    path = _catalog_path(root)
    if not path:
        return parse_catalog_from_sitemap()

    raw = json.loads(path.read_text(encoding="utf-8"))
    items = raw if isinstance(raw, list) else raw.get("items") or []
    products: list[dict[str, Any]] = []

    for item in items:
        if not isinstance(item, dict):
            continue
        slug = str(item.get("slug") or "").strip()
        category = str(item.get("category") or "").strip()
        if not slug or not category:
            continue
        title = str(item.get("title") or slug)
        size = str(item.get("size") or "")
        price = item.get("priceFrom")
        rel = f"/katalog/{category}/{slug}"
        products.append(
            {
                "slug": slug,
                "category": category,
                "title": title,
                "size": size,
                "priceFrom": price,
                "path": rel,
                "url": f"{SITE_URL}{rel}",
                "name": title,
                "source": "file",
            }
        )
    return products
