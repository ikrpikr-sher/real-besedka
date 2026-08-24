from __future__ import annotations

import socket
import ssl
from datetime import datetime, timezone
from typing import Any

from sources.live import TIMEOUT, _ssl_context

HOSTS = ("real-besedki.ru", "www.real-besedki.ru")


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


def check_all_ssl() -> dict[str, Any]:
    results = {h: check_ssl(h) for h in HOSTS}
    critical = [h for h, r in results.items() if not r.get("ok")]
    return {"hosts": results, "critical": critical}
