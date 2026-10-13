from __future__ import annotations

import unittest

from site_health.hub_links import hub_card_hrefs, hub_jsonld_cards, hub_missing_issue, sku_by_category


class HubLinksTests(unittest.TestCase):
    def test_groups_sku_skips_poisk_and_size(self) -> None:
        grouped = sku_by_category(
            [
                "https://real-besedki.ru/katalog/besedki-s-mangalom/b-76",
                "https://real-besedki.ru/katalog/besedki-s-mangalom/bm-11",
                "https://real-besedki.ru/katalog/razmer/4x4",
                "https://real-besedki.ru/katalog/poisk",
            ]
        )
        self.assertEqual(
            grouped["besedki-s-mangalom"],
            ["/katalog/besedki-s-mangalom/b-76", "/katalog/besedki-s-mangalom/bm-11"],
        )
        self.assertNotIn("razmer", grouped)
        self.assertNotIn("poisk", grouped)

    def test_parses_grid_and_jsonld(self) -> None:
        html = """
        <a href="/katalog/besedki-s-mangalom/bm-11">x</a>
        <script type="application/ld+json">
        {"url":"https://real-besedki.ru/katalog/besedki-s-mangalom/b-64"}
        </script>
        """
        self.assertEqual(hub_card_hrefs(html, "besedki-s-mangalom"), {"/katalog/besedki-s-mangalom/bm-11"})
        self.assertEqual(hub_jsonld_cards(html, "besedki-s-mangalom"), {"/katalog/besedki-s-mangalom/b-64"})

    def test_missing_ogon_is_p2(self) -> None:
        sitemap = [f"/katalog/besedki-s-mangalom/b-{n}" for n in range(64, 95)]
        sitemap += [f"/katalog/besedki-s-mangalom/bm-{n}" for n in (11, 12)]
        hrefs = {"/katalog/besedki-s-mangalom/bm-11", "/katalog/besedki-s-mangalom/bm-12"}
        jsonld = {f"/katalog/besedki-s-mangalom/b-{n}" for n in range(64, 76)} | hrefs
        issue = hub_missing_issue(
            hub_path="/katalog/besedki-s-mangalom",
            sitemap_skus=sitemap,
            hrefs=hrefs,
            jsonld=jsonld,
        )
        self.assertIsNotNone(issue)
        assert issue is not None
        self.assertEqual(issue["priority"], "P2")
        self.assertIn("b-76", issue["problem"])
        self.assertIn("b-76", issue["evidence"]["missing_both"][0])

    def test_complete_hub_quiet(self) -> None:
        skus = [f"/katalog/otkrytye-besedki/b-{i}" for i in range(10)]
        hrefs = set(skus)
        self.assertIsNone(
            hub_missing_issue(
                hub_path="/katalog/otkrytye-besedki",
                sitemap_skus=skus,
                hrefs=hrefs,
                jsonld=hrefs,
            )
        )


if __name__ == "__main__":
    unittest.main()
