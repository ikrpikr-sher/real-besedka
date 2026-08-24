"""Google Search Console — только чтение. Сервисный аккаунт, без пароля Google."""

from __future__ import annotations

import os
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote

from sources.envload import load_env
from sources.jsonhttp import request_json

SCOPES = ("https://www.googleapis.com/auth/webmasters.readonly",)
DEFAULT_SITE = "sc-domain:real-besedki.ru"
WEBMASTERS = "https://www.googleapis.com/webmasters/v3"
INSPECT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"


def gsc_config() -> dict[str, str]:
    env = load_env()
    creds = (
        env.get("GOOGLE_APPLICATION_CREDENTIALS")
        or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        or str(Path.home() / "secrets" / "real-besedki-gsc.json")
    )
    site = env.get("GSC_SITE_URL") or os.environ.get("GSC_SITE_URL") or DEFAULT_SITE
    return {"credentials": creds, "site": site}


def _access_token(creds_path: str) -> tuple[str | None, str | None]:
    path = Path(creds_path).expanduser()
    if not path.is_file():
        return None, f"Нет файла ключа: {path}"
    try:
        from google.auth.transport.requests import Request
        from google.oauth2 import service_account
    except ImportError:
        return None, "Нужен пакет google-auth: pip install google-auth requests"
    try:
        creds = service_account.Credentials.from_service_account_file(str(path), scopes=SCOPES)
        creds.refresh(Request())
    except Exception as exc:
        return None, f"Ключ не принят Google: {exc}"
    if not creds.token:
        return None, "Google не выдал access token"
    return creds.token, None


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def fetch_sites(token: str) -> tuple[int, Any]:
    status, payload, _ = request_json("GET", f"{WEBMASTERS}/sites", headers=_auth_headers(token))
    return status, payload


def fetch_sitemaps(token: str, site: str) -> tuple[int, Any]:
    encoded = quote(site, safe="")
    status, payload, _ = request_json(
        "GET",
        f"{WEBMASTERS}/sites/{encoded}/sitemaps",
        headers=_auth_headers(token),
    )
    return status, payload


def fetch_search_analytics(
    token: str,
    site: str,
    *,
    days: int = 28,
    dimensions: list[str] | None = None,
    row_limit: int = 250,
) -> tuple[int, Any]:
    encoded = quote(site, safe="")
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=days - 1)
    body = {
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "dimensions": dimensions or ["query"],
        "rowLimit": row_limit,
        "dataState": "all",
    }
    status, payload, _ = request_json(
        "POST",
        f"{WEBMASTERS}/sites/{encoded}/searchAnalytics/query",
        headers=_auth_headers(token),
        body=body,
    )
    return status, payload


def inspect_url(token: str, site: str, url: str) -> tuple[int, Any]:
    status, payload, _ = request_json(
        "POST",
        INSPECT,
        headers=_auth_headers(token),
        body={"inspectionUrl": url, "siteUrl": site if site.endswith("/") or site.startswith("sc-domain:") else f"{site}/"},
    )
    return status, payload


def summarize_rows(payload: Any) -> list[dict[str, Any]]:
    rows = payload.get("rows") if isinstance(payload, dict) else None
    if not rows:
        return []
    out: list[dict[str, Any]] = []
    for row in rows:
        keys = row.get("keys") or []
        out.append(
            {
                "key": keys[0] if keys else "",
                "clicks": row.get("clicks", 0),
                "impressions": row.get("impressions", 0),
                "ctr": row.get("ctr", 0),
                "position": row.get("position", 0),
            }
        )
    return out


def pull_report() -> dict[str, Any]:
    cfg = gsc_config()
    token, err = _access_token(cfg["credentials"])
    result: dict[str, Any] = {
        "ok": False,
        "site": cfg["site"],
        "credentials": cfg["credentials"],
        "error": err,
    }
    if err or not token:
        return result

    sites_status, sites = fetch_sites(token)
    maps_status, sitemaps = fetch_sitemaps(token, cfg["site"])
    q_status, queries = fetch_search_analytics(token, cfg["site"], dimensions=["query"])
    p_status, pages = fetch_search_analytics(token, cfg["site"], dimensions=["page"])

    errors = []
    if sites_status != 200:
        errors.append(f"sites HTTP {sites_status}: {sites}")
    if maps_status != 200:
        errors.append(f"sitemaps HTTP {maps_status}: {sitemaps}")
    if q_status != 200:
        errors.append(f"queries HTTP {q_status}: {queries}")
    if p_status != 200:
        errors.append(f"pages HTTP {p_status}: {pages}")

    result.update(
        {
            "ok": not errors,
            "error": "; ".join(str(e) for e in errors) if errors else None,
            "http": {
                "sites": sites_status,
                "sitemaps": maps_status,
                "queries": q_status,
                "pages": p_status,
            },
            "sites": sites,
            "sitemaps": sitemaps,
            "queries": summarize_rows(queries)[:30],
            "pages": summarize_rows(pages)[:30],
        }
    )
    return result
