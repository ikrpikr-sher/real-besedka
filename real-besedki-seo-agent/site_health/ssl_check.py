from __future__ import annotations

import socket
import ssl
from datetime import datetime, timezone
from typing import Any

from sources.live import TIMEOUT, _ssl_context

HOSTS = ("real-besedki.ru", "www.real-besedki.ru")
# P0 still fires at ≤3 days via check_ssl(ok=False). Warn earlier so LE renew failure is visible.
SSL_P1_DAYS = 21
SSL_P2_DAYS = 30


def check_ssl(host: str = "real-besedki.ru") -> dict[str, Any]:
    try:
        ctx = _ssl_context()
        with socket.create_connection((host, 443), timeout=TIMEOUT) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert()
                cipher = ssock.cipher()
                version = ssock.version()
        not_after = cert.get("notAfter")
        expires = None
        days_left = None
        if not_after:
            expires_dt = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
            expires = expires_dt.date().isoformat()
            days_left = (expires_dt - datetime.now(timezone.utc)).days
        sans = []
        for typ, val in cert.get("subjectAltName") or ():
            if typ == "DNS":
                sans.append(val)
        issuer = dict(x[0] for x in cert.get("issuer") or ())
        return {
            "host": host,
            "ok": days_left is None or days_left > 3,
            "expires": expires,
            "days_left": days_left,
            "sans": sans,
            "issuer": issuer.get("commonName") or issuer.get("organizationName"),
            "tls_version": version,
            "cipher": cipher[0] if cipher else None,
            "error": None,
        }
    except ssl.SSLError as exc:
        return {"host": host, "ok": False, "error": str(exc), "ssl_critical": True}
    except Exception as exc:
        return {"host": host, "ok": False, "error": str(exc)}


def ssl_expiry_issues(hosts: dict[str, Any] | None) -> list[dict[str, Any]]:
    """P1 <21 days, P2 <30 days. Broken certs stay P0 via check_all_ssl critical."""
    soon: list[tuple[int, str, dict[str, Any]]] = []
    for host, info in (hosts or {}).items():
        if not isinstance(info, dict):
            continue
        days = info.get("days_left")
        if not isinstance(days, int) or not info.get("ok"):
            continue
        if days >= SSL_P2_DAYS:
            continue
        soon.append((days, str(host), info))
    if not soon:
        return []
    days, host, info = min(soon, key=lambda row: row[0])
    expires = info.get("expires") or "?"
    return [
        {
            "priority": "P1" if days < SSL_P1_DAYS else "P2",
            "category": "ssl",
            "problem": f"SSL истекает {expires} ({days} дн.)",
            "url": f"https://{host}/",
            "cause": (
                f"Let's Encrypt {info.get('issuer') or 'YR1'}; "
                "автопродление из агента не видно"
            ),
            "impact": "Если renew не сработает, браузер начнёт блокировать сайт",
            "fact_kind": "verified",
        }
    ]


def check_all_ssl() -> dict[str, Any]:
    results = {h: check_ssl(h) for h in HOSTS}
    critical = [h for h, r in results.items() if not r.get("ok")]
    return {"hosts": results, "critical": critical}
