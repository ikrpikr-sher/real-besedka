from __future__ import annotations

from typing import Any

from config import SITE_URL
from site_health.http_probe import fetch, has_form, has_tel_links, parse_page

USER_AGENTS = {
    "iphone_safari": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ),
    "android_chrome": (
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"
    ),
    "desktop_chrome": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "googlebot_smartphone": (
        "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 "
        "(compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    ),
    "googlebot_desktop": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "yandexbot": "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
    "yandex_mobile": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 "
        "Mobile/15E148 Safari/604.1 (compatible; YandexMobileBot/3.0; +http://yandex.com/bots)"
    ),
}

SEARCH_PARAMS = (
    "/?utm_source=yandex",
    "/?utm_source=google",
    "/?yclid=test123",
    "/?gclid=test456",
    "/?utm_source=yandex&utm_medium=cpc&yclid=test",
)


def _probe(path: str, ua_name: str, ua: str) -> dict[str, Any]:
    url = SITE_URL.rstrip("/") + path
    resp = fetch(url, user_agent=ua)
    body = resp.get("body") or ""
    parsed = parse_page(body) if resp.get("status") == 200 else {}
    return {
        "ua_name": ua_name,
        "path": path,
        "url": url,
        "status": resp.get("status"),
        "error": resp.get("error"),
        "ssl_error": resp.get("ssl_error"),
        "title": parsed.get("title"),
        "has_form": has_form(body),
        "has_tel": has_tel_links(body),
    }


def check_user_agents(paths: list[str] | None = None) -> dict[str, Any]:
    paths = paths or ["/", "/katalog"]
    results: list[dict[str, Any]] = []
    by_path: dict[str, dict[str, Any]] = {}

    for path in paths:
        by_path[path] = {}
        for name, ua in USER_AGENTS.items():
            row = _probe(path, name, ua)
            results.append(row)
            by_path[path][name] = row

    issues: list[dict[str, Any]] = []
    desktop_key = "desktop_chrome"
    for path, agents in by_path.items():
        desktop = agents.get(desktop_key) or {}
        d_status = desktop.get("status")
        for name, row in agents.items():
            if name == desktop_key:
                continue
            m_status = row.get("status")
            if d_status == 200 and m_status != 200:
                issues.append(
                    {
                        "priority": "P0",
                        "category": "user_agent",
                        "problem": f"Desktop 200, {name}={m_status} на {path}",
                        "url": row.get("url"),
                        "cause": row.get("error") or f"status {m_status}",
                        "impact": "Мобильные клиенты или боты не видят страницу",
                        "fact_kind": "verified",
                        "evidence": {"desktop": d_status, "mobile": m_status, "ua": name},
                    }
                )
            if row.get("ssl_error"):
                issues.append(
                    {
                        "priority": "P0",
                        "category": "ssl",
                        "problem": f"SSL ошибка для {name} на {path}",
                        "url": row.get("url"),
                        "cause": row.get("error"),
                        "impact": "Страница не открывается",
                        "fact_kind": "verified",
                    }
                )

    return {"results": results, "by_path": by_path, "issues": issues}


def check_search_params() -> dict[str, Any]:
    results = []
    issues = []
    for path in SEARCH_PARAMS:
        row = _probe(path, "iphone_safari", USER_AGENTS["iphone_safari"])
        results.append(row)
        if row.get("status") != 200:
            issues.append(
                {
                    "priority": "P0",
                    "category": "search_params",
                    "problem": f"URL с параметрами не отдаёт 200: {path}",
                    "url": row.get("url"),
                    "cause": row.get("error") or f"status {row.get('status')}",
                    "impact": "Переход из Яндекса/Google может не работать",
                    "fact_kind": "verified",
                }
            )
    return {"results": results, "issues": issues}
