from __future__ import annotations

import re
from typing import Any

SLUG_H1_RE = re.compile(r"Категория[:\s]+[«\"]?([a-z0-9-]{3,})", re.I)


def live_onpage_signals(snapshot: dict[str, Any]) -> dict[str, bool]:
    """Closed live items must not re-open as backlog P1/P2."""
    health = snapshot.get("site_health") or {}
    onpage = (health.get("checks") or {}).get("onpage") or {}
    pages = onpage.get("pages") or []
    content = snapshot.get("content") or {}
    live_og = content.get("product_og_live") or {}

    products = [
        p
        for p in pages
        if str(p.get("path") or "").startswith("/katalog/")
        and "/poisk" not in str(p.get("path") or "")
        and p.get("path") != "/katalog"
    ]
    titles = [p.get("og_title") for p in products if p.get("og_title")]
    unique_titles = len(titles) >= 2 and len(titles) == len(set(titles))

    contact = next((p for p in pages if p.get("path") == "/kontakty"), None)
    has_contactpage = bool(contact and "ContactPage" in (contact.get("jsonld") or []))

    hub = next((p for p in pages if p.get("path") == "/katalog"), None)
    has_breadcrumbs = bool(
        (hub and "BreadcrumbList" in (hub.get("jsonld") or []))
        or any("BreadcrumbList" in (p.get("jsonld") or []) for p in products)
    )

    blog_cats = [p for p in pages if "/blog/category/" in str(p.get("path") or "")]
    human_blog_h1 = bool(blog_cats) and not any(
        SLUG_H1_RE.search(h or "") for p in blog_cats for h in (p.get("h1") or [])
    )

    has_og_image = bool(content.get("product_open_graph") or live_og.get("product_og_image"))
    if products:
        has_og_image = has_og_image or all(p.get("og_image") for p in products)

    return {
        "unique_titles": unique_titles,
        "contactpage": has_contactpage,
        "breadcrumbs": has_breadcrumbs,
        "human_blog_h1": human_blog_h1,
        "og_image": has_og_image,
    }


