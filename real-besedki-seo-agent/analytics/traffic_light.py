from __future__ import annotations

from typing import Any

Status = str  # ok | partial | fail | unknown


def _status(ok: bool | None, partial: bool = False) -> Status:
    if ok is True:
        return "ok"
    if partial:
        return "partial"
    if ok is False:
        return "fail"
    return "unknown"


def _label(status: Status) -> str:
    return {
        "ok": "да",
        "partial": "частично",
        "fail": "нет",
        "unknown": "н/д",
    }[status]


def compute_traffic_light(
    site_check: dict[str, Any] | None,
    live: dict[str, Any] | None,
    content: dict[str, Any] | None,
) -> dict[str, Any]:
    content = content or {}
    check = site_check or {}
    live = live or {}
    summary = check.get("summary") or {}
    client = check.get("client_signals") or {}
    robots = live.get("robots") or {}
    sitemap = live.get("sitemap") or {}

    # Открыть сайт
    routes_ok = summary.get("routes_ok", 0)
    routes_total = summary.get("routes_total") or 1
    open_ok = routes_ok == routes_total and client.get("home_status") == 200
    open_partial = routes_ok >= routes_total - 1 and client.get("home_status") == 200
    open_status = _status(open_ok, open_partial and not open_ok)

    # Посмотреть товар (фото + страницы)
    prod_ok = summary.get("product_pages_ok", 0)
    prod_n = summary.get("product_sample") or 1
    photos_ok = summary.get("photos_ok", 0)
    photos_n = summary.get("photos_total") or 1
    view_ok = prod_ok == prod_n and photos_ok == photos_n
    view_partial = prod_ok >= prod_n - 1 and photos_ok >= photos_n - 2
    view_status = _status(view_ok, view_partial and not view_ok)

    # Оставить заявку (сигналы на главной)
    lead_ok = bool(
        client.get("tel_links") or client.get("kontakty_tel_links") or client.get("has_phone_text")
    ) and bool(client.get("forms") or client.get("has_cta_text"))
    lead_partial = bool(
        client.get("tel_links")
        or client.get("kontakty_tel_links")
        or client.get("has_phone_text")
        or client.get("forms")
        or client.get("has_cta_text")
    )
    lead_status = _status(lead_ok, lead_partial and not lead_ok)

    # Найти в поиске (техника + поиск по сайту)
    search_ok = summary.get("search_ok", 0) == summary.get("search_total", 2)
    index_technical = bool(robots.get("exists")) and bool(sitemap.get("exists"))
    find_partial = index_technical or search_ok
    find_ok = index_technical and search_ok and not content.get("proekty_links")
    find_status = _status(find_ok, find_partial and not find_ok)

    blockers: list[str] = []
    if open_status != "ok":
        bad = [r["path"] for r in check.get("routes") or [] if not r.get("ok")]
        if bad:
            blockers.append(f"Не открываются: {', '.join(bad[:5])}")
    if view_status != "ok":
        if summary.get("photos_ok", 0) < summary.get("photos_total", 0):
            blockers.append("Битые hero-фото в выборке карточек")
        if summary.get("product_pages_ok", 0) < summary.get("product_sample", 0):
            blockers.append("Карточки товаров не 200")
    if lead_status != "ok":
        blockers.append("На главной слабые сигналы формы/телефона")
    if find_status != "ok":
        if not index_technical:
            blockers.append("robots/sitemap на проде")
        if not search_ok:
            blockers.append("Поиск B-51 / В51")
        if content.get("proekty_links"):
            blockers.append(f"{content['proekty_links']} ссылок /proekty в блоге")
        blockers.append("Нет данных Вебмастера/GSC — позиции не оцениваем")

    overall = "ok"
    if any(s == "fail" for s in (open_status, view_status, lead_status)):
        overall = "fail"
    elif any(s == "partial" for s in (open_status, view_status, lead_status, find_status)):
        overall = "partial"
    elif find_status == "unknown":
        overall = "partial"

    overall_label = {
        "ok": "клиент может пользоваться",
        "partial": "частично — есть замечания",
        "fail": "есть блокеры для клиента",
        "unknown": "н/д",
    }[overall]

    return {
        "overall": overall,
        "overall_label": overall_label,
        "open_site": {"status": open_status, "label": _label(open_status)},
        "view_product": {"status": view_status, "label": _label(view_status)},
        "submit_lead": {"status": lead_status, "label": _label(lead_status)},
        "find_in_search": {"status": find_status, "label": _label(find_status)},
        "blockers": blockers[:8],
    }


def render_traffic_light_block(light: dict[str, Any]) -> str:
    lines = [
        "## Светофор для клиента",
        "",
        f"**Итого:** {light.get('overall_label', 'н/д')}",
        "",
        "| Шаг | Статус |",
        "|-----|--------|",
        f"| Открыть сайт | {light['open_site']['label']} |",
        f"| Посмотреть товар (фото) | {light['view_product']['label']} |",
        f"| Оставить заявку / позвонить | {light['submit_lead']['label']} |",
        f"| Найти в выдаче (техника + поиск) | {light['find_in_search']['label']} |",
        "",
    ]
    blockers = light.get("blockers") or []
    if blockers:
        lines.append("**Что мешает:**")
        lines.extend(f"- {b}" for b in blockers)
    else:
        lines.append("**Что мешает:** —")
    lines.append("")
    return "\n".join(lines)
