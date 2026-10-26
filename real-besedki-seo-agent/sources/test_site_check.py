from __future__ import annotations

import unittest

from sources.site_check import article_slug, search_found_product


class SearchHitTests(unittest.TestCase):
    def test_article_slug(self) -> None:
        self.assertEqual(article_slug("B-51"), "b-51")
        self.assertEqual(article_slug("В51"), "b-51")
        self.assertEqual(article_slug("b51"), "b-51")

    def test_title_echo_is_not_a_hit(self) -> None:
        html = "<title>Поиск «B-51» — каталог</title><h1>Поиск по каталогу</h1>"
        self.assertFalse(search_found_product(html, "B-51"))

    def test_product_card_href_is_a_hit(self) -> None:
        html = '<a href="/katalog/otkrytye-besedki/b-51">Графит</a>'
        self.assertTrue(search_found_product(html, "B-51"))
        self.assertTrue(search_found_product(html, "В51"))


if __name__ == "__main__":
    unittest.main()
