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


# Root chrome is not a commercial landing. /uslugi/* and /materialy/* stay info.
SITEMAP_CHROME = frozenset(
    {
        "/",
        "/kontakty",
        "/o-kompanii",
        "/politika-konfidencialnosti",
        "/faq",
        "/regiony",
        "/dostavka-i-montazh",
        "/konfigurator",
        "/blog",
        "/katalog",
    }
)
SITEMAP_INFO_PREFIXES = ("/uslugi", "/materialy")
BLOG_POSTS_P2_THRESHOLD = 400
# 172 SKU in sitemap on 2026-10-02. Drop below this is a catalog/sitemap regression.
SKU_FLOOR = 160


def sitemap_composition(locs: list[str]) -> dict[str, Any]:
    products = 0
    posts = 0
    tags = 0
    blog_cats = 0
    size_hubs = 0
    commercial = 0
    info = 0
    poisk: list[str] = []
    products_by_category: dict[str, int] = {}
    for loc in locs:
        path = sitemap_path(loc)
        if path == "/katalog/poisk" or path.startswith("/katalog/poisk/"):
            poisk.append(loc)
        elif path == "/katalog/razmer" or path.startswith("/katalog/razmer/"):
            size_hubs += 1
        elif re.fullmatch(r"/katalog/[^/]+/[^/]+", path):
            products += 1
            cat = path.split("/")[2]
            products_by_category[cat] = products_by_category.get(cat, 0) + 1
        elif path.startswith("/blog/tag/"):
            tags += 1
        elif path.startswith("/blog/category/"):
            blog_cats += 1
        elif path.startswith("/blog/") and path != "/blog":
            posts += 1
        elif path in SITEMAP_CHROME or any(
            path == p or path.startswith(p + "/") for p in SITEMAP_INFO_PREFIXES
        ):
            info += 1
        elif path.count("/") == 1:
            commercial += 1
        else:
            info += 1
    return {
        "products": products,
        "products_by_category": dict(sorted(products_by_category.items())),
        "posts": posts,
        "tags": tags,
        "blog_cats": blog_cats,
        "size_hubs": size_hubs,
        "commercial": commercial,
        "info": info,
        "poisk": poisk,
        "url_count": len(locs),
    }


def leftover_poisk_issue(*, in_sitemap: bool, noindex: bool | None) -> dict[str, Any] | None:
    """Empty /katalog/poisk without noindex, even if already dropped from sitemap."""
    if in_sitemap or noindex is not False:
        return None
    return {
        "priority": "P2",
        "category": "sitemap",
        "problem": "Пустой /katalog/poisk без noindex (нет в sitemap)",
        "url": f"{CANONICAL_BASE}/katalog/poisk",
        "cause": "поисковый хаб без запроса открыт, robots без noindex",
        "impact": "Индексация пустой выдачи поиска",
        "fact_kind": "verified",
    }


INDEXABLE_SIZE_HUB_SAMPLE = "/katalog/razmer/4x4"


def missing_indexable_size_hubs_issue(
    locs: list[str],
    *,
    hub_status: int | None = None,
    hub_noindex: bool | None = None,
    hub_path: str = INDEXABLE_SIZE_HUB_SAMPLE,
) -> dict[str, Any] | None:
    """Size landings with index,follow must stay in sitemap (8 hubs were in map on 29.09)."""
    if sitemap_composition(locs)["size_hubs"] > 0:
        return None
    if hub_status != 200 or hub_noindex:
        return None
    return {
        "priority": "P2",
        "category": "sitemap",
        "problem": "Индексируемые хабы /katalog/razmer/* пропали из sitemap",
        "url": f"{CANONICAL_BASE}{hub_path}",
        "cause": f"{hub_path} отдаёт 200 без noindex, в карте 0 size hubs",
        "impact": "Посадочные по размеру хуже обнаруживаются, краулер уходит в теги",
        "fact_kind": "verified",
    }


def sitemap_growth_issues(locs: list[str], *, poisk_noindex: bool | None = None) -> list[dict[str, Any]]:
    """P2: empty /katalog/poisk without noindex; ≥50 blog tags; ≥400 blog posts; SKU drop."""
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
    if comp["posts"] >= BLOG_POSTS_P2_THRESHOLD:
        issues.append(
            {
                "priority": "P2",
                "category": "sitemap",
                "problem": f"{comp['posts']} URL статей блога в sitemap",
                "url": f"{CANONICAL_BASE}/sitemap.xml",
                "cause": f"карта раздута шаблонными/гео-сериями (порог {BLOG_POSTS_P2_THRESHOLD}; SKU {comp['products']})",
                "impact": "Краулер тратит бюджет на массовые статьи вместо карточек",
                "fact_kind": "verified",
            }
        )
    if comp["products"] and comp["products"] < SKU_FLOOR:
        issues.append(
            {
                "priority": "P2",
                "category": "sitemap",
                "problem": f"SKU в sitemap: {comp['products']} (порог {SKU_FLOOR}, 02.10 было 172)",
                "url": f"{CANONICAL_BASE}/sitemap.xml",
                "cause": "карточки сняты или сменили категорию без 301 со старых URL",
                "impact": "Меньше товарных URL в индексе, хуже покрытие каталога",
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
    poisk_noindex = _poisk_is_noindex()
    issues.extend(sitemap_growth_issues(locs, poisk_noindex=poisk_noindex))
    leftover = leftover_poisk_issue(in_sitemap=bool(composition["poisk"]), noindex=poisk_noindex)
    if leftover:
        issues.append(leftover)
    hub_status: int | None = None
    hub_noindex: bool | None = None
    if composition["size_hubs"] == 0:
        hub = fetch(f"{CANONICAL_BASE}{INDEXABLE_SIZE_HUB_SAMPLE}")
        hub_status = hub.get("status")
        parsed_hub = parse_page(hub.get("body") or "")
        robots_hub = (parsed_hub.get("robots_meta") or "").lower()
        x_robots_hub = ((hub.get("headers") or {}).get("x-robots-tag") or "").lower()
        hub_noindex = "noindex" in robots_hub or "noindex" in x_robots_hub
        missing_hubs = missing_indexable_size_hubs_issue(
            locs, hub_status=hub_status, hub_noindex=hub_noindex
        )
        if missing_hubs:
            issues.append(missing_hubs)
    return {
        "status": resp.get("status"),
        "url_count": len(locs),
        "composition": composition,
        "poisk_noindex": poisk_noindex,
        "size_hub_sample": {
            "path": INDEXABLE_SIZE_HUB_SAMPLE,
            "status": hub_status,
            "noindex": hub_noindex,
        },
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
