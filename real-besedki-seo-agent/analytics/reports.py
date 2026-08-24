from __future__ import annotations

from pathlib import Path
from typing import Any

from analytics.metrics import count_by_severity
from analytics.traffic_light import render_traffic_light_block

ROOT = Path(__file__).resolve().parent.parent
REPORT_TEMPLATE = ROOT / "templates" / "report.md"


def _line(item: dict[str, Any]) -> str:
    return f"- [{item.get('severity')}] {item.get('area')} · {item.get('target')}: {item.get('message')}"


def _fill(template: str, values: dict[str, str]) -> str:
    out = template
    for key, val in values.items():
        out = out.replace("{{" + key + "}}", val)
    return out


def _bullet_block(rows: list[str], empty: str = "—") -> str:
    if not rows:
        return empty
    return "\n".join(f"- {row}" for row in rows)


def _pagespeed_summary(pagespeed: dict[str, Any]) -> str:
    if not pagespeed:
        return "не запускался (по понедельникам или флаг `--pagespeed`)"
    lines: list[str] = []
    for key, row in pagespeed.items():
        if not isinstance(row, dict) or key == "note":
            continue
        score = row.get("performance_score")
        if score is not None:
            lines.append(f"{row.get('url')}: **{score}/100** mobile (LCP {row.get('lcp_ms')} ms)")
        elif row.get("error"):
            lines.append(f"{row.get('url')}: {row.get('error')}")
    note = pagespeed.get("note")
    if note:
        lines.append(str(note))
    return "\n".join(lines) if lines else "н/д"


def render_report(snapshot: dict[str, Any], previous: dict[str, Any] | None = None) -> str:
    local = snapshot.get("local") or {}
    live = snapshot.get("live") or {}
    layout = local.get("layout") or {}
    seo_pages = local.get("seo") or {}
    home_seo = seo_pages.get("/") or {}
    pages = local.get("pages") or []
    home = next((p for p in pages if p.get("route") == "/"), {})
    live_home = next((p for p in (live.get("pages") or []) if p.get("path") == "/"), {})
    files = local.get("files") or {}
    robots = live.get("robots") or {}
    sitemap = live.get("sitemap") or {}
    counts = count_by_severity(snapshot.get("audit_findings") or [])
    content = snapshot.get("content") or {}
    traffic_light = snapshot.get("traffic_light") or {}
    pagespeed = snapshot.get("pagespeed") or {}

    home_title = live_home.get("title") or home_seo.get("title") or layout.get("title") or "н/д"
    home_desc = live_home.get("description") or home_seo.get("description") or layout.get("description") or "н/д"
    home_h1 = ", ".join(live_home.get("h1") or home.get("h1") or []) or "н/д"

    sitemap_label = "есть" if files.get("sitemap_ts") or files.get("public_sitemap") else "нет в репозитории"
    if live:
        sitemap_label += f" · прод {'200' if sitemap.get('exists') else sitemap.get('status') or 'н/д'}"
    robots_label = "есть" if files.get("robots_ts") or files.get("public_robots") else "нет в репозитории"
    if live:
        robots_label += f" · прод {'200' if robots.get('exists') else robots.get('status') or 'н/д'}"

    if previous:
        prev_counts = count_by_severity(previous.get("audit_findings") or [])
        changes = (
            f"Прошлый снимок: critical {prev_counts['critical']} → {counts['critical']}, "
            f"warning {prev_counts['warning']} → {counts['warning']}."
        )
    else:
        changes = "Первый снимок. Базы для сравнения нет."

    findings = snapshot.get("findings") or []
    proposals = snapshot.get("proposals") or []
    done = snapshot.get("done") or []

    template = REPORT_TEMPLATE.read_text(encoding="utf-8") if REPORT_TEMPLATE.exists() else ""

    values = {
        "report_date": str(snapshot.get("report_date") or ""),
        "site_url": str(snapshot.get("site_url") or ""),
        "mode": "ТОЛЬКО ЧТЕНИЕ" if snapshot.get("read_only") else "запись разрешена",
        "catalog_count": str(len(snapshot.get("catalog") or [])),
        "sitemap_count": str(sitemap.get("url_count") or "н/д"),
        "robots_status": "200" if robots.get("exists") else (str(robots.get("status") or "н/д")),
        "critical_count": str(counts["critical"]),
        "warning_count": str(counts["warning"]),
        "organic_traffic": "н/д — нет выгрузки Метрики",
        "organic_leads": "н/д — нет выгрузки Метрики",
        "index_status": "н/д — нет Вебмастера / GSC",
        "index_errors": "н/д",
        "home_title": home_title,
        "home_description": home_desc,
        "home_h1": home_h1,
        "traffic_block": (
            "Недостаточно данных для принятия решения. "
            "Нет выгрузки Яндекс Вебмастера, Google Search Console и Метрики."
        ),
        "best_urls": "н/д",
        "weak_urls": "н/д",
        "sitemap_label": sitemap_label,
        "robots_label": robots_label,
        "pages_count": str(len(pages)),
        "metrica_in_repo": "да" if local.get("metrica_in_repo") else "нет",
        "proekty_links": str(content.get("proekty_links") or 0),
        "traffic_light_block": render_traffic_light_block(traffic_light) if traffic_light else "н/д — запустите с `--no-live` без check или `main.py check`",
        "pagespeed_block": _pagespeed_summary(pagespeed),
        "changes_block": changes,
        "findings_block": _bullet_block(findings, "Недостаточно данных для принятия решения."),
        "done_block": _bullet_block(done, "Этап 1 — правок не вносилось."),
        "proposals_block": _bullet_block(proposals),
        "expected_effect": snapshot.get("expected_effect") or "",
    }

    if template:
        body = _fill(template, values)
        audit_lines = []
        for item in snapshot.get("audit_findings") or []:
            if item.get("severity") in {"critical", "warning"}:
                audit_lines.append(_line(item))
        if audit_lines:
            body += "\n---\n\n## Аудит (подробно)\n\n" + "\n".join(audit_lines) + "\n"
        return body.rstrip() + "\n"

    # fallback — старый формат
    lines = [
        "SEO — сегодня",
        "",
        f"Сайт: {values['site_url']}",
        f"Дата отчёта: {values['report_date']}",
        f"Режим: {values['mode']}",
        "",
        f"Товаров в каталоге: {values['catalog_count']}",
        f"sitemap: {sitemap_label}",
        f"robots: {robots_label}",
        "",
        f"Критических: {values['critical_count']}",
        f"Предупреждений: {values['warning_count']}",
        "",
        "Что обнаружено",
        "",
        values["findings_block"],
        "",
        "Что предлагается",
        "",
        values["proposals_block"],
    ]
    return "\n".join(lines).rstrip() + "\n"
