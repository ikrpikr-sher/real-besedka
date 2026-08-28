from __future__ import annotations

import unittest

from analytics.analyzer import analyze
from optimizer.backlog import build_backlog
from site_health.onpage import (
    og_image_is_generic,
    origin_healthy,
    parse_h1,
    parse_jsonld_types,
    parse_og,
    product_og_issues,
    titles_are_unique,
)
from sources.content_audit import _dpk_as_default_floor


class OnpageParseTests(unittest.TestCase):
    def test_parse_og_property_first(self) -> None:
        html = '<meta property="og:type" content="website"><meta property="og:image" content="https://x/a.jpg">'
        og = parse_og(html)
        self.assertEqual(og.get("type"), "website")
        self.assertEqual(og.get("image"), "https://x/a.jpg")

    def test_parse_og_content_first(self) -> None:
        html = '<meta content="product" property="og:type">'
        self.assertEqual(parse_og(html).get("type"), "product")

    def test_jsonld_and_h1(self) -> None:
        html = '<script type="application/ld+json">{"@type":"ContactPage"}</script><h1>Категория: sovety</h1>'
        self.assertIn("ContactPage", parse_jsonld_types(html))
        self.assertEqual(parse_h1(html), ["Категория: sovety"])

    def test_dpk_option_is_not_default(self) -> None:
        text = "В базовой комплектации — фанера. ДПК доступен как опция."
        self.assertFalse(_dpk_as_default_floor(text))
        self.assertTrue(_dpk_as_default_floor("Полы из ДПК под ключ"))

    def test_origin_healthy(self) -> None:
        internal = {"paths": [{"ok": True}, {"ok": True}]}
        client = {"home_form": True, "home_tel": True}
        ua = {"results": [{"status": 200}, {"status": 200}]}
        self.assertTrue(origin_healthy(internal, client, ua))
        self.assertFalse(origin_healthy({"paths": [{"ok": False}]}, client, ua))
        self.assertFalse(origin_healthy(internal, {"home_form": True, "home_tel": False}, ua))

    def test_generic_hero_og_is_p2_not_p1(self) -> None:
        self.assertTrue(og_image_is_generic("https://real-besedki.ru/images/hero-besedka.jpg"))
        self.assertFalse(og_image_is_generic("https://real-besedki.ru/uploads/b-35.webp"))
        rows = [
            {
                "path": "/katalog/x/b-1",
                "status": 200,
                "og_type": "website",
                "og_image": True,
                "og_image_url": "https://real-besedki.ru/images/hero-besedka.jpg",
            }
        ]
        issues = product_og_issues(rows)
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]["priority"], "P2")
        missing = product_og_issues(
            [{"path": "/katalog/x/b-1", "status": 200, "og_type": "website", "og_image": False, "og_image_url": ""}]
        )
        self.assertEqual(missing[0]["priority"], "P1")
        self.assertTrue(titles_are_unique(["A — 2×2", "B — 3×3"]))
        self.assertFalse(titles_are_unique(["A", "A"]))

    def test_backlog_skips_closed_live_items(self) -> None:
        snapshot = {
            "report_date": "2026-08-28",
            "site_url": "https://real-besedki.ru",
            "read_only": False,
            "catalog": [{"path": "/katalog/a/b-1"}] * 3,
            "content": {
                "proekty_links": 0,
                "product_open_graph": True,
                "product_og_live": {"product_og_image": True, "product_og_type": "website", "product_og_generic": True},
                "seo_json_mentions_dpk": False,
            },
            "live": {"sitemap": {"url_count": 190}},
            "site_health": {
                "checks": {
                    "onpage": {
                        "signals": {
                            "product_og_image": True,
                            "product_og_type_product": False,
                            "product_og_image_generic": True,
                            "product_titles_unique": True,
                            "contact_page": True,
                            "katalog_breadcrumbs": True,
                            "blog_category_h1_human": True,
                            "empty_search_in_sitemap": True,
                            "empty_search_noindex": False,
                        }
                    }
                }
            },
            "local": {"site_code_missing": True},
            "audit_findings": [],
        }
        tasks = [row["task"] for row in build_backlog(snapshot)]
        self.assertFalse(any("Уникальные title" in t for t in tasks))
        self.assertFalse(any("ContactPage" in t for t in tasks))
        self.assertFalse(any("BreadcrumbList" in t for t in tasks))
        self.assertFalse(any("человекочитаемые H1" in t for t in tasks))
        self.assertTrue(any("og:type=product" in t for t in tasks))
        self.assertTrue(any("/katalog/poisk" in t for t in tasks))

    def test_analyzer_skips_layout_title_when_site_code_missing(self) -> None:
        findings = analyze(
            {"site_code_missing": True, "files": {}, "layout": {}, "seo": {}, "pages": []},
            {
                "reachable": True,
                "ssl_blocked": False,
                "robots": {"exists": True, "has_sitemap": True},
                "sitemap": {"exists": True, "url_count": 190},
                "pages": [{"path": "/", "title": "Реал Беседки — металлические беседки", "status": 200}],
            },
            [{"path": "/katalog/a/b-1", "source": "sitemap"}],
            {
                "product_open_graph": True,
                "product_og_live": {
                    "checked": True,
                    "url": "/katalog/a/b-1",
                    "product_og_image": True,
                    "product_og_type": "website",
                    "product_og_generic": True,
                },
            },
        )
        messages = [f["message"] for f in findings]
        self.assertFalse(any("дефолт в layout.tsx" in m for m in messages))
        self.assertTrue(any("og:type=product" in m for m in messages))


if __name__ == "__main__":
    unittest.main()