def build_backlog(snapshot: dict[str, Any]) -> list[dict[str, str]]:
    content = snapshot.get("content") or {}
    catalog_count = len(snapshot.get("catalog") or [])
    live = snapshot.get("live") or {}
    sitemap_urls = (live.get("sitemap") or {}).get("url_count") or 0
    closed = live_onpage_signals(snapshot)
    items: list[dict[str, str]] = []

    def add(priority: str, area: str, task: str, target: str, effort: str = "средний") -> None:
        items.append(
            {
                "priority": priority,
                "area": area,
                "task": task,
                "target": target,
                "effort": effort,
            }
        )

    local = snapshot.get("local") or {}
    if local.get("site_code_missing"):
        add(
            "P0",
            "infra",
            "Подключить код сайта besedki-seo/ и SSH-ключ ~/.ssh/besedki_deploy — иначе деплой on-page невозможен",
            "besedki-seo/ + ~/.ssh/besedki_deploy",
            "низкий",
        )

    add(
        "P1",
        "off-page",
        "Яндекс Бизнес — карточка, фото объектов, отзывы",
        "business.yandex.ru",
        "низкий",
    )
    add(
        "P1",
        "off-page",
        "Google Business Profile — Москва/МО",
        "business.google.com",
        "низкий",
    )
    add(
        "P1",
        "off-page",
        "Вебмастер + Search Console — sitemap, мониторинг индекса",
        "webmaster.yandex.ru / GSC",
        "низкий",
    )
    add(
        "P1",
        "analytics",
        "Метрика — цели: отправка формы + клик по телефону",
        "metrika.yandex.ru",
        "низкий",
    )

    proekty = int(content.get("proekty_links") or 0)
    if proekty:
        add(
            "P1",
            "content",
            f"Заменить {proekty} ссылок /proekty в блоге на /katalog/{{category}}/{{slug}}",
            "besedki-seo/content/blog/*.mdx",
            "средний",
        )

    if not content.get("product_open_graph") and not closed["og_image"]:
        add(
            "P1",
            "on-page",
            "Open Graph на карточках товаров (og:title, og:description, og:image)",
            "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
            "низкий",
        )

    if catalog_count and not closed["unique_titles"]:
        add(
            "P1",
            "on-page",
            f"Уникальные title/description {catalog_count} карточек по шаблону (пилот 1–3 за прогон)",
            "templates/onpage-product.md",
            "высокий",
        )
    if not closed["human_blog_h1"]:
        add(
            "P1",
            "on-page",
            "Meta категорий и тегов блога — человекочитаемые H1/title",
            "besedki-seo/app/blog/",
            "средний",
        )

    if content.get("seo_json_mentions_dpk"):
        add(
            "P1",
            "content",
            "Сверить data/seo.json с брифом: пол фанера, не ДПК",
            "besedki-seo/data/seo.json",
            "низкий",
        )

    if not closed["breadcrumbs"]:
        add(
            "P2",
            "on-page",
            "BreadcrumbList JSON-LD на /katalog, категориях, услугах",
            "besedki-seo/app/katalog/",
            "средний",
        )
    if not closed["contactpage"]:
        add(
            "P2",
            "on-page",
            "ContactPage schema на /kontakty",
            "besedki-seo/app/kontakty/page.tsx",
            "низкий",
        )
    add(
        "P2",
        "on-page",
        "Поле seoDescription в каталоге (админка)",
        "besedki-seo/admin/catalog",
        "средний",
    )

    if live and sitemap_urls:
        add(
            "info",
            "live",
            f"Прод в индексе: sitemap {sitemap_urls} URL, robots 200",
            "https://real-besedki.ru/sitemap.xml",
            "—",
        )

    for item in snapshot.get("audit_findings") or []:
        if item.get("severity") != "warning":
            continue
        msg = item.get("message") or ""
        target = item.get("target") or ""
        if any(x["task"] == msg for x in items):
            continue
        if "proekty" in msg or "openGraph" in msg or "Open Graph" in msg or "ДПК" in msg or "seo.json" in msg:
            continue
        if "og:image" in msg or "og:type" in msg:
            continue
        if "besedki-seo/" in (target or "") and "отсутствует" in msg:
            continue
        if "To get started" in msg or "Create Next App" in msg:
            continue
        items.append(
            {
                "priority": "P2",
                "area": item.get("area") or "general",
                "task": msg,
                "target": target,
                "effort": "средний",
            }
        )

    order = {"P0": 0, "P1": 1, "P2": 2, "info": 3}
    items.sort(key=lambda x: (order.get(x["priority"], 9), x["area"]))
    return items


def render_backlog(snapshot: dict[str, Any]) -> str:
    items = build_backlog(snapshot)
    lines = [
        f"# SEO backlog — {snapshot.get('report_date')}",
        "",
        f"Сайт: {snapshot.get('site_url')} · Режим: {'ТОЛЬКО ЧТЕНИЕ' if snapshot.get('read_only') else 'запись'}",
        f"Товаров: {len(snapshot.get('catalog') or [])} · Предупреждений в аудите: "
        f"{sum(1 for i in (snapshot.get('audit_findings') or []) if i.get('severity') == 'warning')}",
        "",
        "| P | Область | Задача | Файл / объект | Усилие |",
        "|---|---------|--------|---------------|--------|",
    ]
    for row in items:
        lines.append(
            f"| {row['priority']} | {row['area']} | {row['task']} | {row['target']} | {row['effort']} |"
        )
    lines.append("")
    lines.append("Журнал: `SEO-AUDIT-REAL-BESEDKI.md` · ТЗ: `real-besedki-seo-agent/TZ-FULL.md`")
    lines.append("Этап 2 — автономные правки. Не трогать priceFrom и целый katalog.json на проде.")
    return "\n".join(lines) + "\n"
