from __future__ import annotations

import re
from typing import Any

from config import SITE_URL
from site_health.http_probe import fetch, has_form, has_tel_links

VIEWPORTS = (375, 390, 430, 768, 1280, 1920)


def check_viewport_signals() -> dict[str, Any]:
    """HTML-сигналы мобилки без Playwright (факт из разметки)."""
    issues: list[dict[str, Any]] = []
    paths = ["/", "/katalog"]
    results: list[dict[str, Any]] = []

    for path in paths:
        resp = fetch(f"{SITE_URL.rstrip('/')}{path}")
        body = resp.get("body") or ""
        has_viewport = bool(re.search(r'name=["\']viewport["\']', body, re.I))
        has_mobile_nav = "mobile-nav" in body or "MobileNav" in body or 'id="mobile-nav' in body
        overflow_hidden_body = "overflow-x:hidden" in body.replace(" ", "") or "overflow-x: hidden" in body
        sticky_cta = "sticky" in body.lower() or "safe-area-inset" in body
        results.append(
            {
                "path": path,
                "status": resp.get("status"),
                "viewport_meta": has_viewport,
                "mobile_nav_hint": has_mobile_nav,
                "overflow_x_guard": overflow_hidden_body,
                "sticky_or_safe_area": sticky_cta,
                "has_form": has_form(body),
                "has_tel": has_tel_links(body),
            }
        )
        if resp.get("status") == 200 and not has_viewport:
            issues.append(
                {
                    "priority": "P0",
                    "category": "mobile",
                    "problem": f"Нет meta viewport на {path}",
                    "url": f"{SITE_URL}{path}",
                    "cause": "viewport meta отсутствует",
                    "impact": "Мобильная вёрстка может ломаться",
                    "fact_kind": "verified",
                }
            )
        if resp.get("status") == 200 and path == "/" and not has_mobile_nav:
            issues.append(
                {
                    "priority": "P1",
                    "category": "mobile",
                    "problem": "Мобильное меню не обнаружено в HTML главной",
                    "url": f"{SITE_URL}/",
                    "cause": "нет mobile-nav в разметке",
                    "impact": "Навигация на телефоне может быть неудобной",
                    "fact_kind": "not_verified",
                }
            )

    return {
        "viewports_planned": VIEWPORTS,
        "note": "Пиксельная проверка 375–1920 — этап 2 (Playwright). Сейчас: HTML-сигналы.",
        "pages": results,
        "issues": issues,
    }
