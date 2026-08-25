from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from config import SITE_CODE_ROOT

import json

METADATA_TITLE_RE = re.compile(
    r"""title\s*:\s*(?:`([^`]+)`|['"]([^'"]+)['"]|\{[^}]*default\s*:\s*['"]([^'"]+)['"])""",
)
METADATA_DESC_RE = re.compile(
    r"""description\s*:\s*(?:`([^`]+)`|['"]([^'"]+)['"])""",
)
H1_RE = re.compile(r"<h1\b([^>]*)>([\s\S]*?)</h1>", re.I)
IMG_RE = re.compile(r"<img\b([^>]*)/?>", re.I)
ALT_RE = re.compile(r"\balt\s*=", re.I)
HREF_HASH_RE = re.compile(r"""href\s*=\s*['"]#['"]""")
JSX_TEXT_RE = re.compile(r">([^<>{]+)<")


def _first_group(match: re.Match[str] | None) -> str | None:
    if not match:
        return None
    for group in match.groups():
        if group:
            return group.strip()
    return None


def _strip_tags(text: str) -> str:
    text = re.sub(r"\{([^}]+)\}", r" \1 ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _route_from_page(page: Path, app_dir: Path) -> str:
    rel = page.relative_to(app_dir).as_posix()
    if rel == "page.tsx" or rel == "page.ts" or rel == "page.jsx":
        return "/"
    parent = page.parent.relative_to(app_dir).as_posix()
    return "/" + parent.replace("[", ":").replace("]", "")


def _scan_page(path: Path, app_dir: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    h1s = []
    for attrs, body in H1_RE.findall(text):
        cleaned = _strip_tags(body)
        if cleaned.startswith("className") or cleaned.startswith("class="):
            continue
        if cleaned:
            h1s.append(cleaned)
    imgs = IMG_RE.findall(text)
    missing_alt = sum(1 for attrs in imgs if not ALT_RE.search(attrs))
    has_generate = "generateMetadata" in text
    has_static_meta = bool(re.search(r"export const metadata", text))
    is_redirect = "permanentRedirect" in text or "redirect(" in text
    return {
        "file": str(path.relative_to(app_dir.parent)),
        "route": _route_from_page(path, app_dir),
        "title": _first_group(METADATA_TITLE_RE.search(text)) if (has_static_meta or has_generate) else None,
        "description": _first_group(METADATA_DESC_RE.search(text)) if (has_static_meta or has_generate) else None,
        "has_generate_metadata": has_generate,
        "has_static_metadata": has_static_meta,
        "is_redirect": is_redirect,
        "h1": [h for h in h1s if h],
        "img_total": len(imgs),
        "img_missing_alt": missing_alt,
        "json_ld": "ld+json" in text or "schema.org" in text,
        "canonical": "canonical" in text or "alternates:" in text,
        "open_graph": "openGraph" in text,
        "noindex": bool(re.search(r"noindex", text, re.I)),
        "hash_links": len(HREF_HASH_RE.findall(text)),
        "lang_ru_content": bool(re.search(r"[А-Яа-яЁё]{4,}", text)),
    }


def _is_site_code(root: Path) -> bool:
    return (
        (root / "data" / "katalog.json").exists()
        or (root / "data" / "seo.json").exists()
        or (root / "app" / "katalog").exists()
    )


def _empty_scan(*, site_code_missing: bool) -> dict[str, Any]:
    return {
        "site_code_missing": site_code_missing,
        "pages": [],
        "layout": {},
        "seo": {},
        "html_lang": None,
        "font_subsets": [],
        "files": {
            "sitemap_ts": False,
            "robots_ts": False,
            "public_robots": False,
            "public_sitemap": False,
            "favicon": False,
        },
        "metrica_in_repo": False,
    }


def scan_repo(repo_root: Path | None = None) -> dict[str, Any]:
    root = repo_root or SITE_CODE_ROOT
    if not _is_site_code(root):
        # Не сканировать create-next-app в корне агентского репо как сайт.
        return _empty_scan(site_code_missing=True)
    app_dir = root / "app"
    pages: list[dict[str, Any]] = []
    if app_dir.exists():
        for page in sorted(app_dir.rglob("page.tsx")):
            pages.append(_scan_page(page, app_dir))

    layout = app_dir / "layout.tsx"
    layout_meta: dict[str, Any] = {}
    font_subsets: list[str] = []
    html_lang = None
    if layout.exists():
        text = layout.read_text(encoding="utf-8")
        layout_meta = {
            "file": "app/layout.tsx",
            "title": _first_group(METADATA_TITLE_RE.search(text)),
            "description": _first_group(METADATA_DESC_RE.search(text)),
            "has_static_metadata": "export const metadata" in text,
            "canonical": "canonical" in text or "metadataBase" in text,
            "open_graph": "openGraph" in text,
            "json_ld": "ld+json" in text or "schema.org" in text,
        }
        html_lang_m = re.search(r'<html[^>]*lang=["\']([^"\']+)["\']', text)
        html_lang = html_lang_m.group(1) if html_lang_m else None
        font_subsets = re.findall(r'subsets:\s*\[([^\]]+)\]', text)
        font_subsets = [s.strip(" '\"") for block in font_subsets for s in block.split(",") if s.strip()]

    def _exists(*rel: str) -> bool:
        return any((root / p).exists() for p in rel)

    seo_pages: dict[str, dict[str, str]] = {}
    seo_path = root / "data" / "seo.json"
    if seo_path.exists():
        try:
            raw = json.loads(seo_path.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                for path, meta in raw.items():
                    if isinstance(meta, dict):
                        seo_pages[path] = {
                            "title": str(meta.get("title") or ""),
                            "description": str(meta.get("description") or ""),
                        }
        except (OSError, json.JSONDecodeError):
            pass
    if seo_pages.get("/"):
        home_seo = seo_pages["/"]
        if home_seo.get("title"):
            layout_meta["title"] = home_seo["title"]
        if home_seo.get("description"):
            layout_meta["description"] = home_seo["description"]

    return {
        "site_code_missing": False,
        "pages": pages,
        "layout": layout_meta,
        "seo": seo_pages,
        "html_lang": html_lang,
        "font_subsets": font_subsets,
        "files": {
            "sitemap_ts": _exists("app/sitemap.ts", "app/sitemap.js", "app/sitemap.xml"),
            "robots_ts": _exists("app/robots.ts", "app/robots.js", "app/robots.txt"),
            "public_robots": _exists("public/robots.txt"),
            "public_sitemap": _exists("public/sitemap.xml"),
            "favicon": _exists("app/favicon.ico", "app/icon.png", "app/icon.tsx", "public/favicon.ico"),
        },
        "metrica_in_repo": _has_metrica(root),
    }


def _has_metrica(root: Path) -> bool:
    needles = ("mc.yandex", "ym(", "metrika", "gtag(", "googletagmanager", "webmaster")
    for folder in (root / "app", root / "lib"):
        if not folder.exists():
            continue
        for path in folder.rglob("*"):
            if path.suffix not in {".ts", ".tsx", ".js", ".jsx", ".html"}:
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except OSError:
                continue
            lowered = text.lower()
            if any(n in lowered for n in needles):
                return True
    return False
