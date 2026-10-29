from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from sources.catalog import (
    HUB_CATEGORIES,
    _catalog_path,
    is_product_catalog_path,
    parse_catalog_from_sitemap,
)


SITEMAP = """
<urlset>
  <loc>https://real-besedki.ru/katalog/otkrytye-besedki/b-17</loc>
  <loc>https://real-besedki.ru/katalog/razmer/6x3</loc>
  <loc>https://real-besedki.ru/katalog/razmer/3x3</loc>
  <loc>https://real-besedki.ru/katalog/poisk</loc>
  <loc>https://real-besedki.ru/katalog/kacheli/k-16</loc>
</urlset>
"""


class CatalogPathTests(unittest.TestCase):
    def test_sku_is_product(self) -> None:
        self.assertTrue(is_product_catalog_path("/katalog/otkrytye-besedki/b-17"))
        self.assertTrue(is_product_catalog_path("/katalog/kacheli/k-16"))

    def test_size_hub_is_not_product(self) -> None:
        self.assertFalse(is_product_catalog_path("/katalog/razmer/6x3"))
        self.assertFalse(is_product_catalog_path("/katalog/razmer/3x3"))
        self.assertIn("razmer", HUB_CATEGORIES)

    def test_search_and_hub_not_product(self) -> None:
        self.assertFalse(is_product_catalog_path("/katalog"))
        self.assertFalse(is_product_catalog_path("/katalog/poisk"))
        self.assertFalse(is_product_catalog_path("/katalog/poisk/q"))

    def test_sitemap_skips_size_hubs(self) -> None:
        products = parse_catalog_from_sitemap(SITEMAP)
        paths = [p["path"] for p in products]
        self.assertEqual(paths, ["/katalog/otkrytye-besedki/b-17", "/katalog/kacheli/k-16"])

    def test_catalog_path_skips_prod_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            data = root / "data"
            data.mkdir()
            (data / "katalog.prod.json").write_text("[]", encoding="utf-8")
            self.assertIsNone(_catalog_path(root))
            live = data / "katalog.json"
            live.write_text("[]", encoding="utf-8")
            self.assertEqual(_catalog_path(root), live)


if __name__ == "__main__":
    unittest.main()
