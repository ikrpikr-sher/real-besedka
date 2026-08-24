from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from config import SITE_URL
from site_health.http_probe import canonical_host, fetch
from site_health.models import HealthIssue

CANONICAL = SITE_URL.rstrip("/") + "/"

DOMAIN_VARIANTS = (
    "http://real-besedki.ru/",
    "https://real-besedki.ru/",
    "http://www.real-besedki.ru/",
    "https://www.real-besedki.ru/",
)


def check_domain_variants(path: str = "/") -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    issues: list[HealthIssue] = []
    suffix = path if path.startswith("/") else f"/{path}"

    for start_url in DOMAIN_VARIANTS:
        url = start_url.rstrip("/") + suffix
        resp = fetch(url, follow_redirects=True)
        final = (resp.get("final_url") or "").rstrip("/") + ("/" if suffix == "/" else suffix)
        expected = CANONICAL.rstrip("/") + suffix
        chain = resp.get("redirect_chain") or []
        loop = len(chain) > 8 or (resp.get("error") or "").find("loop") >= 0
        status = resp.get("status")
        ok = (
            status == 200
            and canonical_host(resp.get("final_url") or "") == "real-besedki.ru"
            and not loop
            and (suffix != "/" or (resp.get("final_url") or "").rstrip("/") + "/" == CANONICAL)
        )
        if start_url.startswith("http://") or "www." in start_url:
            # should redirect to https apex
            redirect_ok = canonical_host(resp.get("final_url") or "") == "real-besedki.ru"
            if not redirect_ok or loop:
                issues.append(
                    HealthIssue(
                        priority="P0",
                        category="redirect",
                        problem=f"Некорректный редирект с {url}",
                        url=url,
                        cause=resp.get("error") or f"final={resp.get('final_url')}",
                        impact="Клиент может не попасть на сайт или попасть на неверный URL",
                        fact_kind="verified",
                        evidence={"chain": chain, "status": status},
                    )
                )
        if status is None or status >= 500:
            issues.append(
                HealthIssue(
                    priority="P0",
                    category="availability",
                    problem=f"Недоступен {url}",
                    url=url,
                    cause=resp.get("error") or f"HTTP {status}",
                    impact="Сайт не открывается",
                    fact_kind="verified",
                    evidence={"status": status, "ssl_error": resp.get("ssl_error")},
                )
            )
        if resp.get("ssl_error"):
            issues.append(
                HealthIssue(
                    priority="P0",
                    category="ssl",
                    problem=f"SSL ошибка на {url}",
                    url=url,
                    cause=resp.get("error") or "ssl_error",
                    impact="Браузер блокирует сайт",
                    fact_kind="verified",
                )
            )
        results.append(
            {
                "start_url": url,
                "status": status,
                "final_url": resp.get("final_url"),
                "redirect_chain": chain,
                "redirect_count": resp.get("redirect_count"),
                "ok": ok,
                "error": resp.get("error"),
                "ssl_error": resp.get("ssl_error"),
            }
        )

    return {"canonical": CANONICAL, "variants": results, "issues": [i.to_dict() for i in issues]}


def check_path_redirect(path: str) -> dict[str, Any]:
    start = f"http://www.real-besedki.ru{path}"
    resp = fetch(start, follow_redirects=True)
    final_path = urlparse(resp.get("final_url") or "").path
    expected_path = path.split("?")[0]
    ok = final_path == expected_path and resp.get("status") == 200
    issue = None
    if not ok:
        issue = HealthIssue(
            priority="P0",
            category="redirect",
            problem="Потеря path при редиректе www→apex",
            url=start,
            cause=f"final_path={final_path}, expected={expected_path}",
            impact="Страница из поиска может открыть не тот URL",
            fact_kind="verified",
        ).to_dict()
    return {"start": start, "final_url": resp.get("final_url"), "ok": ok, "issue": issue}
