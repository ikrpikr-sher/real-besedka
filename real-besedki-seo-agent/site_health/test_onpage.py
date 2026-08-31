from __future__ import annotations

import unittest

from site_health.onpage import classify_product_og, origin_healthy, parse_h1, parse_jsonld_types, parse_og
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

    def test_classify_og_image_vs_type(self) -> None:
        missing = classify_product_og({"type": "website"})
        self.assertFalse(missing["has_image"])
        self.assertFalse(missing["type_product"])
        preview = classify_product_og(
            {"type": "website", "image": "https://real-besedki.ru/images/otkrytye-besedki/b-60/01.jpg"}
        )
        self.assertTrue(preview["has_image"])
        self.assertFalse(preview["type_product"])
        self.assertFalse(preview["generic_hero"])
        hero = classify_product_og(
            {"type": "website", "image": "https://real-besedki.ru/images/hero-besedka.jpg"}
        )
        self.assertTrue(hero["generic_hero"])
        ok = classify_product_og({"type": "product", "image": "https://x/a.jpg"})
        self.assertTrue(ok["has_image"] and ok["type_product"])

    def test_origin_healthy(self) -> None:
        internal = {"paths": [{"ok": True}, {"ok": True}]}
        client = {"home_form": True, "home_tel": True}
        ua = {"results": [{"status": 200}, {"status": 200}]}
        self.assertTrue(origin_healthy(internal, client, ua))
        self.assertFalse(origin_healthy({"paths": [{"ok": False}]}, client, ua))
        self.assertFalse(origin_healthy(internal, {"home_form": True, "home_tel": False}, ua))


if __name__ == "__main__":
    unittest.main()
