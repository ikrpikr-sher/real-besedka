# Релизы сайта real-besedki.ru

Формат версии: `YYYY.MM.DD.N` (дата релиза + номер за день).  
Git-тег: `site-vYYYY.MM.DD.N`.  
Скрипт: `bash scripts/site-release.sh "кратко что изменилось"`.

| Версия | Дата | Тег | Что вошло |
|---|---|---|---|
| 2026.10.24.1 | 2026-10-24 | `site-v2026.10.24.1` | SEO: уникальный seoDescription-fallback на карточке, noindex поиска и 301 сирот из прода 2026.10.22.1, сборка без NEXT_DIST_DIR. og:type=product в Metadata API Next 14 ломает build — не ставить |
| 2026.10.22.1 | 2026-10-22 | `site-v2026.10.22.1` | SEO: noindex сироты `/blog/category/sovety`, пустой `/katalog/poisk` всегда noindex и вне sitemap; сборка в соседнем каталоге вместо сломанного NEXT_DIST_DIR |
| 2026.10.20.2 | 2026-10-20 | `site-v2026.10.20.2` | SEO: один H1 в блоге, noindex 168 дверных свай вне МО, портфолио/отзывы/schema Product, Люберцы и Долгопрудный |
| 2026.10.20.1 | 2026-10-20 | `site-v2026.10.20.1` | Первый версионированный снимок сайта в GitHub: код `besedki-seo/`, журнал релизов, правило коммита после крупных правок. Медиа (GLB/видео/blog images) и `katalog.json` на сервере — не в git. |
