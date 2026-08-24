from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from config import SITE_CODE_ROOT, SITE_URL


def _catalog_path(root: Path) -> Path | None:
    for candidate in (
        root / "data" / "katalog.json",
        root / "data" / "katalog.prod.json",
    ):
        if candidate.exists():
            return candidate
    return None


def parse_catalog(repo_root: Path | None = None) -> list[dict[str, Any]]:
    root = repo_root or SITE_CODE_ROOT
    path = _catalog_path(root)
    if not path:
        return []

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
            }
        )
    return products
