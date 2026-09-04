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


def sitemap_path(loc: str) -> str:
    return re.sub(r"^https?://[^/]+", "", (loc or "").strip()).split("?", 1)[0].rstrip("/") or "/"


def sitemap_composition(locs: list[str]) -> dict[str, Any]:
    products = 0
    posts = 0
    tags = 0
    blog_cats = 0
    poisk: list[str] = []
    for loc in locs:
        path = sitemap_path(loc)
        if path == "/katalog/poisk" or path.startswith("/katalog/poisk/"):
            poisk.append(loc)
        elif re.fullmatch(r"/katalog/[^/]+/[^/]+", path):
            products += 1
        elif path.startswith("/blog/tag/"):
            tags += 1
        elif path.startswith("/blog/category/"):
            blog_cats += 1
        elif path.startswith("/blog/") and path != "/blog":
            posts += 1
    return {
        "products": products,
        "posts": posts,
        "tags": tags,
        "blog_cats": blog_cats,
        "poisk": poisk,
        "url_count": len(locs),
    }


def sitemap_growth_issues(locs: list[str], *, poisk_noindex: bool | None = None) -> list[dict[str, Any]]:
    """P2: empty /katalog/poisk without noindex; ≥50 blog tag URLs."""
    comp = sitemap_composition(locs)
    issues: list[dict[str, Any]] = []
    if comp["poisk"] and poisk_noindex is False:
        issues.append(
            {
                "priority": "P2",
                "category": "sitemap",
                "problem": "Пустой /katalog/poisk в sitemap без noindex",
                "url": comp["poisk"][0],
                "cause": "поисковый хаб без запроса в карте сайта, robots без noindex",
                "impact": "Индексация пустой выдачи поиска",
                "fact_kind": "verified",
            }
        )
    if comp["tags"] >= 50:
        issues.append(
            {
                "priority": "P2",
                "category": "sitemap",
                "problem": f"{comp['tags']} URL тегов блога в sitemap",
                "url": f"{CANONICAL_BASE}/sitemap.xml",
                "cause": "thin tag pages раздувают карту",
                "impact": "Краулер тратит бюджет на теги вместо карточек и статей",
                "fact_kind": "verified",
            }
        )
    return issues


def _poisk_is_noindex() -> bool:
    resp = fetch(f"{CANONICAL_BASE}/katalog/poisk")
    parsed = parse_page(resp.get("body") or "")
    robots = (parsed.get("robots_meta") or "").lower()
    x_robots = ((resp.get("headers") or {}).get("x-robots-tag") or "").lower()
    return "noindex" in robots or "noindex" in x_robots


def check_sitemap(sample_size: int = 15) -> dict[str, Any]:
    import random

    resp = fetch(f"{CANONICAL_BASE}/sitemap.xml")
    body = resp.get("body") or ""
    issues: list[dict[str, Any]] = []
    locs = re.findall(r"<loc>([^<]+)</loc>", body)
    composition = sitemap_composition(locs)
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
    poisk_noindex = None
    if composition["poisk"]:
        poisk_noindex = _poisk_is_noindex()
    issues.extend(sitemap_growth_issues(locs, poisk_noindex=poisk_noindex))
    return {
        "status": resp.get("status"),
        "url_count": len(locs),
        "composition": composition,
        "poisk_noindex": poisk_noindex,
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
