from __future__ import annotations

import unittest

from optimizer.backlog import build_backlog


def _snapshot(**overrides: object) -> dict:
    base = {
        "content": {
            "product_open_graph": False,
            "product_og_live": {
                "checked": True,
                "product_og_image": True,
                "product_og_type": "website",
            },
            "blog_category_slug_h1": False,
            "proekty_links": 0,
        },
        "catalog": [{"slug": "b-79"}],
        "local": {"site_code_missing": True},
        "live": {"sitemap": {"url_count": 2201}},
        "site_health": {
            "issues": [
                {
                    "priority": "P2",
                    "problem": "На карточках og:type=website при живом og:image",
                }
            ],
            "checks": {
                "onpage": {
                    "pages": [
                        {
                            "path": "/katalog/besedki-s-mangalom/b-79",
                            "status": 200,
                            "jsonld": ["Product", "BreadcrumbList"],
                        },
                        {
                            "path": "/kontakty",
                            "status": 200,
                            "jsonld": ["ContactPage"],
                        },
                        {
                            "path": "/blog/category/sravneniya",
                            "status": 200,
                            "h1": ["Сравнения: что взять на участок"],
                        },
                    ]
                }
            },
        },
        "audit_findings": [],
    }
    base.update(overrides)
    return base


class BacklogLiveFactsTests(unittest.TestCase):
    def test_live_og_image_is_not_missing_image_task(self) -> None:
        tasks = [row["task"] for row in build_backlog(_snapshot())]
        self.assertFalse(any("og:image)" in task or task.startswith("Open Graph") for task in tasks))
        self.assertTrue(any("og:type=website" in task for task in tasks))

    def test_done_schema_is_not_reopened(self) -> None:
        tasks = [row["task"] for row in build_backlog(_snapshot())]
        self.assertFalse(any("ContactPage schema" in task for task in tasks))
        self.assertFalse(any("человекочитаемые H1" in task for task in tasks))
        self.assertTrue(any("/materialy" in task for task in tasks))


if __name__ == "__main__":
    unittest.main()
