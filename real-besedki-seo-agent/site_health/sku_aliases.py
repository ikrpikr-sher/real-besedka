from __future__ import annotations

from typing import Any

from urllib.parse import urlparse

from config import SITE_URL
from site_health.http_probe import fetch

# Flagship article from TZ / weekday search. 02.10 it lived under остекление;
# 05.10 the live card is the open «Графит · Лофт» path. Old URL must 301.
CORE_SKUS = (
    {
        "label": "B-51",
        "current": "/katalog/otkrytye-besedki/b-51",
        "aliases": ("/katalog/besedki-s-ostekleniem/b-51",),
    },
)


def _normalize_path(url: str) -> str:
    raw = url or ""
    path = urlparse(raw).path if "://" in raw else raw.split("?", 1)[0]
    return path.rstrip("/") or "/"


def alias_needs_redirect(row: dict[str, Any], current_path: str) -> bool:
    """True when an old SKU URL is gone and does not 301 to the live card."""
    status = row.get("status")
    first = row.get("first_status")
    if first in (301, 308):
        final = _normalize_path(str(row.get("final_url") or ""))
        return final != current_path.rstrip("/")
    if status == 200:
        return False
    return status == 404


def check_sku_aliases() -> dict[str, Any]:
    """P1: live flagship card down, or historically indexed alias 404 without 301."""
    issues: list[dict[str, Any]] = []
    pages: list[dict[str, Any]] = []
    base = SITE_URL.rstrip("/")

    for sku in CORE_SKUS:
        current_path = sku["current"]
        current = fetch(f"{base}{current_path}")
        pages.append(
            {
                "path": current_path,
                "role": "current",
                "label": sku["label"],
                "status": current.get("status"),
                "first_status": current.get("first_status"),
                "final_url": current.get("final_url"),
            }
        )
        if current.get("status") != 200:
            issues.append(
                {
                    "priority": "P1",
                    "category": "catalog",
                    "problem": f"Карточка {sku['label']} не открывается: {current_path}",
                    "url": f"{base}{current_path}",
                    "cause": f"HTTP {current.get('status')}",
                    "impact": "Клиент и поиск не видят флагманскую модель из ТЗ",
                    "fact_kind": "verified",
                }
            )

        for alias in sku["aliases"]:
            row = fetch(f"{base}{alias}")
            pages.append(
                {
                    "path": alias,
                    "role": "alias",
                    "label": sku["label"],
                    "status": row.get("status"),
                    "first_status": row.get("first_status"),
                    "final_url": row.get("final_url"),
                }
            )
            if not alias_needs_redirect(row, current_path):
                continue
            issues.append(
                {
                    "priority": "P1",
                    "category": "redirect",
                    "problem": (
                        f"Старый URL {sku['label']} отдаёт {row.get('status')} "
                        f"без 301 на {current_path}"
                    ),
                    "url": f"{base}{alias}",
                    "cause": (
                        f"first_status={row.get('first_status')}, "
                        f"final={row.get('final_url')}"
                    ),
                    "impact": "Индексированный URL модели теряет сниппет и внутренние ссылки",
                    "fact_kind": "verified",
                }
            )

    return {"pages": pages, "issues": issues}
