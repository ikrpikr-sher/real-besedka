from __future__ import annotations

import json
import os
import time
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen

from config import SITE_URL

PSI_URL = "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed"
TIMEOUT = 60
RETRY_WAIT_SEC = 25


def fetch_pagespeed(
    url: str | None = None,
    *,
    strategy: str = "mobile",
    site_url: str = SITE_URL,
) -> dict[str, Any]:
    target = url or site_url
    params = f"url={quote(target, safe='')}&strategy={strategy}&category=performance"
    api_key = os.environ.get("PAGESPEED_API_KEY", "").strip()
    if api_key:
        params += f"&key={quote(api_key)}"
    req = Request(
        f"{PSI_URL}?{params}",
        headers={"User-Agent": "real-besedki-seo-agent/1.0"},
    )
    data = None
    last_error = None
    for attempt in range(2):
        try:
            with urlopen(req, timeout=TIMEOUT) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            break
        except Exception as exc:
            last_error = exc
            if attempt == 0 and "429" in str(exc):
                time.sleep(RETRY_WAIT_SEC)
                continue
            return {
                "url": target,
                "strategy": strategy,
                "ok": False,
                "error": str(exc),
                "hint": "Задайте PAGESPEED_API_KEY или повторите позже (лимит PSI).",
            }
    if data is None:
        return {
            "url": target,
            "strategy": strategy,
            "ok": False,
            "error": str(last_error) if last_error else "PSI не ответил",
            "hint": "Задайте PAGESPEED_API_KEY или повторите позже (лимит PSI).",
        }

    lighthouse = data.get("lighthouseResult") or {}
    categories = lighthouse.get("categories") or {}
    perf = categories.get("performance") or {}
    audits = lighthouse.get("audits") or {}
    lcp = audits.get("largest-contentful-paint") or {}
    cls = audits.get("cumulative-layout-shift") or {}
    inp = audits.get("interaction-to-next-paint") or audits.get("experimental-interaction-to-next-paint") or {}

    score = perf.get("score")
    return {
        "url": target,
        "strategy": strategy,
        "ok": score is not None,
        "performance_score": round(score * 100) if isinstance(score, (int, float)) else None,
        "lcp_ms": lcp.get("numericValue"),
        "cls": cls.get("numericValue"),
        "inp_ms": inp.get("numericValue") if inp else None,
        "fetch_time": data.get("analysisUTCTimestamp"),
    }


def fetch_weekly_pagespeed(site_url: str = SITE_URL) -> dict[str, Any]:
    home = fetch_pagespeed(site_url, strategy="mobile")
    catalog = fetch_pagespeed(f"{site_url.rstrip('/')}/katalog", strategy="mobile")
    return {
        "home_mobile": home,
        "katalog_mobile": catalog,
        "note": "PageSpeed — раз в неделю. Без PAGESPEED_API_KEY возможен лимит Google PSI.",
    }
