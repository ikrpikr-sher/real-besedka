from __future__ import annotations

import unittest

from site_health.sku_aliases import CORE_SKUS, alias_needs_redirect


class SkuAliasTests(unittest.TestCase):
    def test_404_without_redirect_is_bad(self) -> None:
        self.assertTrue(
            alias_needs_redirect(
                {"status": 404, "first_status": 404, "final_url": "https://x/old"},
                "/katalog/otkrytye-besedki/b-51",
            )
        )

    def test_301_to_current_is_ok(self) -> None:
        self.assertFalse(
            alias_needs_redirect(
                {
                    "status": 200,
                    "first_status": 301,
                    "final_url": "https://real-besedki.ru/katalog/otkrytye-besedki/b-51",
                },
                "/katalog/otkrytye-besedki/b-51",
            )
        )

    def test_301_to_wrong_path_is_bad(self) -> None:
        self.assertTrue(
            alias_needs_redirect(
                {
                    "status": 200,
                    "first_status": 301,
                    "final_url": "https://real-besedki.ru/katalog",
                },
                "/katalog/otkrytye-besedki/b-51",
            )
        )

    def test_old_path_still_200_is_ok(self) -> None:
        self.assertFalse(
            alias_needs_redirect(
                {"status": 200, "first_status": 200, "final_url": "https://x/old"},
                "/katalog/otkrytye-besedki/b-51",
            )
        )

    def test_b51_tracks_glazed_and_mangal_aliases(self) -> None:
        sku = next(item for item in CORE_SKUS if item["label"] == "B-51")
        self.assertEqual(sku["current"], "/katalog/otkrytye-besedki/b-51")
        self.assertIn("/katalog/besedki-s-ostekleniem/b-51", sku["aliases"])
        self.assertIn("/katalog/besedki-s-mangalom/b-51", sku["aliases"])


if __name__ == "__main__":
    unittest.main()
