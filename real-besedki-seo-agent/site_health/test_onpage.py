from __future__ import annotations

import unittest

from site_health.onpage import classify_product_og, origin_healthy, parse_h1, parse_jsonld_types, parse_og
from optimizer.backlog import build_backlog
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

    def test_classify_product_og_image_present(self) -> None:
        issue = classify_product_og(
            [
                {
                    "path": "/katalog/besedki-s-ostekleniem/b-21",
                    "status": 200,
                    "og_type": "website",
                    "og_image": True,
                    "jsonld": ["Product"],
                }
            ]
        )
        self.assertIsNotNone(issue)
        assert issue is not None
        self.assertIn("og:image есть", issue["cause"])
        self.assertNotIn("нет og:image", issue["problem"])

    def test_classify_product_og_missing_image(self) -> None:
        issue = classify_product_og(
            [{"path": "/katalog/navesy/n-08", "status": 200, "og_type": "website", "og_image": False}]
        )
        self.assertIsNotNone(issue)
        assert issue is not None
        self.assertEqual(issue["problem"], "На карточках нет og:image")

    def test_backlog_skips_live_contact_and_blog_h1(self) -> None:
        snapshot = {
            "catalog": [{"slug": "b-21"}],
            "content": {
                "product_open_graph": False,
                "product_og_live": {
                    "checked": True,
                    "product_og_image": True,
                    "product_og_type": "website",
                },
            },
            "local": {},
            "live": {"sitemap": {"url_count": 10}},
            "site_health": {
                "checks": {
                    "onpage": {
                        "pages": [
                            {"path": "/kontakty", "jsonld": ["ContactPage"]},
                            {"path": "/katalog", "jsonld": ["BreadcrumbList"]},
                            {"path": "/blog/category/sravneniya", "h1": ["Сравнения"]},
                        ],
                        "issues": [],
                    }
                }
            },
            "audit_findings": [],
        }
        tasks = [row["task"] for row in build_backlog(snapshot)]
        self.assertFalse(any("ContactPage" in t for t in tasks))
        self.assertFalse(any("человекочитаемые H1" in t for t in tasks))
        self.assertFalse(any("BreadcrumbList" in t for t in tasks))
        self.assertTrue(any("og:type" in t for t in tasks))

    def test_origin_healthy(self) -> None:
        internal = {"paths": [{"ok": True}, {"ok": True}]}
        client = {"home_form": True, "home_tel": True}
        ua = {"results": [{"status": 200}, {"status": 200}]}
        self.assertTrue(origin_healthy(internal, client, ua))
        self.assertFalse(origin_healthy({"paths": [{"ok": False}]}, client, ua))
        self.assertFalse(origin_healthy(internal, {"home_form": True, "home_tel": False}, ua))


if __name__ == "__main__":
    unittest.main()
