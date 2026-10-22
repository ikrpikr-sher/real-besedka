from __future__ import annotations

import unittest

from site_health.report import render_health_report


class HealthReportTests(unittest.TestCase):
    def test_ssl_line_includes_days_left(self) -> None:
        text = render_health_report(
            {
                "report_date": "2026-10-19",
                "site_url": "https://real-besedki.ru",
                "emergency_mode": False,
                "summary": {"p0_count": 0, "p1_count": 0, "p2_count": 0},
                "issues": [],
                "checks": {
                    "ssl": {
                        "hosts": {
                            "real-besedki.ru": {
                                "ok": True,
                                "expires": "2026-11-22",
                                "days_left": 34,
                                "issuer": "YR1",
                            }
                        }
                    }
                },
            }
        )
        self.assertIn("days_left=34", text)
        self.assertIn("expires=2026-11-22", text)


if __name__ == "__main__":
    unittest.main()
