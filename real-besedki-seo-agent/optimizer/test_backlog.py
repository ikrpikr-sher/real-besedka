from __future__ import annotations

import unittest

from optimizer.backlog import build_backlog


def _snapshot() -> dict:
    return {
        "report_date": "2026-08-31",
        "site_url": "https://real-besedki.ru",
        "read_only": False,
        "local": {"site_code_missing": True},
        "catalog": [{"path": "/katalog/a/b"}] * 3,
        "live": {"sitemap": {"url_count": 517}},
        "content": {
            "proekty_links": 0,
            "product_open_graph": True,
            "blog_category_slug_h1": False,
            "seo_json_mentions_dpk": False,
        },
        "audit_findings": [],
        "site_health": {
            "issues": [
                {
                    "priority": "P2",
                    "category": "sitemap",
                    "problem": "Пустой /katalog/poisk в sitemap без noindex",
                    "url": "https://real-besedki.ru/katalog/poisk",
                }
            ],
            "checks": {
                "onpage": {
                    "pages": [
                        {
                            "path": "/katalog/otkrytye-besedki/b-60",
                            "og_type": "website",
                            "og_image": True,
                            "og_title": "Беседка Графит",
                            "jsonld": ["Product", "Offer"],
                        },
                        {
                            "path": "/katalog/kacheli/k-08",
                            "og_type": "website",
                            "og_image": True,
                            "og_title": "Качели Рыцари",
                            "jsonld": ["Product"],
                        },
                        {
                            "path": "/katalog",
                            "jsonld": ["BreadcrumbList"],
                        },
                        {
                            "path": "/kontakty",
                            "jsonld": ["ContactPage"],
                        },
                        {
                            "path": "/blog/category/sravneniya",
                            "h1": ["Сравнения"],
                        },
                    ]
                }
            },
        },
    }


class BacklogSkipClosedTests(unittest.TestCase):
    def test_skips_closed_live_items(self) -> None:
        tasks = [row["task"] for row in build_backlog(_snapshot())]
        joined = "\n".join(tasks)
        self.assertIn("besedki-seo/", joined)
        self.assertIn("og:type", joined)
        self.assertIn("katalog/poisk", joined)
        self.assertNotIn("Добавить og:image", joined)
        self.assertNotIn("Уникальные title", joined)
        self.assertNotIn("ContactPage schema", joined)
        self.assertNotIn("BreadcrumbList JSON-LD", joined)
        self.assertNotIn("человекочитаемые H1", joined)

    def test_asks_og_image_when_missing(self) -> None:
        snap = _snapshot()
        snap["content"]["product_open_graph"] = False
        snap["site_health"]["checks"]["onpage"]["pages"][0]["og_image"] = False
        snap["site_health"]["checks"]["onpage"]["pages"][1]["og_image"] = False
        tasks = [row["task"] for row in build_backlog(snap)]
        self.assertTrue(any("og:image" in t and "Добавить" in t for t in tasks))


if __name__ == "__main__":
    unittest.main()
