from __future__ import annotations

from datetime import date
from typing import Any

from config import SITE_URL
from site_health.client import check_cdn_headers, check_form_and_phone, check_internal_urls
from site_health.dns import check_dns
from site_health.domains import check_domain_variants, check_path_redirect
from site_health.onpage import check_live_onpage, origin_healthy
from site_health.seo import check_canonical, check_robots, check_sitemap
from site_health.server import check_server_logs
from site_health.ssl_check import check_all_ssl
from site_health.user_agents import check_search_params, check_user_agents
from site_health.viewport import check_viewport_signals


def _merge_issues(*parts: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for part in parts:
        for issue in part.get("issues") or []:
            key = f"{issue.get('priority')}|{issue.get('problem')}|{issue.get('url')}"
            if key in seen:
                continue
            seen.add(key)
            out.append(issue)
    order = {"P0": 0, "P1": 1, "P2": 2}
    out.sort(key=lambda i: (order.get(i.get("priority", "P2"), 9), i.get("category", "")))
    return out


def run_site_health(*, site_url: str = SITE_URL) -> dict[str, Any]:
    dns = check_dns("real-besedki.ru")
    domains = check_domain_variants("/")
    path_redirect = check_path_redirect("/katalog")
    ssl = check_all_ssl()
    internal = check_internal_urls()
    ua = check_user_agents(["/", "/katalog"])
    search_params = check_search_params()
    robots = check_robots()
    sitemap = check_sitemap()
    canonical_paths = ["/", "/katalog"] + [p["path"] for p in internal.get("paths", []) if p["path"].startswith("/katalog/")][:2]
    canonical = check_canonical(canonical_paths)
    client = check_form_and_phone()
    cdn = check_cdn_headers()
    server = check_server_logs()
    viewport = check_viewport_signals()
    onpage = check_live_onpage()

    dns_issues: list[dict[str, Any]] = []
    if dns.get("ipv6_declared") and dns.get("ipv6_reachable") is False:
        dns_issues.append(
            {
                "priority": "P0",
                "category": "dns",
                "problem": "AAAA объявлен, но IPv6 недоступен",
                "url": site_url,
                "cause": dns.get("ipv6_error") or "connection failed",
                "impact": "Часть мобильных сетей не откроет сайт",
                "fact_kind": "verified",
                "evidence": {"aaaa": dns.get("aaaa")},
            }
        )
    if not dns.get("a") and not dns.get("errors", {}).get("a"):
        dns_issues.append(
            {
                "priority": "P0",
                "category": "dns",
                "problem": "Нет A-записи для домена",
                "url": site_url,
                "cause": "A record empty",
                "impact": "Сайт недоступен",
                "fact_kind": "verified",
            }
        )
    if dns.get("cloudflare_ns") and not cdn.get("cloudflare_headers"):
        healthy = origin_healthy(internal, client, ua)
        dns_issues.append(
            {
                "priority": "P1" if healthy else "P0",
                "category": "cdn",
                "problem": "Cloudflare NS назначены, но прокси ещё не активен",
                "url": site_url,
                "cause": f"A={dns.get('a')}, нет cf-* headers",
                "impact": (
                    "Риск обрыва на LTE МО. Origin сейчас отвечает 200 — SEO не блокируем, "
                    "нужно оранжевое облако в кабинете Cloudflare"
                    if healthy
                    else "Маршрутизация до origin может обрываться на LTE; origin не подтверждён"
                ),
                "fact_kind": "verified",
                "status": "owner_action",
            }
        )

    ssl_issues: list[dict[str, Any]] = []
    for host in ssl.get("critical") or []:
        info = (ssl.get("hosts") or {}).get(host) or {}
        ssl_issues.append(
            {
                "priority": "P0",
                "category": "ssl",
                "problem": f"SSL проблема: {host}",
                "url": f"https://{host}/",
                "cause": info.get("error") or "certificate invalid",
                "impact": "Браузер блокирует сайт",
                "fact_kind": "verified",
            }
        )

    all_issues = _merge_issues(
        {"issues": domains.get("issues") or []},
        {"issues": [path_redirect["issue"]] if path_redirect.get("issue") else []},
        {"issues": dns_issues},
        {"issues": ssl_issues},
        ua,
        search_params,
        internal,
        client,
        robots,
        sitemap,
        canonical,
        cdn,
        server,
        viewport,
        onpage,
    )

    p0 = [i for i in all_issues if i.get("priority") == "P0"]
    p1 = [i for i in all_issues if i.get("priority") == "P1"]
    p2 = [i for i in all_issues if i.get("priority") == "P2"]

    return {
        "site_url": site_url,
        "report_date": date.today().isoformat(),
        "emergency_mode": bool(p0),
        "summary": {
            "p0_count": len(p0),
            "p1_count": len(p1),
            "p2_count": len(p2),
            "total_issues": len(all_issues),
        },
        "issues": all_issues,
        "checks": {
            "dns": dns,
            "domains": domains,
            "path_redirect": path_redirect,
            "ssl": ssl,
            "internal_urls": internal,
            "user_agents": ua,
            "search_params": search_params,
            "robots": robots,
            "sitemap": sitemap,
            "canonical": canonical,
            "client": client,
            "cdn": cdn,
            "server": server,
            "viewport": viewport,
            "onpage": onpage,
        },
    }
