from __future__ import annotations

import unittest

from site_health.onpage import (
    classify_product_og,
    is_slug_h1,
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

    def test_og_missing_image_is_p1(self) -> None:
        cls = classify_product_og({"type": "product"})
        self.assertEqual(cls["kind"], "missing_image")
        self.assertEqual(cls["priority"], "P1")

    def test_og_website_with_model_photo_is_p2(self) -> None:
        cls = classify_product_og({"type": "website", "image": "https://real-besedki.ru/uploads/b-27.jpg"})
        self.assertEqual(cls["kind"], "type_website")
        self.assertEqual(cls["priority"], "P2")

    def test_og_generic_hero_is_p2(self) -> None:
        cls = classify_product_og({"type": "website", "image": "https://real-besedki.ru/images/hero-besedka.png"})
        self.assertEqual(cls["kind"], "generic_image")
        self.assertEqual(cls["priority"], "P2")

    def test_og_product_with_photo_ok(self) -> None:
        cls = classify_product_og({"type": "product", "image": "https://real-besedki.ru/uploads/b-27.jpg"})
        self.assertEqual(cls["kind"], "ok")
        self.assertIsNone(cls["priority"])

    def test_slug_h1_category_prefix(self) -> None:
        self.assertTrue(is_slug_h1("Категория: sovety", "/blog/category/sovety"))

    def test_slug_h1_bare_matches_path(self) -> None:
        self.assertTrue(is_slug_h1("sovety", "/blog/category/sovety"))
        self.assertFalse(is_slug_h1("Советы", "/blog/category/sovety"))
        self.assertFalse(is_slug_h1("Сравнения", "/blog/category/sravneniya"))

    def test_leftover_blog_cats_constant(self) -> None:
        from site_health.onpage import LEFTOVER_BLOG_CATS

        self.assertIn("/blog/category/sovety", LEFTOVER_BLOG_CATS)


if __name__ == "__main__":
    unittest.main()
