from __future__ import annotations

import unittest

from site_health.ssl_check import SSL_P1_DAYS, SSL_P2_DAYS, ssl_expiry_issues


class SslExpiryTests(unittest.TestCase):
    def test_thresholds(self) -> None:
        self.assertEqual(SSL_P1_DAYS, 21)
        self.assertEqual(SSL_P2_DAYS, 30)

    def test_44_days_is_quiet(self) -> None:
        self.assertEqual(
            ssl_expiry_issues(
                {"real-besedki.ru": {"ok": True, "days_left": 44, "expires": "2026-11-22"}}
            ),
            [],
        )

    def test_29_days_is_p2(self) -> None:
        issues = ssl_expiry_issues(
            {
                "real-besedki.ru": {
                    "ok": True,
                    "days_left": 29,
                    "expires": "2026-11-07",
                    "issuer": "YR1",
                }
            }
        )
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]["priority"], "P2")
        self.assertIn("2026-11-07", issues[0]["problem"])

    def test_20_days_is_p1(self) -> None:
        issues = ssl_expiry_issues(
            {"real-besedki.ru": {"ok": True, "days_left": 20, "expires": "2026-10-29"}}
        )
        self.assertEqual(issues[0]["priority"], "P1")

    def test_broken_cert_skipped_here(self) -> None:
        self.assertEqual(
            ssl_expiry_issues(
                {"real-besedki.ru": {"ok": False, "days_left": 2, "expires": "2026-10-11"}}
            ),
            [],
        )

    def test_soonest_host_wins(self) -> None:
        issues = ssl_expiry_issues(
            {
                "www.real-besedki.ru": {"ok": True, "days_left": 28, "expires": "2026-11-06"},
                "real-besedki.ru": {"ok": True, "days_left": 19, "expires": "2026-10-28"},
            }
        )
        self.assertEqual(issues[0]["priority"], "P1")
        self.assertIn("real-besedki.ru", issues[0]["url"])


if __name__ == "__main__":
    unittest.main()
