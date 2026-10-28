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
    og_ok = bool(content.get("product_open_graph")) or (
        live_og.get("product_og_image") and (live_og.get("product_og_type") or "") == "product"
    )
    if not og_ok:
        add(
            "P1",
            "on-page",
            "Open Graph на карточках товаров (og:title, og:description, og:image)",
            "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
            "низкий",
        )

    if catalog_count:
        add(
            "P1",
            "on-page",
            "Пилот seoDescription: максимум 3 пустые опубликованные карточки за прогон (scripts/seo-daily-ship.sh)",
            "besedki-seo/scripts/ship-seo-descriptions.mjs",
            "средний",
        )

    health_issues = ((snapshot.get("site_health") or {}).get("issues") or [])
    blog_h1_issue = any("H1 категории блога" in (i.get("problem") or "") for i in health_issues)
    if blog_h1_issue or content.get("blog_category_slug_h1"):
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

    contact_issue = any("ContactPage" in (i.get("problem") or "") for i in health_issues)
    if contact_issue:
        add(
            "P2",
            "on-page",
            "ContactPage schema на /kontakty",
            "besedki-seo/app/kontakty/page.tsx",
            "низкий",
        )
    else:
        add(
            "info",
            "on-page",
            "ContactPage, BreadcrumbList и товарный OG на проде уже есть (health P1/P2=0)",
            "https://real-besedki.ru/kontakty",
            "—",
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
