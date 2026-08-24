from __future__ import annotations

import re
import ssl
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from sources.live import TIMEOUT, _parse_html, _ssl_context

DEFAULT_UA = "real-besedki-seo-agent/2.0 (+site-health)"


def fetch(
    url: str,
    *,
    user_agent: str = DEFAULT_UA,
    follow_redirects: bool = True,
    max_redirects: int = 10,
) -> dict[str, Any]:
    chain: list[dict[str, Any]] = []
    current = url
    headers: dict[str, str] = {}
    body = ""
    status: int | None = None
    error: str | None = None
    ssl_error = False

    for _ in range(max_redirects + 1):
        req = Request(current, headers={"User-Agent": user_agent})
        try:
            with urlopen(req, timeout=TIMEOUT, context=_ssl_context()) as resp:
                status = getattr(resp, "status", 200)
                headers = {k.lower(): v for k, v in resp.headers.items()}
                raw = resp.read()
                charset = resp.headers.get_content_charset() or "utf-8"
                body = raw.decode(charset, errors="replace")
                final = resp.geturl()
                chain.append({"url": current, "status": status, "location": headers.get("location")})
                return {
                    "url": url,
                    "final_url": final,
                    "status": status,
                    "headers": headers,
                    "body": body,
                    "redirect_chain": chain,
                    "redirect_count": len(chain) - 1,
                    "error": None,
                    "ssl_error": False,
                }
        except HTTPError as exc:
            status = exc.code
            headers = dict(exc.headers.items()) if exc.headers else {}
            location = headers.get("Location") or headers.get("location")
            chain.append({"url": current, "status": status, "location": location})
            if follow_redirects and status in (301, 302, 303, 307, 308) and location:
                current = urljoin(current, location)
                continue
            body = ""
            try:
                body = exc.read().decode("utf-8", errors="replace")
            except Exception:
                pass
            return {
                "url": url,
                "final_url": current,
                "status": status,
                "headers": headers,
                "body": body,
                "redirect_chain": chain,
                "redirect_count": len(chain) - 1,
                "error": str(exc),
                "ssl_error": False,
            }
        except (URLError, TimeoutError, OSError, ssl.SSLError) as exc:
            error = str(exc)
            ssl_error = "certificate" in error.lower() or "ssl" in error.lower()
            chain.append({"url": current, "status": None, "error": error})
            return {
                "url": url,
                "final_url": current,
                "status": None,
                "headers": headers,
                "body": body,
                "redirect_chain": chain,
                "redirect_count": len(chain) - 1,
                "error": error,
                "ssl_error": ssl_error,
            }

    return {
        "url": url,
        "final_url": current,
        "status": None,
        "headers": headers,
        "body": body,
        "redirect_chain": chain,
        "redirect_count": len(chain),
        "error": "redirect loop or too many redirects",
        "ssl_error": False,
    }


def parse_page(body: str) -> dict[str, Any]:
    return _parse_html(body) if body else {}


def has_tel_links(body: str) -> bool:
    return bool(re.search(r'href=["\']tel:', body or "", re.I))


def has_form(body: str) -> bool:
    return bool(re.search(r"<form\b", body or "", re.I))


def canonical_host(url: str) -> str:
    return (urlparse(url).hostname or "").lower()
