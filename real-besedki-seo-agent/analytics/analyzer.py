from __future__ import annotations

import re
from typing import Any

from analytics.metrics import description_len_ok, title_len_ok
from config import COMMERCIAL_TERMS, NOINDEX_ROUTES, WEAK_TITLE_MARKERS


def _finding(severity: str, area: str, message: str, target: str = "") -> dict[str, str]:
    return {"severity": severity, "area": area, "target": target, "message": message}


def _has_commercial(text: str | None) -> bool:
    if not text:
        return False
    lowered = text.lower()
    return any(term in lowered for term in COMMERCIAL_TERMS)


def _is_weak_title(title: str | None) -> bool:
    if not title:
        return True
    lowered = title.lower()
    return any(marker in lowered for marker in WEAK_TITLE_MARKERS)


def _is_i18n_key(text: str) -> bool:
    return bool(re.fullmatch(r"[a-z0-9_.]+", text.strip(), re.I))


def analyze(
    local: dict[str, Any],
    live: dict[str, Any] | None,
    catalog: list[dict[str, Any]],
    content: dict[str, Any] | None = None,
) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    files = local.get("files") or {}
    if not files.get("sitemap_ts") and not files.get("public_sitemap"):
        findings.append(_finding("critical", "technical", "В репозитории нет sitemap.ts / sitemap.xml.", "app/sitemap.ts"))
    if not files.get("robots_ts") and not files.get("public_robots"):
        findings.append(_finding("critical", "technical", "В репозитории нет robots.ts / robots.txt.", "app/robots.ts"))

    layout = local.get("layout") or {}
    seo_home = (local.get("seo") or {}).get("/") or {}
    home_title = seo_home.get("title") or layout.get("title")
    home_desc = seo_home.get("description") or layout.get("description")
    if _is_weak_title(home_title):
        findings.append(
            _finding(
                "critical",
                "on-page",
                f"Title главной слабый для коммерческого спроса: «{home_title}».",
                "app/layout.tsx",
            )
        )
    elif not title_len_ok(home_title):
        findings.append(_finding("warning", "on-page", f"Длина title главной {len(home_title or '')} символов.", "app/layout.tsx"))
    if not home_desc:
        findings.append(_finding("critical", "on-page", "Нет meta description на уровне layout.", "app/layout.tsx"))
    elif not description_len_ok(home_desc) or not _has_commercial(home_desc):
        live_home_desc = None
        if live:
            live_home_desc = next(
                (p.get("description") for p in (live.get("pages") or []) if p.get("path") == "/"),
                None,
            )
        if not (live_home_desc and _has_commercial(live_home_desc)):
            findings.append(
                _finding(
                    "warning",
                    "on-page",
                    f"Description главной в seo.json слабый: «{home_desc[:80]}…»." if len(home_desc or "") > 80 else f"Description главной в seo.json слабый: «{home_desc}».",
                    "besedki-seo/data/seo.json",
                )
            )
    if not layout.get("canonical") and not layout.get("open_graph"):
        findings.append(_finding("warning", "on-page", "Нет metadataBase / canonical / openGraph в layout.", "app/layout.tsx"))
    if not layout.get("json_ld"):
        findings.append(_finding("warning", "on-page", "Нет JSON-LD Organization/Product в исходниках.", "app/layout.tsx"))

    if (local.get("html_lang") or "").lower() != "ru":
        findings.append(_finding("critical", "technical", f"html lang={local.get('html_lang')!r}, ожидается ru.", "app/layout.tsx"))
    subsets = [s.lower() for s in (local.get("font_subsets") or [])]
    if subsets and "cyrillic" not in subsets and "cyrillic-ext" not in subsets:
        findings.append(
            _finding(
                "warning",
                "technical",
                f"Шрифты без кириллицы в subsets: {subsets}. Риск fallback на системный шрифт.",
                "app/layout.tsx",
            )
        )

    home_h1: list[str] = []
    for page in local.get("pages") or []:
        route = page.get("route") or ""
        if route == "/":
            home_h1 = page.get("h1") or []
            if home_h1 and not _has_commercial(home_h1[0]) and not _is_i18n_key(home_h1[0]):
                findings.append(
                    _finding(
                        "warning",
                        "on-page",
                        f"H1 главной — бренд, не запрос: «{home_h1[0]}».",
                        page.get("file") or "",
                    )
                )
            if page.get("hash_links"):
                findings.append(
                    _finding(
                        "warning",
                        "content",
                        f"На главной {page['hash_links']} ссылок href=\"#\" (О нас / Контакты).",
                        page.get("file") or "",
                    )
                )
        if route.startswith("/admin") or route.startswith("/api"):
            continue
        if any(route.startswith(r) for r in NOINDEX_ROUTES) and not page.get("noindex"):
            findings.append(
                _finding(
                    "critical",
                    "technical",
                    f"Служебный URL {route} без noindex — риск индекса корзины/админки.",
                    page.get("file") or "",
                )
            )
        if page.get("img_missing_alt"):
            findings.append(
                _finding(
                    "warning",
                    "on-page",
                    f"{route}: {page['img_missing_alt']} img без alt.",
                    page.get("file") or "",
                )
            )
        if route.startswith("/katalog/") and not page.get("has_generate_metadata") and not page.get("is_redirect"):
            findings.append(
                _finding("warning", "on-page", "Карточка каталога без generateMetadata.", page.get("file") or "")
            )
        if route.startswith("/katalog/") and page.get("title") and "REAL BESEDKA" in (page.get("title") or "") and "металл" not in (page.get("title") or "").lower():
            findings.append(
                _finding(
                    "info",
                    "on-page",
                    "Шаблон title карточки без «металлическая» / гео. Уникальность есть за счёт имени модели.",
                    page.get("file") or "",
                )
            )

    if not local.get("metrica_in_repo"):
        findings.append(
            _finding(
                "warning",
                "analytics",
                "В app/lib нет счётчика Метрики / gtag — органику и цели нечем мерить на сайте.",
                "app/layout.tsx",
            )
        )
    content = content or {}
    proekty_count = int(content.get("proekty_links") or 0)
    if proekty_count:
        findings.append(
            _finding(
                "warning",
                "content",
                f"В блоге {proekty_count} ссылок на /proekty — заменить на /katalog/... (этап 2).",
                "besedki-seo/content/blog/",
            )
        )
    if content.get("seo_json_mentions_dpk"):
        findings.append(
            _finding(
                "warning",
                "content",
                "data/seo.json упоминает ДПК; в брифе пол — фанера. Сверить с живым сниппетом перед правками.",
                "besedki-seo/data/seo.json",
            )
        )
    if not content.get("product_open_graph"):
        findings.append(
            _finding(
                "warning",
                "on-page",
                "На карточках товара нет openGraph в generateMetadata — нет превью в Telegram/VK.",
                "besedki-seo/app/katalog/[category]/[slug]/page.tsx",
            )
        )

    if not catalog:
        findings.append(_finding("critical", "content", "Каталог data/katalog.json не прочитан.", "besedki-seo/data/katalog.json"))
    else:
        findings.append(
            _finding("info", "content", f"В каталоге {len(catalog)} товаров — все должны быть в sitemap.", "besedki-seo/data/katalog.json")
        )

    if live:
        if live.get("ssl_blocked") and not live.get("reachable"):
            findings.append(
                _finding(
                    "warning",
                    "live",
                    "Локальный Python не проверил TLS сертификат прода (CERTIFICATE_VERIFY_FAILED). "
                    "Не считать сайт недоступным; сверить robots/sitemap вручную или через браузер.",
                    live.get("site_url") or "",
                )
            )
        elif not live.get("reachable"):
            findings.append(_finding("critical", "live", "Продакшен не ответил 200 на /.", live.get("site_url") or ""))
        robots = live.get("robots") or {}
        sitemap = live.get("sitemap") or {}
        skip_live_files = bool(live.get("ssl_blocked") and not live.get("reachable"))
        live_home = next((p for p in (live.get("pages") or []) if p.get("path") == "/"), {})
        if live_home.get("description") and "дпк" in (live_home.get("description") or "").lower():
            findings.append(
                _finding(
                    "warning",
                    "content",
                    "Живой description: полы ДПК. В брифе бизнеса пол — фанера. Сверить оффер до любых SEO-текстов.",
                    "/",
                )
            )
        if live_home.get("title") and _is_weak_title(home_title) and not _is_weak_title(live_home.get("title")):
            findings.append(
                _finding(
                    "warning",
                    "live",
                    "Живой title главной сильнее, чем дефолт в layout.tsx. SEO title — в data/seo.json.",
                    "besedki-seo/data/seo.json",
                )
            )
        if not skip_live_files and not robots.get("exists"):
            findings.append(_finding("critical", "live", "На проде нет отдачи /robots.txt.", "/robots.txt"))
        elif not skip_live_files and not robots.get("has_sitemap"):
            findings.append(_finding("warning", "live", "robots.txt без директивы Sitemap.", "/robots.txt"))
        if skip_live_files:
            pass
        elif not sitemap.get("exists"):
            findings.append(_finding("critical", "live", "На проде нет валидного /sitemap.xml.", "/sitemap.xml"))
        elif catalog and (sitemap.get("url_count") or 0) < len(catalog) + 1:
            findings.append(
                _finding(
                    "warning",
                    "live",
                    f"В sitemap {sitemap.get('url_count')} URL, в каталоге {len(catalog)} товаров + главная.",
                    "/sitemap.xml",
                )
            )
        catalog_404 = [
            p.get("path")
            for p in (live.get("pages") or [])
            if str(p.get("path") or "").startswith("/katalog/") and p.get("status") == 404
        ]
        if catalog_404:
            findings.append(
                _finding(
                    "critical",
                    "live",
                    f"Карточки каталога 404 на проде: {', '.join(catalog_404[:5])}{'…' if len(catalog_404) > 5 else ''}.",
                    catalog_404[0],
                )
            )
        for page in live.get("pages") or []:
            path = page.get("path") or ""
            if any(path.startswith(r) for r in NOINDEX_ROUTES):
                if page.get("status") == 404:
                    findings.append(
                        _finding("info", "live", f"{path} на проде 404 — в индекс не попадёт.", path)
                    )
                continue
            if path.startswith("/katalog/") and path.count("/") >= 3:
                continue
            if page.get("path") == "/" and page.get("title"):
                if _is_weak_title(page.get("title")):
                    findings.append(
                        _finding("critical", "live", f"Живой title главной: «{page.get('title')}».", "/")
                    )
            if page.get("status") and page.get("status") >= 400:
                findings.append(
                    _finding("critical", "live", f"{page.get('path')} отвечает {page.get('status')}.", page.get("path") or "")
                )

    if not findings:
        findings.append(_finding("info", "general", "Недостаточно данных для принятия решения."))
    return findings
