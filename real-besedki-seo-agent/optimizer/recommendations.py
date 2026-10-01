from __future__ import annotations

from typing import Any


def build_findings(snapshot: dict[str, Any]) -> list[str]:
    health = snapshot.get("site_health") or {}
    p0 = [i for i in health.get("issues") or [] if i.get("priority") == "P0"]
    p0_msgs: list[str] = []
    if p0:
        p0_msgs.append(f"P0 ({len(p0)}): {p0[0].get('problem')}")
        for issue in p0[1:3]:
            p0_msgs.append(f"P0: {issue.get('problem')}")
    items = snapshot.get("audit_findings") or []
    critical = [i["message"] for i in items if i.get("severity") == "critical"]
    warnings = [i["message"] for i in items if i.get("severity") == "warning"]
    out = p0_msgs + critical[:8]
    if len(out) < 6:
        out.extend(warnings[: 6 - len(out)])
    if not out:
        out.append("Недостаточно данных для принятия решения.")
    live = snapshot.get("live") or {}
    if live and live.get("ssl_blocked") and not live.get("reachable"):
        out.insert(0, "Прод не сверен из этого Python (TLS). Выводы по репозиторию besedki-seo.")
    elif live and not live.get("reachable"):
        out.insert(0, "Прод недоступен для сверки сниппета — выводы только по репозиторию.")
    return out


def build_proposals(snapshot: dict[str, Any]) -> list[str]:
    from optimizer.backlog import live_onpage_signals

    live = snapshot.get("live") or {}
    content = snapshot.get("content") or {}
    live_ok = bool(live.get("reachable"))
    sitemap_urls = ((live.get("sitemap") or {}).get("url_count") or 0)
    catalog_count = len(snapshot.get("catalog") or [])
    closed = live_onpage_signals(snapshot)
    proposals = [
        "**Этап 2** — автономные правки. P0/P1 чинить и деплоить. Не трогать priceFrom и целый katalog.json на проде.",
        "**Off-page P1:** Яндекс Бизнес, Google Business, отзывы, Вебмастер, Search Console, цели Метрики.",
    ]
    onpage_p1: list[str] = []
    if not closed["unique_titles"]:
        onpage_p1.append("уникальные title/description карточек (`templates/onpage-product.md`)")
    if not closed["og_image"]:
        onpage_p1.append("og:image на карточках")
    if not closed["human_blog_h1"]:
        onpage_p1.append("человекочитаемые H1 категорий блога")
    if int(content.get("proekty_links") or 0):
        onpage_p1.append("`/proekty` → `/katalog`")
    if onpage_p1:
        proposals.append("**On-page P1:** " + ", ".join(onpage_p1) + ".")
    else:
        proposals.append("**On-page P1:** живые сигналы закрыты (уникальные title, og:image, H1 блога, /proekty).")

    onpage_p2: list[str] = ["поле seoDescription в каталоге"]
    if not closed["breadcrumbs"]:
        onpage_p2.append("BreadcrumbList")
    if not closed["contactpage"]:
        onpage_p2.append("ContactPage")
    health_p2 = [
        i.get("problem")
        for i in ((snapshot.get("site_health") or {}).get("issues") or [])
        if i.get("priority") == "P2" and i.get("problem")
    ]
    onpage_p2.extend(health_p2)
    proposals.append("**On-page P2:** " + ", ".join(onpage_p2) + ".")
    if live_ok and sitemap_urls:
        proposals.append(
            f"Прод: robots 200, sitemap ~{sitemap_urls} URL, каталог /katalog/{{category}}/{{slug}}."
        )
        if catalog_count and sitemap_urls < catalog_count + 5:
            proposals.append(
                f"Сверить sitemap ({sitemap_urls}) с каталогом ({catalog_count} товаров + инфо-страницы)."
            )
    proekty = int(content.get("proekty_links") or 0)
    if proekty:
        proposals.append(f"Заменить {proekty} ссылок /proekty в блоге — см. content_audit.")
    proposals.append(
        "Запросить выгрузку Вебмастера + Метрики: запросы, индекс, цели «форма» и «телефон»."
    )
    return proposals
