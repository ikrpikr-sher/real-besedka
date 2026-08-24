from __future__ import annotations

import re
import ssl
from html.parser import HTMLParser
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from config import SITE_URL

USER_AGENT = "real-besedki-seo-agent/1.0 (+read-only audit)"
TIMEOUT = 15


def _ssl_context() -> ssl.SSLContext:
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def _is_ssl_error(exc: BaseException) -> bool:
    text = str(exc).lower()
    return "certificate" in text or "ssl" in text


class _PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title_parts: list[str] = []
        self._in_title = False
        self._in_h1 = False
        self.h1: list[str] = []
        self.meta: dict[str, str] = {}
        self.canonical: str | None = None
        self.json_ld = False
        self.robots_meta: str | None = None
        self.og: dict[str, str] = {}
        self.lang: str | None = None
        self.img_total = 0
        self.img_missing_alt = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = {k: (v or "") for k, v in attrs}
        if tag == "html":
            self.lang = ad.get("lang") or None
        elif tag == "title":
            self._in_title = True
        elif tag == "h1":
            self._in_h1 = True
        elif tag == "meta":
            name = (ad.get("name") or ad.get("property") or "").lower()
            content = ad.get("content") or ""
            if name == "description":
                self.meta["description"] = content
            elif name == "robots":
                self.robots_meta = content
            elif name.startswith("og:"):
                self.og[name] = content
        elif tag == "link" and (ad.get("rel") or "").lower() == "canonical":
            self.canonical = ad.get("href") or None
        elif tag == "script" and "ld+json" in (ad.get("type") or "").lower():
            self.json_ld = True
        elif tag == "img":
            self.img_total += 1
            if "alt" not in ad:
                self.img_missing_alt += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title_parts.append(data)
        elif self._in_h1:
            self.h1.append(data)


def _get(url: str) -> dict[str, Any]:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(req, timeout=TIMEOUT, context=_ssl_context()) as resp:
            body = resp.read()
            charset = resp.headers.get_content_charset() or "utf-8"
            return {
                "url": url,
                "status": getattr(resp, "status", 200),
                "final_url": resp.geturl(),
                "headers": {k.lower(): v for k, v in resp.headers.items()},
                "body": body.decode(charset, errors="replace"),
                "error": None,
            }
    except HTTPError as exc:
        body = ""
        try:
            body = exc.read().decode("utf-8", errors="replace")
        except Exception:
            body = ""
        return {
            "url": url,
            "status": exc.code,
            "final_url": url,
            "headers": dict(exc.headers.items()) if exc.headers else {},
            "body": body,
            "error": str(exc),
        }
    except (URLError, TimeoutError, OSError, ssl.SSLError) as exc:
        return {
            "url": url,
            "status": None,
            "final_url": url,
            "headers": {},
            "body": "",
            "error": str(exc),
            "ssl_error": _is_ssl_error(exc),
        }


def _parse_html(html: str) -> dict[str, Any]:
    parser = _PageParser()
    try:
        parser.feed(html)
    except Exception:
        pass
    title = re.sub(r"\s+", " ", "".join(parser.title_parts)).strip()
    h1 = [re.sub(r"\s+", " ", h).strip() for h in parser.h1 if h.strip()]
    return {
        "title": title or None,
        "description": parser.meta.get("description"),
        "h1": h1,
        "canonical": parser.canonical,
        "json_ld": parser.json_ld,
        "robots_meta": parser.robots_meta,
        "og": parser.og,
        "lang": parser.lang,
        "img_total": parser.img_total,
        "img_missing_alt": parser.img_missing_alt,
    }


def fetch_live(site_url: str = SITE_URL, extra_paths: list[str] | None = None) -> dict[str, Any]:
    base = site_url.rstrip("/")
    robots = _get(f"{base}/robots.txt")
    sitemap = _get(f"{base}/sitemap.xml")
    home = _get(f"{base}/")
    pages = []
    if home.get("body") and home.get("status") == 200:
        parsed = _parse_html(home["body"])
        pages.append({"path": "/", **home, **parsed, "body": None})
    else:
        pages.append(
            {
                "path": "/",
                "url": home.get("url"),
                "status": home.get("status"),
                "error": home.get("error"),
            }
        )

    for path in extra_paths or []:
        fetched = _get(f"{base}{path}")
        item: dict[str, Any] = {
            "path": path,
            "url": fetched.get("url"),
            "status": fetched.get("status"),
            "error": fetched.get("error"),
            "final_url": fetched.get("final_url"),
        }
        if fetched.get("body") and fetched.get("status") == 200:
            item.update(_parse_html(fetched["body"]))
        pages.append(item)

    robots_body = robots.get("body") or ""
    sitemap_ok = sitemap.get("status") == 200 and "<urlset" in (sitemap.get("body") or "").lower()
    ssl_blocked = bool(home.get("ssl_error") or robots.get("ssl_error") or sitemap.get("ssl_error"))
    return {
        "site_url": base,
        "reachable": home.get("status") == 200,
        "ssl_blocked": ssl_blocked,
        "robots": {
            "status": robots.get("status"),
            "exists": robots.get("status") == 200,
            "has_sitemap": bool(re.search(r"(?i)^sitemap:", robots_body, re.M)),
            "body_preview": robots_body[:500],
            "error": robots.get("error"),
        },
        "sitemap": {
            "status": sitemap.get("status"),
            "exists": sitemap_ok,
            "url_count": len(re.findall(r"<loc>", sitemap.get("body") or "")),
            "error": sitemap.get("error"),
        },
        "pages": pages,
    }
