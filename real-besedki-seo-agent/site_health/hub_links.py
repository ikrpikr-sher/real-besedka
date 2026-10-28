from __future__ import annotations

import re
from typing import Any

from config import SITE_URL
from site_health.http_probe import fetch
from site_health.seo import sitemap_path

CANONICAL_BASE = SITE_URL.rstrip("/")
HUB_HREF_RE = re.compile(r"""href=["'](/katalog/([^/"'?#]+)/([^/"'?#]+))""", re.I)
JSONLD_BLOCK_RE = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)
JSONLD_CARD_RE = re.compile(
    r"https://real-besedki\.ru(/katalog/[^/\"'\s]+/[^/\"'\s]+)",
    re.I,
)
# Hub grid missing this many sitemap SKUs from both <a href> and JSON-LD is P2.
MISSING_BOTH_P2 = 10
MANGAL_HUB = "/katalog/besedki-s-mangalom"


def sku_by_category(locs: list[str]) -> dict[str, list[str]]:
    grouped: dict[str, list[str]] = {}
    for loc in locs:
        path = sitemap_path(loc)
        if not re.fullmatch(r"/katalog/[^/]+/[^/]+", path):
            continue
        if path.startswith("/katalog/razmer/") or path.startswith("/katalog/poisk"):
            continue
        cat = path.split("/")[2]
        grouped.setdefault(cat, []).append(path)
    return grouped


def hub_card_hrefs(html: str, category: str) -> set[str]:
    found: set[str] = set()
    for path, cat, _slug in HUB_HREF_RE.findall(html or ""):
        if cat == category:
            found.add(path.rstrip("/") or path)
    return found


def hub_jsonld_cards(html: str, category: str) -> set[str]:
    prefix = f"/katalog/{category}/"
    found: set[str] = set()
    blocks = JSONLD_BLOCK_RE.findall(html or "") or []
    for block in blocks:
        for path in JSONLD_CARD_RE.findall(block):
            clean = path.rstrip("/")
            if clean.startswith(prefix) and clean.count("/") == 3:
                found.add(clean)
    return found


def hub_missing_issue(
    *,
    hub_path: str,
    sitemap_skus: list[str],
    hrefs: set[str],
    jsonld: set[str],
) -> dict[str, Any] | None:
    mapped = {p.rstrip("/") for p in sitemap_skus}
    missing_href = sorted(mapped - hrefs)
    missing_both = sorted(mapped - hrefs - jsonld)
    if len(missing_both) < MISSING_BOTH_P2:
        return None
    sample = ", ".join(p.rsplit("/", 1)[-1] for p in missing_both[:8])
    more = f" и ещё {len(missing_both) - 8}" if len(missing_both) > 8 else ""
    return {
        "priority": "P2",
        "category": "internal",
        "problem": (
            f"Хаб {hub_path} не ссылается на {len(missing_both)} SKU из sitemap "
            f"(сетка {len(hrefs)}, JSON-LD {len(jsonld)}, карта {len(mapped)}; нет {sample}{more})"
        ),
        "url": f"{CANONICAL_BASE}{hub_path}",
        "cause": (
            f"в <a href> нет {len(missing_href)} карточек, "
            f"в JSON-LD нет {len(missing_both)}"
        ),
        "impact": "Новые карточки есть в карте, но хаб не передаёт внутренний вес",
        "fact_kind": "verified",
        "evidence": {
            "sitemap": len(mapped),
            "hrefs": len(hrefs),
            "jsonld": len(jsonld),
            "missing_both": missing_both,
        },
    }


def check_hub_links(locs: list[str] | None = None) -> dict[str, Any]:
    """P2: category hub HTML/JSON-LD lags sitemap SKUs (mangal «Огонь»)."""
    if locs is None:
        resp = fetch(f"{CANONICAL_BASE}/sitemap.xml")
        locs = re.findall(r"<loc>([^<]+)</loc>", resp.get("body") or "")
    grouped = sku_by_category(locs)
    issues: list[dict[str, Any]] = []
    hubs: list[dict[str, Any]] = []
    # Live gap is the mangal hub; other cats stay quiet unless they regress the same way.
    targets = [MANGAL_HUB]
    for hub_path in targets:
        cat = hub_path.rstrip("/").rsplit("/", 1)[-1]
        skus = grouped.get(cat) or []
        page = fetch(f"{CANONICAL_BASE}{hub_path}")
        html = page.get("body") or ""
        hrefs = hub_card_hrefs(html, cat)
        jsonld = hub_jsonld_cards(html, cat)
        row = {
            "path": hub_path,
            "status": page.get("status"),
            "sitemap": len(skus),
            "hrefs": len(hrefs),
            "jsonld": len(jsonld),
        }
        hubs.append(row)
        if page.get("status") != 200:
            continue
        issue = hub_missing_issue(
            hub_path=hub_path, sitemap_skus=skus, hrefs=hrefs, jsonld=jsonld
        )
        if issue:
            issues.append(issue)
    return {"hubs": hubs, "issues": issues}
