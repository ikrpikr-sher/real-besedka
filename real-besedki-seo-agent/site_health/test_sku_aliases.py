from __future__ import annotations

import unittest

from site_health.sku_aliases import (
    CATEGORY_RELOCATIONS,
    CORE_SKUS,
    alias_needs_redirect,
    relocation_new_path,
    relocation_old_paths,
    relocation_problem,
)


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

    def test_loft_relocation_maps_hub_and_five_skus(self) -> None:
        move = next(item for item in CATEGORY_RELOCATIONS if item["label"] == "лофт")
        olds = relocation_old_paths(move)
        self.assertIn("/katalog/loft", olds)
        self.assertIn("/katalog/loft/b-53", olds)
        self.assertEqual(len(olds), 6)
        self.assertEqual(
            relocation_new_path(move, "/katalog/loft/b-53"),
            "/katalog/besedki-osteklennye-loft/b-53",
        )
        self.assertEqual(
            relocation_new_path(move, "/katalog/loft"),
            "/katalog/besedki-osteklennye-loft",
        )
        problem = relocation_problem(
            "лофт",
            ["/katalog/loft", "/katalog/loft/b-53"],
            "/katalog/besedki-osteklennye-loft",
        )
        self.assertIn("/katalog/loft", problem)
        self.assertIn("/katalog/loft/b-53", problem)
        self.assertIn("besedki-osteklennye-loft", problem)


if __name__ == "__main__":
    unittest.main()
