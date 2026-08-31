from __future__ import annotations

import unittest

from site_health.seo import sitemap_composition, sitemap_soft_issues


class SitemapSoftTests(unittest.TestCase):
    def test_composition_and_poisk(self) -> None:
        locs = [
            "https://real-besedki.ru/katalog",
            "https://real-besedki.ru/katalog/poisk",
            "https://real-besedki.ru/katalog/otkrytye-besedki/b-12",
            "https://real-besedki.ru/blog/tag/dacha",
            "https://real-besedki.ru/blog/hello",
            "https://real-besedki.ru/blog/category/sovety",
        ]
        counts = sitemap_composition(locs)
        self.assertEqual(counts["product"], 1)
        self.assertEqual(counts["poisk"], 1)
        self.assertEqual(counts["blog_tag"], 1)
        self.assertEqual(counts["blog_post"], 1)
        self.assertEqual(counts["blog_cat"], 1)
        issues = sitemap_soft_issues(locs, poisk_robots=None)
        problems = [i["problem"] for i in issues]
        self.assertTrue(any("katalog/poisk" in p for p in problems))
        self.assertFalse(any("тегов" in p for p in problems))

    def test_poisk_with_noindex_ok(self) -> None:
        locs = ["https://real-besedki.ru/katalog/poisk"]
        issues = sitemap_soft_issues(locs, poisk_robots="noindex, follow")
        self.assertEqual(issues, [])

    def test_tag_bloat(self) -> None:
        locs = [f"https://real-besedki.ru/blog/tag/t{i}" for i in range(50)]
        issues = sitemap_soft_issues(locs)
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]["priority"], "P2")


if __name__ == "__main__":
    unittest.main()
