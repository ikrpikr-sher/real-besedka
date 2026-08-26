from __future__ import annotations

import unittest

from analytics.analyzer import analyze
from optimizer.backlog import build_backlog
from site_health.onpage import (
    origin_healthy,
    parse_h1,
    parse_jsonld_types,
    parse_og,
    parse_title,
    slug_stems_missing,
)
from sources.content_audit import _dpk_as_default_floor


class OnpageParseTests(unittest.TestCase):
    def test_parse_og_property_first(self) -> None:
        html = '<meta property="og:type" content="website"><meta property="og:image" content="https://x/a.jpg">'
        og = parse_og(html)
        self.assertEqual(og.get("type"), "website")
        self.assertEqual(og.get("image"), "https://x/a.jpg")

    def test_parse_og_content_first(self) -> None:
        html = '<meta content="product" property="og:type">'
        self.assertEqual(parse_og(html).get("type"), "product")

    def test_jsonld_and_h1(self) -> None:
        html = '<script type="application/ld+json">{"@type":"ContactPage"}</script><h1>Категория: sovety</h1>'
        self.assertIn("ContactPage", parse_jsonld_types(html))
        self.assertEqual(parse_h1(html), ["Категория: sovety"])

    def test_dpk_option_is_not_default(self) -> None:
        text = "В базовой комплектации — фанера. ДПК доступен как опция."
        self.assertFalse(_dpk_as_default_floor(text))
        self.assertTrue(_dpk_as_default_floor("Полы из ДПК под ключ"))

    def test_origin_healthy(self) -> None:
        internal = {"paths": [{"ok": True}, {"ok": True}]}
        client = {"home_form": True, "home_tel": True}
        ua = {"results": [{"status": 200}, {"status": 200}]}
        self.assertTrue(origin_healthy(internal, client, ua))
        self.assertFalse(origin_healthy({"paths": [{"ok": False}]}, client, ua))
        self.assertFalse(origin_healthy(internal, {"home_form": True, "home_tel": False}, ua))

    def test_slug_stems_catch_garbled_titles(self) -> None:
        self.assertTrue(slug_stems_missing("zimnyaya-besedka-so-steklopaketom-panorama", "Зимняя беседка со теклопакетом"))
        self.assertFalse(slug_stems_missing("besedka-derevo-ili-metall-sravnenie", "Беседка из дерева или металла — что лучше"))
        self.assertEqual(parse_title("<title>  Беседка  </title>"), "Беседка")

    def test_analyzer_skips_layout_title_when_site_code_missing(self) -> None:
        live = {
            "reachable": True,
            "ssl_blocked": False,
            "robots": {"exists": True, "has_sitemap": True},
            "sitemap": {"exists": True, "url_count": 220},
            "pages": [{"path": "/", "title": "Реал Беседки — металлические беседки", "description": "каркас"}],
        }
        findings = analyze({"site_code_missing": True, "files": {}}, live, [], {})
        messages = [f["message"] for f in findings]
        self.assertFalse(any("сильнее, чем дефолт" in m for m in messages))

    def test_backlog_skips_unique_titles_when_live_ok(self) -> None:
        items = build_backlog(
            {
                "local": {},
                "content": {"live_titles_unique": True, "product_open_graph": True},
                "catalog": [{"slug": "b-10"}] * 3,
                "live": {"sitemap": {"url_count": 220}},
                "audit_findings": [],
                "site_health": {
                    "issues": [
                        {
                            "problem": "В блоге битые title/H1 (выпали буквы): /blog/x",
                            "priority": "P1",
                        }
                    ]
                },
            }
        )
        tasks = [i["task"] for i in items]
        self.assertFalse(any("Уникальные title/description" in t for t in tasks))
        self.assertTrue(any("битые title/H1" in t for t in tasks))


if __name__ == "__main__":
    unittest.main()
