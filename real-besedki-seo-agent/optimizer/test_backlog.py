from __future__ import annotations

import unittest

from optimizer.backlog import build_backlog, live_onpage_signals


def _closed_snapshot() -> dict:
    return {
        "report_date": "2026-09-02",
        "site_url": "https://real-besedki.ru",
        "read_only": False,
        "local": {"site_code_missing": True},
        "catalog": [{"slug": "b-01"}, {"slug": "b-02"}],
        "content": {"product_open_graph": True, "proekty_links": 0, "seo_json_mentions_dpk": False},
        "live": {"sitemap": {"url_count": 517}},
        "audit_findings": [],
        "site_health": {
            "checks": {
                "onpage": {
                    "pages": [
                        {
                            "path": "/katalog/besedki/b-01",
                            "og_title": "Беседка A — 4×4, от 100 000 ₽",
                            "og_image": True,
                            "jsonld": ["Product", "BreadcrumbList"],
                        },
                        {
                            "path": "/katalog/besedki/b-02",
                            "og_title": "Беседка B — 5×4, от 200 000 ₽",
                            "og_image": True,
                            "jsonld": ["Product", "BreadcrumbList"],
                        },
                        {"path": "/katalog", "jsonld": ["BreadcrumbList"]},
                        {"path": "/kontakty", "jsonld": ["ContactPage"]},
                        {"path": "/blog/category/montazh-i-uhod", "h1": ["Монтаж и уход"]},
                    ]
                }
            }
        },
    }


class BacklogLiveSkipTests(unittest.TestCase):
    def test_signals_closed(self) -> None:
        sig = live_onpage_signals(_closed_snapshot())
        self.assertTrue(sig["unique_titles"])
        self.assertTrue(sig["contactpage"])
        self.assertTrue(sig["breadcrumbs"])
        self.assertTrue(sig["human_blog_h1"])
        self.assertTrue(sig["og_image"])

    def test_skips_closed_live_items(self) -> None:
        tasks = [row["task"] for row in build_backlog(_closed_snapshot())]
        joined = "\n".join(tasks)
        self.assertNotIn("Open Graph", joined)
        self.assertNotIn("Уникальные title", joined)
        self.assertNotIn("человекочитаемые H1", joined)
        self.assertNotIn("ContactPage", joined)
        self.assertNotIn("BreadcrumbList", joined)
        self.assertTrue(any("besedki-seo" in t for t in tasks))

    def test_reopens_when_live_missing(self) -> None:
        snap = _closed_snapshot()
        snap["content"]["product_open_graph"] = False
        snap["site_health"]["checks"]["onpage"]["pages"] = []
        tasks = [row["task"] for row in build_backlog(snap)]
        joined = "\n".join(tasks)
        self.assertIn("Open Graph", joined)
        self.assertIn("Уникальные title", joined)
        self.assertIn("ContactPage", joined)
        self.assertIn("BreadcrumbList", joined)

    def test_health_p2_land_in_backlog(self) -> None:
        snap = _closed_snapshot()
        snap["site_health"]["issues"] = [
            {
                "priority": "P2",
                "category": "on-page",
                "problem": "og:type=website при живом фото модели — лучше product",
                "url": "https://real-besedki.ru/katalog/kacheli/k-01",
            },
            {
                "priority": "P2",
                "category": "sitemap",
                "problem": "Пустой /katalog/poisk в sitemap без noindex",
                "url": "https://real-besedki.ru/katalog/poisk",
            },
        ]
        tasks = [row["task"] for row in build_backlog(snap)]
        self.assertIn("og:type=website при живом фото модели — лучше product", tasks)
        self.assertIn("Пустой /katalog/poisk в sitemap без noindex", tasks)


if __name__ == "__main__":
    unittest.main()
