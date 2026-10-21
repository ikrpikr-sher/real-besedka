from __future__ import annotations

import unittest

from optimizer.backlog import build_backlog
from site_health.onpage import origin_healthy, parse_h1, parse_jsonld_types, parse_og
from site_health.seo import geo_template_counts, legacy_move_ok
from sources.catalog import parse_catalog_from_sitemap
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

    def test_parse_og_first_type_wins(self) -> None:
        html = (
            '<meta property="og:type" content="product">'
            '<meta property="og:type" content="website">'
            '<meta property="og:image" content="https://x/a.jpg">'
        )
        og = parse_og(html)
        self.assertEqual(og.get("type"), "product")
        self.assertEqual(og.get("image"), "https://x/a.jpg")

    def test_jsonld_and_h1(self) -> None:
        html = '<script type="application/ld+json">{"@type":"ContactPage"}</script><h1>Категория: sovety</h1>'
        self.assertIn("ContactPage", parse_jsonld_types(html))
        self.assertEqual(parse_h1(html), ["Категория: sovety"])

    def test_dpk_option_is_not_default(self) -> None:
        text = "В базовой комплектации — фанера. ДПК доступен как опция."
        self.assertFalse(_dpk_as_default_floor(text))
        self.assertTrue(_dpk_as_default_floor("Полы из ДПК под ключ"))

    def test_legacy_move_ok(self) -> None:
        self.assertTrue(
            legacy_move_ok(
                [{"status": 200}],
                "https://real-besedki.ru/katalog/besedki-osteklennye-loft",
                "/katalog/besedki-osteklennye-loft",
            )
        )
        self.assertFalse(
            legacy_move_ok(
                [{"status": 404}],
                "https://real-besedki.ru/katalog/loft",
                "/katalog/besedki-osteklennye-loft",
            )
        )

    def test_geo_template_counts(self) -> None:
        locs = [
            "https://real-besedki.ru/blog/klimat-nagruzki-abakan",
            "https://real-besedki.ru/blog/zakaz-dostavka-anapa",
            "https://real-besedki.ru/blog/kak-vybrat-besedku",
        ]
        counts = geo_template_counts(locs)
        self.assertEqual(counts["/blog/klimat-nagruzki-"], 1)
        self.assertEqual(counts["/blog/zakaz-dostavka-"], 1)
        self.assertEqual(counts["/blog/krovlya-ostekleni-"], 0)
        self.assertEqual(sum(counts.values()), 2)

    def test_backlog_skips_items_already_on_prod(self) -> None:
        snapshot = {
            "content": {"product_open_graph": True},
            "catalog": [{"path": "/katalog/x/y"}],
            "live": {"sitemap": {"url_count": 10}},
            "local": {"site_code_missing": True},
            "site_health": {
                "checks": {
                    "onpage": {
                        "pages": [
                            {
                                "path": "/katalog/x/y",
                                "og_type": "website",
                                "og_image": True,
                                "jsonld": ["Product"],
                            },
                            {"path": "/katalog", "jsonld": ["CollectionPage", "BreadcrumbList"]},
                            {"path": "/kontakty", "jsonld": ["ContactPage"]},
                            {"path": "/blog/category/sravneniya", "h1": ["Сравнения"]},
                        ]
                    },
                    "sitemap": {"geo_template_total": 800},
                    "indexnow": {"status": 404},
                },
                "issues": [
                    {
                        "priority": "P2",
                        "category": "ssl",
                        "problem": "SSL real-besedki.ru истекает через 35 дн.",
                    }
                ],
            },
            "audit_findings": [],
        }
        tasks = [item["task"] for item in build_backlog(snapshot)]
        self.assertFalse(any("ContactPage" in task for task in tasks))
        self.assertFalse(any("человекочитаемые" in task for task in tasks))
        self.assertFalse(any("BreadcrumbList" in task for task in tasks))
        self.assertFalse(any("Уникальные title" in task for task in tasks))
        self.assertTrue(any("og:type" in task for task in tasks))
        self.assertTrue(any("800" in task for task in tasks))
        self.assertTrue(any("indexnow.txt" in task for task in tasks))
        self.assertTrue(any("Let's Encrypt" in task for task in tasks))

    def test_sitemap_skips_unpublished_categories(self) -> None:
        xml = """
        <urlset>
          <loc>https://real-besedki.ru/katalog/ochagi/oc-02</loc>
          <loc>https://real-besedki.ru/katalog/drovniki/dr-03</loc>
          <loc>https://real-besedki.ru/katalog/otkrytye-besedki/b-43</loc>
        </urlset>
        """
        products = parse_catalog_from_sitemap(xml)
        self.assertEqual([p["path"] for p in products], ["/katalog/otkrytye-besedki/b-43"])

    def test_origin_healthy(self) -> None:
        internal = {"paths": [{"ok": True}, {"ok": True}]}
        client = {"home_form": True, "home_tel": True}
        ua = {"results": [{"status": 200}, {"status": 200}]}
        self.assertTrue(origin_healthy(internal, client, ua))
        self.assertFalse(origin_healthy({"paths": [{"ok": False}]}, client, ua))
        self.assertFalse(origin_healthy(internal, {"home_form": True, "home_tel": False}, ua))


if __name__ == "__main__":
    unittest.main()
