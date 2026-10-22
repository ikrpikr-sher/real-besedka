from datetime import datetime, timezone
import unittest

from site_health.server import is_recent_nginx_5xx

STALE = (
    '44.216.155.73 - - [22/Oct/2026:06:50:04 +0000] "GET /blog/category/montazh-i-uhod HTTP/1.1" '
    '502 1033 "-" "real-besedki-seo-agent/2.0 (+site-health)"'
)
NOW = datetime(2026, 10, 22, 8, 12, tzinfo=timezone.utc)


class Recent5xxTests(unittest.TestCase):
    def test_stale_recovered_502_is_not_an_outage(self) -> None:
        self.assertFalse(is_recent_nginx_5xx(STALE, now=NOW))

    def test_fresh_502_is_an_outage(self) -> None:
        fresh = STALE.replace("06:50:04", "08:00:04")
        self.assertTrue(is_recent_nginx_5xx(fresh, now=NOW))

    def test_200_is_ignored(self) -> None:
        ok = STALE.replace("502", "200")
        self.assertFalse(is_recent_nginx_5xx(ok, now=NOW))


if __name__ == "__main__":
    unittest.main()
