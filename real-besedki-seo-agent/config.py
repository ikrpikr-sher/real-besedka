from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent
SITE_CODE_ROOT = REPO_ROOT / "besedki-seo"

SITE_URL = "https://real-besedki.ru"
COMPANY = "ООО «Пулман»"
GEO = "Москва и МО"
FRAME = "80×80"
FLOOR = "фанера"
GOAL = "заявки: форма расчёта + звонок"

PUBLIC_INDEX_ROUTES = ("/", "/katalog/", "/blog/", "/uslugi/", "/materialy/")
NOINDEX_ROUTES = ("/admin", "/api")

COMMERCIAL_TERMS = (
    "беседк",
    "металл",
    "лазер",
    "остеклен",
    "каркас",
    "80",
    "мангал",
    "навес",
)
WEAK_TITLE_MARKERS = (
    "интернет магазин",
    "интернет-магазин",
    "главная",
    "welcome",
)
