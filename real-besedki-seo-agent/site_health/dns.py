from __future__ import annotations

import socket
import subprocess
from typing import Any


def _dig(name: str, rrtype: str, resolver: str = "8.8.8.8") -> tuple[list[str], str | None]:
    try:
        proc = subprocess.run(
            ["dig", f"@{resolver}", name, rrtype, "+short", "+time=3", "+tries=1"],
            capture_output=True,
            text=True,
            timeout=8,
        )
        if proc.returncode != 0 and not proc.stdout.strip():
            return [], proc.stderr.strip() or f"dig exit {proc.returncode}"
        lines = [ln.strip().rstrip(".") for ln in proc.stdout.splitlines() if ln.strip()]
        return lines, None
    except FileNotFoundError:
        return [], "dig not available"
    except Exception as exc:
        return [], str(exc)


def _resolve_a(host: str) -> list[str]:
    try:
        infos = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        ips = sorted({item[4][0] for item in infos if ":" not in item[4][0]})
        return ips
    except Exception:
        return []


def _resolve_aaaa(host: str) -> list[str]:
    try:
        infos = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        ips = sorted({item[4][0] for item in infos if ":" in item[4][0]})
        return ips
    except Exception:
        return []


def check_dns(domain: str = "real-besedki.ru") -> dict[str, Any]:
    www = f"www.{domain}"
    a_records, a_err = _dig(domain, "A")
    aaaa_records, aaaa_err = _dig(domain, "AAAA")
    www_a, www_a_err = _dig(www, "A")
    www_aaaa, www_aaaa_err = _dig(www, "AAAA")
    www_cname, www_cname_err = _dig(www, "CNAME")
    ns_records: list[str] = []
    ns_err = None
    for resolver in ("1.1.1.1", "8.8.8.8", "9.9.9.9"):
        ns_records, ns_err = _dig(domain, "NS", resolver)
        if ns_records:
            break

    if not a_records:
        a_records = _resolve_a(domain)
    if not aaaa_records:
        aaaa_records = _resolve_aaaa(domain)
    if not www_a and not www_cname:
        www_a = _resolve_a(www)

    ipv6_reachable: bool | None = None
    ipv6_error: str | None = None
    if aaaa_records:
        try:
            infos = socket.getaddrinfo(domain, 443, proto=socket.IPPROTO_TCP)
            v6 = [i for i in infos if ":" in i[4][0]]
            if v6:
                sock = socket.create_connection((v6[0][4][0], 443), timeout=5)
                sock.close()
                ipv6_reachable = True
        except Exception as exc:
            ipv6_reachable = False
            ipv6_error = str(exc)

    cloudflare_ns = any("cloudflare.com" in ns.lower() for ns in ns_records)
    return {
        "domain": domain,
        "a": a_records,
        "aaaa": aaaa_records,
        "www_a": www_a,
        "www_aaaa": www_aaaa,
        "www_cname": www_cname,
        "ns": ns_records,
        "errors": {
            "a": a_err,
            "aaaa": aaaa_err,
            "www_a": www_a_err,
            "www_aaaa": www_aaaa_err,
            "www_cname": www_cname_err,
            "ns": ns_err,
        },
        "ipv6_declared": bool(aaaa_records),
        "ipv6_reachable": ipv6_reachable,
        "ipv6_error": ipv6_error,
        "cloudflare_ns": cloudflare_ns,
    }
