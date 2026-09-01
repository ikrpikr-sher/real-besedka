from __future__ import annotations

import unittest

from analytics.analyzer import analyze
from optimizer.backlog import build_backlog
from site_health.onpage import (
    classify_product_og,
    origin_healthy,
    parse_h1,
    parse_jsonld_types,
    parse_og,
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

    def test_og_missing_image_is_p1_kind(self) -> None:
        self.assertEqual(classify_product_og({"type": "website"}), ["missing_image"])
        self.assertEqual(classify_product_og({}), ["missing_image"])

    def test_og_photo_website_is_p2_not_missing(self) -> None:
        kinds = classify_product_og(
            {"type": "website", "image": "https://real-besedki.ru/images/besedki/b-64/01.jpg"}
        )
        self.assertEqual(kinds, ["type_website"])
        self.assertNotIn("missing_image", kinds)

    def test_og_generic_hero_is_p2(self) -> None:
        kinds = classify_product_og(
            {"type": "website", "image": "https://real-besedki.ru/images/hero-besedka.webp"}
        )
        self.assertEqual(set(kinds), {"generic_hero", "type_website"})

    def test_og_product_with_model_photo_ok(self) -> None:
        self.assertEqual(
            classify_product_og(
                {"type": "product", "image": "https://real-besedki.ru/images/b-64.jpg"}
            ),
            [],
        )

    def test_analyzer_skips_layout_warning_when_site_code_missing(self) -> None:
        findings = analyze(
            {"site_code_missing": True, "files": {}, "layout": {}, "pages": []},
            {
                "reachable": True,
                "ssl_blocked": False,
                "robots": {"exists": True, "has_sitemap": True},
                "sitemap": {"exists": True, "url_count": 200},
                "pages": [{"path": "/", "title": "Реал Беседки — металлические беседки", "status": 200}],
            },
            [{"path": "/katalog/x/y", "source": "sitemap"}],
            {"product_open_graph": True, "product_og_live": {"checked": True, "product_og_image": True, "product_og_type": "website"}},
        )
        messages = " ".join(f.get("message") or "" for f in findings)
        self.assertNotIn("layout.tsx", messages)
        self.assertNotIn("нет og:image", messages)
        self.assertIn("не «нет OG»", messages)

    def test_backlog_skips_closed_live_items(self) -> None:
        items = build_backlog(
            {
                "local": {"site_code_missing": True},
                "catalog": [{"path": "/katalog/a/b"}],
                "content": {
                    "product_open_graph": True,
                    "product_og_live": {
                        "checked": True,
                        "product_og_image": True,
                        "product_og_type": "website",
                    },
                    "proekty_links": 0,
                },
                "live": {"sitemap": {"url_count": 517}},
                "site_health": {
                    "issues": [
                        {
                            "priority": "P2",
                            "problem": "Пустой /katalog/poisk в sitemap без noindex",
                            "url": "https://real-besedki.ru/katalog/poisk",
                        }
                    ],
                    "checks": {
                        "onpage": {
                            "product_titles_unique": True,
                            "has_contact_page": True,
                            "has_katalog_breadcrumbs": True,
                            "blog_h1_human": True,
                            "product_og_image": True,
                            "product_og_type": "website",
                            "issues": [],
                        }
                    },
                },
            }
        )
        tasks = " | ".join(i["task"] for i in items)
        self.assertNotIn("Уникальные title", tasks)
        self.assertNotIn("ContactPage", tasks)
        self.assertNotIn("BreadcrumbList", tasks)
        self.assertNotIn("человекочитаемые H1", tasks)
        self.assertNotIn("добавить og:image", tasks)
        self.assertIn("og:type=product", tasks)
        self.assertIn("katalog/poisk", tasks)


if __name__ == "__main__":
    unittest.main()
