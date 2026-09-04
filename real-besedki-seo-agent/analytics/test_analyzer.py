from __future__ import annotations

import unittest

from analytics.analyzer import analyze


class AnalyzerSiteCodeMissingTests(unittest.TestCase):
    def test_no_layout_title_warning_when_site_code_missing(self) -> None:
        local = {"site_code_missing": True}
        live = {
            "reachable": True,
            "robots": {"exists": True, "has_sitemap": True},
            "sitemap": {"exists": True, "url_count": 200},
            "pages": [
                {
                    "path": "/",
                    "title": "Беседки металлические REAL — Москва и МО",
                    "description": "Металлические беседки, каркас 80×80, пол фанера.",
                    "status": 200,
                }
            ],
        }
        findings = analyze(local, live, [{"slug": "b-01", "source": "sitemap"}])
        blob = " ".join(f"{f.get('target')} {f.get('message')}" for f in findings)
        self.assertNotIn("layout.tsx", blob)
        self.assertNotIn("дефолт в layout", blob)


if __name__ == "__main__":
    unittest.main()
