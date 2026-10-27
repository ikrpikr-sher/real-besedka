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
        # Search and sitemap have one live card. Old category paths must 301.
        "aliases": (
            "/katalog/besedki-s-ostekleniem/b-51",
            "/katalog/besedki-s-mangalom/b-51",
        ),
    },
)

# 07.10 sitemap: 5 SKU under /katalog/loft/. Live cards are the long slug.
CATEGORY_RELOCATIONS = (
    {
        "label": "лофт",
        "old_prefix": "/katalog/loft",
        "new_prefix": "/katalog/besedki-osteklennye-loft",
        "slugs": ("b-53", "b-54", "b-55", "b-62", "b-63"),
    },
)


def relocation_old_paths(move: dict[str, Any]) -> tuple[str, ...]:
    old = str(move["old_prefix"]).rstrip("/")
    slugs = tuple(f"{old}/{slug}" for slug in (move.get("slugs") or ()))
    return (old,) + slugs


def relocation_new_path(move: dict[str, Any], old_path: str) -> str:
    old = str(move["old_prefix"]).rstrip("/")
    new = str(move["new_prefix"]).rstrip("/")
    path = old_path.rstrip("/") or "/"
    if path == old:
        return new
    return f"{new}/{path.rsplit('/', 1)[-1]}"


def relocation_problem(label: str, bad_old_paths: list[str], new_prefix: str) -> str:
    return (
        f"Категория {label} сменила slug: {', '.join(bad_old_paths)} "
        f"отдают 404 без 301 на {new_prefix.rstrip('/')}"
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
                        f"Старый URL {sku['label']} {alias} отдаёт {row.get('status')} "
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

    for move in CATEGORY_RELOCATIONS:
        new_hub = str(move["new_prefix"]).rstrip("/")
        hub = fetch(f"{base}{new_hub}")
        pages.append(
            {
                "path": new_hub,
                "role": "current",
                "label": move["label"],
                "status": hub.get("status"),
                "first_status": hub.get("first_status"),
                "final_url": hub.get("final_url"),
            }
        )
        if hub.get("status") != 200:
            continue
        bad: list[str] = []
        for old_path in relocation_old_paths(move):
            target = relocation_new_path(move, old_path)
            if old_path != str(move["old_prefix"]).rstrip("/"):
                current = fetch(f"{base}{target}")
                pages.append(
                    {
                        "path": target,
                        "role": "current",
                        "label": move["label"],
                        "status": current.get("status"),
                        "first_status": current.get("first_status"),
                        "final_url": current.get("final_url"),
                    }
                )
                if current.get("status") != 200:
                    continue
            row = fetch(f"{base}{old_path}")
            pages.append(
                {
                    "path": old_path,
                    "role": "alias",
                    "label": move["label"],
                    "status": row.get("status"),
                    "first_status": row.get("first_status"),
                    "final_url": row.get("final_url"),
                }
            )
            if alias_needs_redirect(row, target):
                bad.append(old_path)
        if not bad:
            continue
        issues.append(
            {
                "priority": "P1",
                "category": "redirect",
                "problem": relocation_problem(str(move["label"]), bad, new_hub),
                "url": f"{base}{bad[0]}",
                "cause": f"старый префикс {move['old_prefix']} снят без Location",
                "impact": "Индексированные URL категории и карточек теряют сниппет",
                "fact_kind": "verified",
            }
        )

    return {"pages": pages, "issues": issues}
