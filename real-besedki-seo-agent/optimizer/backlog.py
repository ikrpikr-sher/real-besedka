from __future__ import annotations

from typing import Any


def build_backlog(snapshot: dict[str, Any]) -> list[dict[str, str]]:
    content = snapshot.get("content") or {}
    catalog_count = len(snapshot.get("catalog") or [])
    live = snapshot.get("live") or {}
    sitemap_urls = (live.get("sitemap") or {}).get("url_count") or 0
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

    live_og = content.get("product_og_live") or {}
    if not content.get("product_open_graph"):
        if live_og.get("checked") and live_og.get("product_og_image"):
            add(
                "P2",
                "on-page",
                "На карточках og:type=website при живом og:image — сменить тип на product, когда появится код сайта",
                "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
                "низкий",
            )
        else:
            add(
                "P1",
                "on-page",
                "Open Graph на карточках товаров (og:title, og:description, og:image)",
                "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
                "низкий",
            )

    if catalog_count and local.get("site_code_missing"):
        add(
            "P2",
            "on-page",
            f"seoDescription: не больше 1–3 slug за прогон, когда появятся besedki-seo и SSH. В выборке title уже с моделью и ценой — {catalog_count} карточек пачкой не трогать",
            "push:katalog --slugs",
            "высокий",
        )
    elif catalog_count:
        add(
            "P1",
            "on-page",
            f"Уникальные description {catalog_count} карточек: пилот 1–3 slug за прогон, title пачкой не менять",
            "templates/onpage-product.md",
            "высокий",
        )

    onpage_pages = (
        ((snapshot.get("site_health") or {}).get("checks") or {}).get("onpage") or {}
    ).get("pages") or []
    health_issues = (snapshot.get("site_health") or {}).get("issues") or []
    slug_h1_live = any("H1 категории блога" in str(i.get("problem") or "") for i in health_issues)
    if content.get("blog_category_slug_h1") or slug_h1_live:
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

    product_pages = [p for p in onpage_pages if str(p.get("path") or "").count("/") >= 3]
    cards_have_crumbs = any("BreadcrumbList" in (p.get("jsonld") or []) for p in product_pages)
    if cards_have_crumbs:
        add(
            "P2",
            "on-page",
            "BreadcrumbList на /materialy/* — на карточках выборки уже есть",
            "besedki-seo/app/materialy/",
            "низкий",
        )
    else:
        add(
            "P2",
            "on-page",
            "BreadcrumbList JSON-LD на /katalog, категориях, услугах",
            "besedki-seo/app/katalog/",
            "средний",
        )

    kontakty = next((p for p in onpage_pages if p.get("path") == "/kontakty"), None)
    if kontakty is None or "ContactPage" not in (kontakty.get("jsonld") or []):
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
