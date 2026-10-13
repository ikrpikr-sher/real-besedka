from __future__ import annotations

import unittest

from sources.indexnow import build_priority_urls, is_blocked_indexnow_path


class IndexNowUrlTests(unittest.TestCase):
    def test_poisk_and_blog_blocked(self) -> None:
        self.assertTrue(is_blocked_indexnow_path("/katalog/poisk"))
        self.assertTrue(is_blocked_indexnow_path("/katalog/poisk?q=B-51"))
        self.assertTrue(is_blocked_indexnow_path("/blog/hello"))
        self.assertTrue(is_blocked_indexnow_path("/katalog/razmer/4x4"))
        self.assertTrue(is_blocked_indexnow_path("/katalog/loft/b-53"))
        self.assertTrue(is_blocked_indexnow_path("/katalog/besedki-s-ostekleniem/b-51"))
        self.assertFalse(is_blocked_indexnow_path("/katalog/besedki-s-mangalom"))
        self.assertFalse(is_blocked_indexnow_path("/katalog/besedki-osteklennye-loft/b-53"))

    def test_priority_set_excludes_poisk_blog_aliases(self) -> None:
        locs = [
            "https://real-besedki.ru/",
            "https://real-besedki.ru/katalog",
            "https://real-besedki.ru/kontakty",
            "https://real-besedki.ru/katalog/poisk",
            "https://real-besedki.ru/katalog/besedki-s-mangalom/b-76",
            "https://real-besedki.ru/katalog/besedki-s-mangalom/b-94",
            "https://real-besedki.ru/katalog/besedki-osteklennye-loft/b-53",
            "https://real-besedki.ru/katalog/loft/b-53",
            "https://real-besedki.ru/blog/geo-post",
            "https://real-besedki.ru/besedka-4x4",
            "https://real-besedki.ru/katalog/razmer/4x4",
        ]
        urls = build_priority_urls(locs)
        joined = "\n".join(urls)
        self.assertTrue(any(u.endswith("/katalog/besedki-s-mangalom") for u in urls))
        self.assertTrue(any(u.endswith("/katalog/besedki-s-mangalom/b-76") for u in urls))
        self.assertTrue(any(u.endswith("/katalog/besedki-osteklennye-loft/b-53") for u in urls))
        self.assertTrue(any(u.endswith("/besedka-4x4") for u in urls))
        self.assertIn("https://real-besedki.ru/materialy/fanera-pol", urls)
        self.assertNotIn("/katalog/poisk", joined)
        self.assertNotIn("/blog/", joined)
        self.assertNotIn("/katalog/loft/", joined)
        self.assertNotIn("/katalog/razmer/", joined)


if __name__ == "__main__":
    unittest.main()
