from __future__ import annotations

import unittest

from site_health.onpage import (
    looks_garbled_ru,
    origin_healthy,
    parse_h1,
    parse_jsonld_types,
    parse_og,
    parse_og_images,
    product_specific_og_images,
)
from sources.content_audit import _dpk_as_default_floor
from optimizer.backlog import build_backlog


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

    def test_og_images_product_vs_hero(self) -> None:
        html = (
            '<meta property="og:image" content="https://real-besedki.ru/images/otkrytye-besedki/b-18/01_hero.jpg">'
            '<meta property="og:image" content="https://real-besedki.ru/images/hero-besedka.jpg">'
        )
        images = parse_og_images(html)
        self.assertEqual(len(images), 2)
        specific = product_specific_og_images(images)
        self.assertEqual(specific, ["https://real-besedki.ru/images/otkrytye-besedki/b-18/01_hero.jpg"])

    def test_garbled_ru(self) -> None:
        self.assertFalse(looks_garbled_ru("Вентиляция холодного лофта B-63: естественный стек"))
        self.assertTrue(looks_garbled_ru("ÐÐµÐ½ÑÐ¸Ð»ÑÑÐ¸Ñ ÑÐ¾Ð»Ð¾Ð´Ð½Ð¾Ð³Ð¾"))
        self.assertTrue(looks_garbled_ru("Бсдкврт хлднг лфт"))

    def test_backlog_skips_fixed_live_items(self) -> None:
        items = build_backlog(
            {
                "report_date": "2026-08-27",
                "site_url": "https://real-besedki.ru",
                "read_only": False,
                "local": {"site_code_missing": True},
                "catalog": [{"slug": "b-10"}] * 3,
                "content": {
                    "product_open_graph": False,
                    "product_og_live": {
                        "checked": True,
                        "product_og_image": True,
                        "product_og_image_specific": True,
                        "product_og_type": "website",
                    },
                    "blog_category_slug_h1": False,
                    "proekty_links": 0,
                },
                "site_check": {
                    "products": [
                        {"title": "Беседка «Графит · Старт» — 2×2"},
                        {"title": "Беседка «Графит · Лофт» 3×4"},
                    ]
                },
                "site_health": {
                    "issues": [
                        {
                            "priority": "P2",
                            "problem": "Пустой /katalog/poisk без noindex (в sitemap есть служебный URL поиска)",
                        }
                    ],
                    "checks": {
                        "onpage": {
                            "product_titles_unique": True,
                            "blog_category_human": True,
                            "garbled_blog": [],
                        }
                    },
                },
                "live": {"sitemap": {"url_count": 190}},
                "audit_findings": [],
            }
        )
        tasks = [row["task"] for row in items]
        self.assertTrue(any("og:type=product" in t for t in tasks))
        self.assertFalse(any("Уникальные title" in t for t in tasks))
        self.assertFalse(any("человекочитаемые H1" in t for t in tasks))
        self.assertFalse(any("ContactPage" in t for t in tasks))
        self.assertFalse(any("BreadcrumbList" in t for t in tasks))
        self.assertTrue(any("/katalog/poisk" in t for t in tasks))


if __name__ == "__main__":
    unittest.main()
