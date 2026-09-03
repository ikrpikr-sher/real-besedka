from __future__ import annotations

import unittest

from site_health.seo import sitemap_composition, sitemap_growth_issues


class SitemapGrowthTests(unittest.TestCase):
    def test_composition(self) -> None:
        locs = [
            "https://real-besedki.ru/",
            "https://real-besedki.ru/katalog/besedki/b-01",
            "https://real-besedki.ru/katalog/poisk",
            "https://real-besedki.ru/blog/hello",
            "https://real-besedki.ru/blog/category/sovety",
            "https://real-besedki.ru/blog/tag/a",
        ]
        comp = sitemap_composition(locs)
        self.assertEqual(comp["products"], 1)
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


if __name__ == "__main__":
    unittest.main()
