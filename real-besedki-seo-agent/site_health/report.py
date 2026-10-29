from __future__ import annotations

from typing import Any


def render_health_report(health: dict[str, Any]) -> str:
    summary = health.get("summary") or {}
    lines = [
        "# Site Health — real-besedki.ru",
        "",
        f"Дата: {health.get('report_date')}",
        f"Сайт: {health.get('site_url')}",
        f"**Аварийный режим:** {'ДА (есть P0)' if health.get('emergency_mode') else 'нет'}",
        "",
        "## Сводка",
        "",
        f"- P0 (авария): **{summary.get('p0_count', 0)}**",
        f"- P1 (критическое SEO): **{summary.get('p1_count', 0)}**",
        f"- P2 (рост): **{summary.get('p2_count', 0)}**",
        "",
    ]

    for priority, title in (("P0", "P0 — АВАРИЯ"), ("P1", "P1 — Критическое SEO"), ("P2", "P2 — Рост")):
        items = [i for i in health.get("issues") or [] if i.get("priority") == priority]
        if not items:
            continue
        lines += [f"## {title}", ""]
        for issue in items:
            lines += [
                f"### {issue.get('problem')}",
                "",
                f"**ПРОБЛЕМА:** {issue.get('problem')}",
                f"**ВЛИЯНИЕ:** {issue.get('impact') or '—'}",
                f"**ПРИЧИНА:** {issue.get('cause') or '—'} ({issue.get('fact_kind', 'verified')})",
                f"**URL:** {issue.get('url') or '—'}",
                f"**ЧТО СДЕЛАНО:** {issue.get('fix') or '—'}",
                f"**ПРОВЕРКА:** {issue.get('verification') or '—'}",
                f"**СТАТУС:** {issue.get('status', 'open')}",
                "",
            ]

    checks = health.get("checks") or {}
    dns = checks.get("dns") or {}
    lines += [
        "## Техника (факты)",
        "",
        f"- DNS A: {', '.join(dns.get('a') or []) or '—'}",
        f"- DNS AAAA: {', '.join(dns.get('aaaa') or []) or 'нет'}",
        f"- NS: {', '.join(dns.get('ns') or []) or '—'}",
        f"- Cloudflare NS: {'да' if dns.get('cloudflare_ns') else 'нет'}",
        f"- CF headers на сайте: {'да' if (checks.get('cdn') or {}).get('cloudflare_headers') else 'нет'}",
        "",
    ]

    domains = (checks.get("domains") or {}).get("variants") or []
    if domains:
        lines.append("### Редиректы домена")
        lines.append("")
        lines.append("| URL | First hop | Final status | Final |")
        lines.append("|-----|-----------|--------------|-------|")
        for row in domains:
            first = row.get("first_status") if row.get("first_status") is not None else row.get("status")
            lines.append(
                f"| {row.get('start_url')} | {first} | {row.get('status')} | {row.get('final_url')} |"
            )
        lines.append("")

    ssl_hosts = (checks.get("ssl") or {}).get("hosts") or {}
    if ssl_hosts:
        lines.append("### SSL")
        lines.append("")
        for host, info in ssl_hosts.items():
            days = info.get("days_left")
            days_part = f" days_left={days}" if days is not None else ""
            lines.append(
                f"- {host}: ok={info.get('ok')} expires={info.get('expires')}{days_part} issuer={info.get('issuer')}"
            )
        lines.append("")

    sitemap = checks.get("sitemap") or {}
    composition = sitemap.get("composition") or {}
    if sitemap.get("url_count") or composition:
        lines.append("### Sitemap")
        lines.append("")
        lines.append(
            f"- URL: {sitemap.get('url_count') or composition.get('url_count') or '—'} · "
            f"SKU {composition.get('products', '—')} · "
            f"статьи {composition.get('posts', '—')} · "
            f"теги {composition.get('tags', '—')} · "
            f"хабы размера {composition.get('size_hubs', '—')} · "
            f"коммерческие посадочные {composition.get('commercial', '—')}"
        )
        by_cat = composition.get("products_by_category") or {}
        if by_cat:
            parts = [f"{cat} {count}" for cat, count in by_cat.items()]
            lines.append(f"- SKU по категориям: {', '.join(parts)}")
        lines.append("")

    lines.append("---")
    lines.append("Порядок работы агента: **P0 → P1 → P2**. При P0 (сайт лежит) SEO приостановлены.")
    lines.append("Cloudflare без прокси при живом origin — P1, действие владельца, SEO не блокирует.")
    lines.append("")
    return "\n".join(lines)
