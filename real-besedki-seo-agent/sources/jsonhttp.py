from __future__ import annotations

import json
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

USER_AGENT = "real-besedki-seo-agent/yadro (+official-api collector)"
TIMEOUT = 45


def _ssl_context() -> ssl.SSLContext:
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def request_json(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    body: Any = None,
    query: dict[str, Any] | None = None,
    timeout: int = TIMEOUT,
) -> tuple[int, Any, dict[str, str]]:
    if query:
        qs = urllib.parse.urlencode(
            {k: v for k, v in query.items() if v is not None},
            doseq=True,
        )
        url = f"{url}?{qs}" if "?" not in url else f"{url}&{qs}"
    data = None
    req_headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    if headers:
        req_headers.update(headers)
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        req_headers.setdefault("Content-Type", "application/json;charset=utf-8")
    req = urllib.request.Request(url, data=data, headers=req_headers, method=method.upper())
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_ssl_context()) as resp:
            raw = resp.read()
            payload: Any = None
            if raw:
                try:
                    payload = json.loads(raw.decode("utf-8"))
                except json.JSONDecodeError:
                    payload = {"raw": raw.decode("utf-8", errors="replace")[:500]}
            hdrs = {k.lower(): v for k, v in resp.headers.items()}
            return int(resp.status), payload, hdrs
    except urllib.error.HTTPError as exc:
        raw = exc.read() if exc.fp else b""
        payload = None
        if raw:
            try:
                payload = json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError:
                payload = {"raw": raw.decode("utf-8", errors="replace")[:500]}
        hdrs = {k.lower(): v for k, v in (exc.headers.items() if exc.headers else [])}
        return int(exc.code), payload, hdrs
    except urllib.error.URLError as exc:
        return 0, {"error": str(exc.reason)}, {}


def sleep_retry_after(headers: dict[str, str], fallback: float) -> None:
    raw = headers.get("retry-after")
    try:
        wait = float(raw) if raw else fallback
    except ValueError:
        wait = fallback
    time.sleep(max(wait, fallback))
