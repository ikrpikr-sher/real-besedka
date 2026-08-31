from __future__ import annotations

from typing import Any


def _onpage_pages(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    health = snapshot.get("site_health") or {}
    return ((health.get("checks") or {}).get("onpage") or {}).get("pages") or []


def _health_issues(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    return (snapshot.get("site_health") or {}).get("issues") or []


def build_backlog(snapshot: dict[str, Any]) -> list[dict[str, str]]:
    content = snapshot.get("content") or {}
    catalog_count = len(snapshot.get("catalog") or [])
    live = snapshot.get("live") or {}
    sitemap_urls = (live.get("sitemap") or {}).get("url_count") or 0
    pages = _onpage_pages(snapshot)
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

    def _is_product_path(path: str) -> bool:
        parts = [part for part in path.split("/") if part]
        return len(parts) == 3 and parts[0] == "katalog" and parts[1] != "poisk"

    product_pages = [p for p in pages if _is_product_path(str(p.get("path") or ""))]
    has_og_image = False
    if product_pages:
        has_og_image = all(p.get("og_image") for p in product_pages)
    elif content.get("product_open_graph"):
        has_og_image = True
    type_product = bool(product_pages) and all((p.get("og_type") or "") == "product" for p in product_pages)
    titles = [p.get("og_title") for p in product_pages if p.get("og_title")]
    titles_unique = bool(titles) and len(titles) == len(set(titles))

    if not has_og_image:
        add(
            "P1",
            "on-page",
            "Добавить og:image на карточки товаров",
            "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
            "низкий",
        )
    elif not type_product:
        add(
            "P2",
            "on-page",
            "Сменить og:type карточек с website на product (og:image уже есть)",
            "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
            "низкий",
        )

    if titles and not titles_unique:
        add(
            "P1",
            "on-page",
            f"Уникальные title/description {catalog_count or len(titles)} карточек по шаблону (пилот 1–3 за прогон)",
            "templates/onpage-product.md",
            "высокий",
        )

    kontakty = next((p for p in pages if p.get("path") == "/kontakty"), None)
    if kontakty is not None and "ContactPage" not in (kontakty.get("jsonld") or []):
        add(
            "P2",
            "on-page",
            "ContactPage schema на /kontakty",
            "besedki-seo/app/kontakty/page.tsx",
            "низкий",
        )

    katalog = next((p for p in pages if p.get("path") == "/katalog"), None)
    if katalog is not None and "BreadcrumbList" not in (katalog.get("jsonld") or []):
        add(
            "P2",
            "on-page",
            "BreadcrumbList JSON-LD на /katalog, категориях, услугах",
            "besedki-seo/app/katalog/",
            "средний",
        )

    slug_h1 = any("H1 категории блога" in (i.get("problem") or "") for i in _health_issues(snapshot))
    if slug_h1 or (content.get("blog_category_slug_h1") and not pages):
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

    if local.get("site_code_missing"):
        add(
            "P2",
            "on-page",
            "Поле seoDescription в каталоге (админка) — когда появится код сайта",
            "besedki-seo/admin/catalog",
            "средний",
        )

    handled = (
        "og:image",
        "og:type",
        "Open Graph",
        "ContactPage",
        "BreadcrumbList",
        "H1 категории",
        "og:title",
    )
    for issue in _health_issues(snapshot):
        problem = issue.get("problem") or ""
        if any(h in problem for h in handled):
            continue
        if any(x["task"] == problem for x in items):
            continue
        add(
            issue.get("priority") or "P2",
            issue.get("category") or "live",
            problem,
            issue.get("url") or "",
            "низкий",
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
        if "proekty" in msg or "openGraph" in msg or "Open Graph" in msg or "og:image" in msg or "ДПК" in msg or "seo.json" in msg:
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
