from __future__ import annotations

import unittest

from analytics.analyzer import analyze


class AnalyzerLiveTests(unittest.TestCase):
    def test_no_layout_warning_without_site_code(self) -> None:
        findings = analyze(
            {"site_code_missing": True, "files": {}, "layout": {}, "seo": {}, "pages": []},
            {
                "reachable": True,
                "robots": {"exists": True, "has_sitemap": True},
                "sitemap": {"exists": True, "url_count": 10},
                "pages": [{"path": "/", "title": "Реал Беседки — металлические беседки", "status": 200}],
            },
            [{"path": "/katalog/a/b", "source": "sitemap"}],
            {
                "proekty_links": 0,
                "product_open_graph": True,
                "product_og_live": {
                    "checked": True,
                    "url": "/katalog/a/b",
                    "product_og_image": True,
                    "product_og_type": "website",
                },
                "seo_json_mentions_dpk": False,
            },
        )
        messages = [f["message"] for f in findings]
        self.assertFalse(any("layout.tsx" in m for m in messages))
        self.assertFalse(any("нет og:image" in m.lower() for m in messages))
        self.assertTrue(any("og:type=" in m for m in messages))


if __name__ == "__main__":
    unittest.main()
