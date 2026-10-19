from __future__ import annotations

import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

from site_health.http_probe import fetch


class _RedirectHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path == "/":
            self.send_response(301)
            self.send_header("Location", "/ok")
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"<html>ok</html>")

    def log_message(self, fmt: str, *args) -> None:
        return


class FetchRedirectTests(unittest.TestCase):
    def test_records_301_then_200(self) -> None:
        server = HTTPServer(("127.0.0.1", 0), _RedirectHandler)
        port = server.server_address[1]
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            result = fetch(f"http://127.0.0.1:{port}/")
        finally:
            server.shutdown()
            server.server_close()
        self.assertEqual(result.get("status"), 200)
        self.assertEqual(result.get("redirect_count"), 1)
        chain = result.get("redirect_chain") or []
        self.assertEqual(chain[0].get("status"), 301)
        self.assertTrue(str(chain[0].get("location") or "").endswith("/ok"))


if __name__ == "__main__":
    unittest.main()
