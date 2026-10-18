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
    site_code_missing = bool(local.get("site_code_missing"))
    if site_code_missing:
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

    health = snapshot.get("site_health") or {}
    on_pages = ((health.get("checks") or {}).get("onpage") or {}).get("pages") or []
    health_issues = health.get("issues") or []
    product_pages = [p for p in on_pages if str(p.get("path") or "").startswith("/katalog/") and "og_type" in p]
    if product_pages and all(p.get("og_image") for p in product_pages) and any(
        p.get("og_type") != "product" for p in product_pages
    ):
        add(
            "P2",
            "on-page",
            "Карточки: сменить og:type website → product (og:image и JSON-LD Product уже на проде)",
            "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
            "низкий",
        )
    elif not content.get("product_open_graph"):
        add(
            "P1",
            "on-page",
            "Open Graph на карточках товаров (og:title, og:description, og:image)",
            "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
            "низкий",
        )

    if catalog_count and not site_code_missing:
        add(
            "P1",
            "on-page",
            f"Уникальные title/description {catalog_count} карточек по шаблону (пилот 1–3 за прогон)",
            "templates/onpage-product.md",
            "высокий",
        )
    blog_pages = [p for p in on_pages if str(p.get("path") or "").startswith("/blog/category/") and p.get("h1")]
    slug_h1_open = any(
        i.get("category") == "on-page" and "slug" in (i.get("problem") or "")
        for i in health_issues
    )
    if not (blog_pages and not slug_h1_open):
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

    katalog_hub = next((p for p in on_pages if p.get("path") == "/katalog"), None)
    if not (katalog_hub and "BreadcrumbList" in (katalog_hub.get("jsonld") or [])):
        add(
            "P2",
            "on-page",
            "BreadcrumbList JSON-LD на /katalog, категориях, услугах",
            "besedki-seo/app/katalog/",
            "средний",
        )
    kontakt = next((p for p in on_pages if p.get("path") == "/kontakty"), None)
    if not (kontakt and "ContactPage" in (kontakt.get("jsonld") or [])):
        add(
            "P2",
            "on-page",
            "ContactPage schema на /kontakty",
            "besedki-seo/app/kontakty/page.tsx",
            "низкий",
        )

    sitemap = ((health.get("checks") or {}).get("sitemap") or {})
    geo_total = int(sitemap.get("geo_template_total") or 0)
    if geo_total >= 100:
        add(
            "P2",
            "sitemap",
            f"Городские шаблоны блога в sitemap: {geo_total} URL (климат, заказ, кровля, фундамент). Коммерческое ядро — Москва и МО",
            "https://real-besedki.ru/sitemap.xml",
            "высокий",
        )

    indexnow = ((health.get("checks") or {}).get("indexnow") or {})
    if indexnow and indexnow.get("status") != 200:
        add(
            "P2",
            "indexnow",
            "Положить /indexnow.txt и пинговать коммерческие хабы (не 800 городов)",
            "https://real-besedki.ru/indexnow.txt",
            "низкий",
        )

    if any(i.get("category") == "ssl" and i.get("priority") == "P2" for i in health_issues):
        add(
            "P2",
            "ssl",
            "Продлить Let's Encrypt до окна 2026-11-22",
            "real-besedki.ru",
            "низкий",
        )

    add(
        "P2",
        "on-page",
        "Поле seoDescription в каталоге (админка) — пилот максимум 3 карточки за прогон",
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
