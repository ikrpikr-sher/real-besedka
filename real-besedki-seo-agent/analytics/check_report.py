from __future__ import annotations

from typing import Any

from analytics.traffic_light import render_traffic_light_block


def render_check_report(
    site_check: dict[str, Any],
    traffic_light: dict[str, Any],
    pagespeed: dict[str, Any] | None = None,
) -> str:
    summary = site_check.get("summary") or {}
    ssl = site_check.get("ssl") or {}
    lines = [
        "# Site check — real-besedki.ru",
        "",
        f"Сайт: {site_check.get('site_url')}",
        "",
        render_traffic_light_block(traffic_light).rstrip(),
        "",
        "## Маршруты",
        "",
        f"OK: {summary.get('routes_ok')}/{summary.get('routes_total')}",
        "",
    ]
    for row in site_check.get("routes") or []:
        mark = "OK" if row.get("ok") else "FAIL"
        lines.append(f"- [{mark}] {row.get('path')} — {row.get('status')}")

    lines += ["", "## Поиск", ""]
    for row in site_check.get("search") or []:
        mark = "OK" if row.get("ok") else "FAIL"
        lines.append(f"- [{mark}] `{row.get('query')}` → {row.get('path')}")

    lines += [
        "",
        "## Карточки (выборка)",
        "",
        f"Страницы OK: {summary.get('product_pages_ok')}/{summary.get('product_sample')}",
        f"Hero-фото OK: {summary.get('photos_ok')}/{summary.get('photos_total')}",
        f"GLB OK: {summary.get('glb_ok')}/{summary.get('glb_total')}",
        "",
    ]
    for row in site_check.get("products") or []:
        if not row.get("page_ok") or row.get("hero_ok") is False:
            lines.append(
                f"- {row.get('slug')}: page={row.get('page_status')} hero={row.get('hero_status')}"
            )

    sm_fail = site_check.get("sitemap_sample_failures", 0)
    sm_size = site_check.get("sitemap_sample_size", 0)
    lines += ["", "## Sitemap (выборка)", "", f"404/ошибки: {sm_fail}/{sm_size}", ""]

    if ssl.get("expires"):
        lines.append(f"SSL до {ssl.get('expires')} ({ssl.get('days_left')} дн.)")
    elif ssl.get("error"):
        lines.append(f"SSL: {ssl.get('error')}")

    if pagespeed:
        lines += ["", "## PageSpeed (mobile)", ""]
        for key, row in pagespeed.items():
            if not isinstance(row, dict) or key == "note":
                continue
            if row.get("performance_score") is not None:
                lines.append(
                    f"- {row.get('url')}: {row.get('performance_score')}/100 "
                    f"LCP={row.get('lcp_ms')}ms CLS={row.get('cls')}"
                )
            elif row.get("error"):
                lines.append(f"- {row.get('url')}: {row.get('error')}")
        note = pagespeed.get("note")
        if note:
            lines.append(f"- {note}")

    lines.append("")
    return "\n".join(lines)
