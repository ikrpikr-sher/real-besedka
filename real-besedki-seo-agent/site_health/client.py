from __future__ import annotations

import random
import re
from typing import Any

from config import SITE_URL
from site_health.http_probe import fetch, has_form, has_tel_links, parse_page
from sources.catalog import parse_catalog

INTERNAL_PATHS = (
    "/",
    "/katalog",
    "/blog",
    "/kontakty",
    "/uslugi",
    "/materialy",
    "/robots.txt",
    "/sitemap.xml",
)


def _pick_product_paths(n: int = 3) -> list[str]:
    catalog = parse_catalog()
    if not catalog:
        return []
    sample = catalog if len(catalog) <= n else random.sample(catalog, n)
    return [p["path"] for p in sample]


def check_internal_urls() -> dict[str, Any]:
    paths = list(INTERNAL_PATHS) + _pick_product_paths(3)
    issues: list[dict[str, Any]] = []
    results: list[dict[str, Any]] = []
    for path in paths:
        url = SITE_URL.rstrip("/") + path
        resp = fetch(url)
        status = resp.get("status")
        ok = status == 200 or (path == "/robots.txt" and status == 200)
        if path in ("/", "/katalog") and status != 200:
            issues.append(
                {
                    "priority": "P0",
                    "category": "availability",
                    "problem": f"Критическая страница {path} не 200",
                    "url": url,
                    "cause": resp.get("error") or f"HTTP {status}",
                    "impact": "Клиент не может пользоваться сайтом",
                    "fact_kind": "verified",
                }
            )
        elif path.startswith("/katalog/") and status != 200:
            issues.append(
                {
                    "priority": "P0",
                    "category": "catalog",
                    "problem": f"Карточка не открывается: {path}",
                    "url": url,
                    "cause": f"HTTP {status}",
                    "impact": "Клиент не видит товар",
                    "fact_kind": "verified",
                }
            )
        elif status and status >= 500:
            issues.append(
                {
                    "priority": "P0",
                    "category": "server",
                    "problem": f"5xx на {path}",
                    "url": url,
                    "cause": f"HTTP {status}",
                    "impact": "Ошибка сервера",
                    "fact_kind": "verified",
                }
            )
        results.append({"path": path, "status": status, "ok": ok, "error": resp.get("error")})
    return {"paths": results, "issues": issues}


def check_form_and_phone() -> dict[str, Any]:
    home = fetch(f"{SITE_URL}/")
    kontakty = fetch(f"{SITE_URL}/kontakty")
    home_body = home.get("body") or ""
    k_body = kontakty.get("body") or ""
    issues: list[dict[str, Any]] = []
    home_form = has_form(home_body)
    home_tel = has_tel_links(home_body)
    k_tel = has_tel_links(k_body)
    api_exists = bool(re.search(r'action=["\'][^"\']*/api/', home_body, re.I)) or bool(
        re.search(r"/api/leads", home_body)
    )
    if home.get("status") == 200 and not home_form:
        issues.append(
            {
                "priority": "P0",
                "category": "lead_form",
                "problem": "Форма заявки не найдена на главной",
                "url": f"{SITE_URL}/",
                "cause": "нет <form> в HTML",
                "impact": "Клиент не может оставить заявку",
                "fact_kind": "verified",
            }
        )
    if home.get("status") == 200 and not (home_tel or k_tel):
        issues.append(
            {
                "priority": "P0",
                "category": "phone",
                "problem": "Нет кликабельного tel: на главной/контактах",
                "url": f"{SITE_URL}/",
                "cause": "tel: ссылки не найдены",
                "impact": "Клиент не может позвонить с телефона",
                "fact_kind": "verified",
            }
        )
    return {
        "home_status": home.get("status"),
        "home_form": home_form,
        "home_tel": home_tel,
        "kontakty_tel": k_tel,
        "api_hint": api_exists,
        "note": "Реальные заявки не отправляются (read-only)",
        "issues": issues,
    }


def check_cdn_headers() -> dict[str, Any]:
    resp = fetch(f"{SITE_URL}/")
    headers = resp.get("headers") or {}
    server = headers.get("server", "")
    cf = any(k.startswith("cf-") for k in headers)
    issues: list[dict[str, Any]] = []
    return {
        "server": server,
        "cloudflare_headers": cf,
        "cf_ray": headers.get("cf-ray"),
        "x_powered_by": headers.get("x-powered-by"),
        "issues": issues,
        "note": "WAF/firewall rules требуют доступа к панели CDN — не проверено" if not cf else None,
    }
