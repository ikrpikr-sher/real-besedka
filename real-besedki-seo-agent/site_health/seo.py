from __future__ import annotations

import re
from typing import Any

from config import SITE_URL
from site_health.http_probe import fetch, parse_page

CANONICAL_BASE = SITE_URL.rstrip("/")


def check_robots() -> dict[str, Any]:
    resp = fetch(f"{CANONICAL_BASE}/robots.txt")
    body = resp.get("body") or ""
    issues: list[dict[str, Any]] = []
    global_disallow = bool(re.search(r"(?im)^user-agent:\s*\*\s*$[\s\S]*?^disallow:\s*/\s*$", body))
    has_sitemap = bool(re.search(r"(?im)^sitemap:", body))
    if resp.get("status") != 200:
        issues.append(
            {
                "priority": "P1",
                "category": "robots",
                "problem": "robots.txt недоступен",
                "url": f"{CANONICAL_BASE}/robots.txt",
                "cause": resp.get("error") or f"status {resp.get('status')}",
                "impact": "Поисковики могут индексировать неверно",
                "fact_kind": "verified",
            }
        )
    if global_disallow:
        issues.append(
            {
                "priority": "P0",
                "category": "robots",
                "problem": "Глобальный Disallow: / в robots.txt",
                "url": f"{CANONICAL_BASE}/robots.txt",
                "cause": "User-agent: * / Disallow: /",
                "impact": "Сайт закрыт от индексации",
                "fact_kind": "verified",
            }
        )
    if not has_sitemap:
        issues.append(
            {
                "priority": "P1",
                "category": "robots",
                "problem": "Нет Sitemap в robots.txt",
                "url": f"{CANONICAL_BASE}/robots.txt",
                "cause": "отсутствует директива Sitemap",
                "impact": "Хуже обнаружение страниц",
                "fact_kind": "verified",
            }
        )
    return {
        "status": resp.get("status"),
        "body_preview": body[:800],
        "global_disallow": global_disallow,
        "has_sitemap": has_sitemap,
        "issues": issues,
    }


def check_sitemap(sample_size: int = 15) -> dict[str, Any]:
    import random

    resp = fetch(f"{CANONICAL_BASE}/sitemap.xml")
    body = resp.get("body") or ""
    issues: list[dict[str, Any]] = []
    locs = re.findall(r"<loc>([^<]+)</loc>", body)
    bad_patterns = ("localhost", "127.0.0.1", "beget.app", "://www.")
    bad_locs = [loc for loc in locs if any(p in loc for p in bad_patterns)]
    if resp.get("status") != 200:
        issues.append(
            {
                "priority": "P1",
                "category": "sitemap",
                "problem": "sitemap.xml недоступен",
                "url": f"{CANONICAL_BASE}/sitemap.xml",
                "cause": resp.get("error") or f"status {resp.get('status')}",
                "impact": "Индексация страдает",
                "fact_kind": "verified",
            }
        )
    if bad_locs:
        issues.append(
            {
                "priority": "P1",
                "category": "sitemap",
                "problem": "sitemap содержит некорректные URL",
                "url": f"{CANONICAL_BASE}/sitemap.xml",
                "cause": ", ".join(bad_locs[:5]),
                "impact": "Поисковик может индексировать неверные адреса",
                "fact_kind": "verified",
            }
        )
    sample = locs if len(locs) <= sample_size else random.sample(locs, sample_size)
    sample_results = []
    failures = 0
    for loc in sample:
        r = fetch(loc)
        ok = r.get("status") == 200
        if not ok:
            failures += 1
        sample_results.append({"url": loc, "status": r.get("status"), "ok": ok})
    if failures >= max(3, sample_size // 3):
        issues.append(
            {
                "priority": "P1",
                "category": "sitemap",
                "problem": f"Массовые 404 в sitemap ({failures}/{len(sample)})",
                "url": f"{CANONICAL_BASE}/sitemap.xml",
                "cause": "выборка URL из sitemap",
                "impact": "Потеря доверия поисковиков",
                "fact_kind": "verified",
                "evidence": {"failures": failures, "sample": len(sample)},
            }
        )
    return {
        "status": resp.get("status"),
        "url_count": len(locs),
        "bad_locs": bad_locs[:10],
        "sample": sample_results,
        "sample_failures": failures,
        "issues": issues,
    }


def check_canonical(paths: list[str]) -> dict[str, Any]:
    issues: list[dict[str, Any]] = []
    results: list[dict[str, Any]] = []
    for path in paths:
        url = CANONICAL_BASE + path
        resp = fetch(url)
        parsed = parse_page(resp.get("body") or "")
        canonical = parsed.get("canonical") or ""
        ok = canonical.startswith("https://real-besedki.ru")
        robots = (parsed.get("robots_meta") or "").lower()
        noindex = "noindex" in robots
        x_robots = (resp.get("headers") or {}).get("x-robots-tag", "").lower()
        header_noindex = "noindex" in x_robots
        if not ok and resp.get("status") == 200:
            issues.append(
                {
                    "priority": "P1",
                    "category": "canonical",
                    "problem": f"Некорректный canonical на {path}",
                    "url": url,
                    "cause": canonical or "отсутствует",
                    "impact": "Дубли в поиске",
                    "fact_kind": "verified",
                }
            )
        if (noindex or header_noindex) and not path.startswith("/katalog/poisk"):
            pr = "P1" if path.startswith("/admin") else "P1"
            if path in ("/", "/katalog") or path.startswith("/katalog/"):
                pr = "P1"
            issues.append(
                {
                    "priority": pr,
                    "category": "noindex",
                    "problem": f"noindex на {path}",
                    "url": url,
                    "cause": parsed.get("robots_meta") or x_robots,
                    "impact": "Страница не попадёт в поиск",
                    "fact_kind": "verified",
                }
            )
        results.append(
            {
                "path": path,
                "status": resp.get("status"),
                "canonical": canonical,
                "robots_meta": parsed.get("robots_meta"),
                "x_robots_tag": x_robots,
            }
        )
    return {"pages": results, "issues": issues}
