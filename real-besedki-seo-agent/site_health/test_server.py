from __future__ import annotations

import unittest
from datetime import datetime, timezone

from site_health.server import filter_client_5xx


class ServerLogTests(unittest.TestCase):
    def test_ignores_health_agent_502(self) -> None:
        line = (
            "44.216.155.73 - - [22/Oct/2026:06:50:04 +0000] "
            '"GET /blog/category/montazh-i-uhod HTTP/1.1" 502 1033 "-" '
            '"real-besedki-seo-agent/2.0 (+site-health)"'
        )
        now = datetime(2026, 10, 22, 6, 51, tzinfo=timezone.utc)
        self.assertEqual(filter_client_5xx([line], now=now), [])

    def test_flags_recent_client_502(self) -> None:
        line = (
            "1.2.3.4 - - [22/Oct/2026:06:50:04 +0000] "
            '"GET /katalog HTTP/1.1" 502 1033 "-" '
            '"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"'
        )
        now = datetime(2026, 10, 22, 6, 51, tzinfo=timezone.utc)
        self.assertEqual(filter_client_5xx([line], now=now), [line])

    def test_ignores_old_client_502(self) -> None:
        line = (
            "1.2.3.4 - - [22/Oct/2026:05:00:04 +0000] "
            '"GET /katalog HTTP/1.1" 502 1033 "-" '
            '"Mozilla/5.0"'
        )
        now = datetime(2026, 10, 22, 6, 51, tzinfo=timezone.utc)
        self.assertEqual(filter_client_5xx([line], now=now), [])
