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
    live = snapshot.get("live") or {}
    content = snapshot.get("content") or {}
    live_ok = bool(live.get("reachable"))
    sitemap_urls = ((live.get("sitemap") or {}).get("url_count") or 0)
    catalog_count = len(snapshot.get("catalog") or [])
    proposals = [
        "**Этап 2** — автономные правки. P0/P1 чинить и деплоить. Не трогать priceFrom и целый katalog.json на проде.",
        "**Off-page P1:** Яндекс Бизнес, Google Business, отзывы, Вебмастер, Search Console, цели Метрики.",
        "**On-page:** пилот 1–3 карточки только если title не уникальны или нет og:image. "
        "og:type=website при живом фото модели — P2, не «нет OG».",
        "**On-page P2:** og:type=product; noindex пустого `/katalog/poisk` и убрать из sitemap; "
        "теги блога — noindex или выкинуть из карты. seoDescription в админке.",
    ]
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
