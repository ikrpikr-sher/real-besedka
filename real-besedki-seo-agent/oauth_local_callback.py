#!/usr/bin/env python3
"""Local OAuth catcher for Yandex. Binds 127.0.0.1 only. Do not commit .env."""

from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
HOST = "127.0.0.1"
PORT = 18765
REDIRECT_PATH = "/callback"
REDIRECT_URI = f"http://{HOST}:{PORT}{REDIRECT_PATH}"

PAGE = """<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>SEO OAuth</title></head>
<body style="font-family:sans-serif;padding:48px;max-width:40rem">
<p id="s">Принимаю ответ Яндекса…</p>
<script>
const params = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
const payload = {
  access_token: params.get("access_token") || "",
  error: params.get("error") || "",
  error_description: params.get("error_description") || ""
};
fetch("/save", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify(payload)
}).then(r => r.json()).then(d => {
  document.getElementById("s").textContent = d.ok
    ? "Готово. Вкладку можно закрыть."
    : ("Ошибка: " + (d.error || "нет токена"));
}).catch(e => {
  document.getElementById("s").textContent = "Не удалось сохранить: " + e;
});
</script>
</body>
</html>
"""


def upsert_env(key: str, value: str) -> None:
    lines = ENV_PATH.read_text().splitlines() if ENV_PATH.exists() else []
    out = []
    found = False
    for line in lines:
        if line.startswith(f"{key}="):
            out.append(f"{key}={value}")
            found = True
        else:
            out.append(line)
    if not found:
        out.append(f"{key}={value}")
    ENV_PATH.write_text("\n".join(out) + "\n")
    ENV_PATH.chmod(0o600)


def check_token(token: str) -> tuple[int, str]:
    import subprocess

    r = subprocess.run(
        [
            "curl",
            "-sS",
            "-o",
            "/dev/null",
            "-w",
            "%{http_code}",
            "-H",
            f"Authorization: OAuth {token}",
            "-H",
            "Accept: application/json",
            "https://api.webmaster.yandex.net/v4/user",
        ],
        capture_output=True,
        text=True,
        timeout=20,
    )
    try:
        return int(r.stdout.strip() or 0), r.stderr[:120]
    except ValueError:
        return 0, r.stdout[:120]


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        return

    def _html(self, code: int, body: str) -> None:
        data = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _json(self, code: int, payload: dict) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path in ("/", REDIRECT_PATH):
            self._html(200, PAGE)
            return
        self._html(404, "not found")

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/save":
            self._json(404, {"ok": False, "error": "not found"})
            return
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length).decode("utf-8", "replace")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            self._json(400, {"ok": False, "error": "bad json"})
            return
        error = (data.get("error") or "").strip()
        token = (data.get("access_token") or "").strip()
        if error:
            self._json(400, {"ok": False, "error": error})
            print(f"Yandex error: {error}", flush=True)
            return
        if not token or len(token) < 40:
            self._json(400, {"ok": False, "error": "token too short"})
            print(f"Rejected short token len={len(token)}", flush=True)
            return
        upsert_env("YANDEX_OAUTH_TOKEN", token)
        status, _ = check_token(token)
        print(f"Saved token len={len(token)} webmaster_http={status}", flush=True)
        self._json(200, {"ok": True, "token_len": len(token), "webmaster_http": status})
        self.server.got_token = True  # type: ignore[attr-defined]


def main() -> None:
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    httpd.got_token = False  # type: ignore[attr-defined]
    print(f"Redirect URI: {REDIRECT_URI}", flush=True)
    print("Waiting for Yandex…", flush=True)
    while not httpd.got_token:  # type: ignore[attr-defined]
        httpd.handle_request()
    print("Done. Close the browser tab.", flush=True)


if __name__ == "__main__":
    main()
