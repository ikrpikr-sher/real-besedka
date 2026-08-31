from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

from config import SITE_URL
from site_health.http_probe import fetch, parse_page

CANONICAL_BASE = SITE_URL.rstrip("/")
PRODUCT_PATH_RE = re.compile(r"^/katalog/[^/]+/[^/]+")
TAG_SITEMAP_WARN = 50


def sitemap_composition(locs: list[str]) -> dict[str, int]:
    counts = {
        "total": len(locs),
        "product": 0,
        "poisk": 0,
        "blog_tag": 0,
        "blog_post": 0,
        "blog_cat": 0,
        "other": 0,
    }
    for loc in locs:
        path = urlparse(loc).path
        if "/katalog/poisk" in path:
            counts["poisk"] += 1
        elif PRODUCT_PATH_RE.match(path):
            counts["product"] += 1
        elif "/blog/tag/" in path:
            counts["blog_tag"] += 1
        elif "/blog/category/" in path:
            counts["blog_cat"] += 1
        elif path.startswith("/blog"):
            counts["blog_post"] += 1
        else:
            counts["other"] += 1
    return counts


def sitemap_soft_issues(locs: list[str], poisk_robots: str | None = None) -> list[dict[str, Any]]:
    """P2: пустой поиск в карте без noindex; пачка тегов блога."""
    issues: list[dict[str, Any]] = []
    composition = sitemap_composition(locs)
    poisk_locs = [loc for loc in locs if "/katalog/poisk" in loc]
    if poisk_locs:
        robots = (poisk_robots or "").lower()
        if "noindex" not in robots:
            issues.append(
                {
                    "priority": "P2",
                    "category": "sitemap",
                    "problem": "Пустой /katalog/poisk в sitemap без noindex",
                    "url": poisk_locs[0],
                    "cause": f"robots={poisk_robots or 'нет'}",
                    "impact": "Тонкая страница поиска может попасть в индекс",
                    "fact_kind": "verified",
                }
            )
    if composition["blog_tag"] >= TAG_SITEMAP_WARN:
        issues.append(
            {
                "priority": "P2",
                "category": "sitemap",
                "problem": f"{composition['blog_tag']} URL тегов блога в sitemap",
                "url": f"{CANONICAL_BASE}/sitemap.xml",
                "cause": "теги — тонкие архивы, раздувают карту",
                "impact": "Краулер тратит бюджет на tag URL вместо карточек и статей",
                "fact_kind": "verified",
            }
        )
    return issues


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
    poisk_robots = None
    poisk_locs = [loc for loc in locs if "/katalog/poisk" in loc]
    if poisk_locs:
        parsed = parse_page(fetch(poisk_locs[0]).get("body") or "")
        poisk_robots = parsed.get("robots_meta")
    issues.extend(sitemap_soft_issues(locs, poisk_robots))
    composition = sitemap_composition(locs)
    return {
        "status": resp.get("status"),
        "url_count": len(locs),
        "composition": composition,
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
