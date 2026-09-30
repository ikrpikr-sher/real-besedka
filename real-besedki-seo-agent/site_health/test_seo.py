from __future__ import annotations

import unittest

from site_health.seo import (
    leftover_poisk_issue,
    missing_indexable_size_hubs_issue,
    sitemap_composition,
    sitemap_growth_issues,
)


class SitemapGrowthTests(unittest.TestCase):
    def test_composition(self) -> None:
        locs = [
            "https://real-besedki.ru/",
            "https://real-besedki.ru/katalog/besedki/b-01",
            "https://real-besedki.ru/katalog/razmer/6x3",
            "https://real-besedki.ru/katalog/poisk",
            "https://real-besedki.ru/blog/hello",
            "https://real-besedki.ru/blog/category/sovety",
            "https://real-besedki.ru/blog/tag/a",
        ]
        comp = sitemap_composition(locs)
        self.assertEqual(comp["products"], 1)
        self.assertEqual(comp["size_hubs"], 1)
        self.assertEqual(comp["posts"], 1)
        self.assertEqual(comp["tags"], 1)
        self.assertEqual(comp["blog_cats"], 1)
        self.assertEqual(len(comp["poisk"]), 1)

    def test_poisk_without_noindex_is_p2(self) -> None:
        locs = ["https://real-besedki.ru/katalog/poisk"]
        issues = sitemap_growth_issues(locs, poisk_noindex=False)
        self.assertTrue(any("katalog/poisk" in (i.get("problem") or "") for i in issues))
        self.assertEqual(issues[0]["priority"], "P2")

    def test_poisk_with_noindex_ok(self) -> None:
        locs = ["https://real-besedki.ru/katalog/poisk"]
        self.assertEqual(sitemap_growth_issues(locs, poisk_noindex=True), [])

    def test_many_tags_is_p2(self) -> None:
        locs = [f"https://real-besedki.ru/blog/tag/t{i}" for i in range(50)]
        issues = sitemap_growth_issues(locs)
        self.assertTrue(any("тегов блога" in (i.get("problem") or "") for i in issues))
        self.assertEqual(issues[0]["priority"], "P2")

    def test_few_tags_ok(self) -> None:
        locs = [f"https://real-besedki.ru/blog/tag/t{i}" for i in range(10)]
        self.assertEqual(sitemap_growth_issues(locs), [])

    def test_leftover_poisk_without_noindex(self) -> None:
        issue = leftover_poisk_issue(in_sitemap=False, noindex=False)
        self.assertIsNotNone(issue)
        assert issue is not None
        self.assertEqual(issue["priority"], "P2")
        self.assertIn("нет в sitemap", issue["problem"])

    def test_leftover_poisk_with_noindex_ok(self) -> None:
        self.assertIsNone(leftover_poisk_issue(in_sitemap=False, noindex=True))
        self.assertIsNone(leftover_poisk_issue(in_sitemap=True, noindex=False))

    def test_indexable_size_hubs_missing_from_sitemap(self) -> None:
        locs = ["https://real-besedki.ru/katalog/besedki/b-01"]
        issue = missing_indexable_size_hubs_issue(locs, hub_status=200, hub_noindex=False)
        self.assertIsNotNone(issue)
        assert issue is not None
        self.assertEqual(issue["priority"], "P2")
        self.assertIn("razmer", issue["problem"])

    def test_size_hubs_in_sitemap_ok(self) -> None:
        locs = ["https://real-besedki.ru/katalog/razmer/4x4"]
        self.assertIsNone(
            missing_indexable_size_hubs_issue(locs, hub_status=200, hub_noindex=False)
        )

    def test_noindex_size_hub_not_in_sitemap_ok(self) -> None:
        locs = ["https://real-besedki.ru/katalog/besedki/b-01"]
        self.assertIsNone(
            missing_indexable_size_hubs_issue(locs, hub_status=200, hub_noindex=True)
        )


if __name__ == "__main__":
    unittest.main()
