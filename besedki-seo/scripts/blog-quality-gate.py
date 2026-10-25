#!/usr/bin/env python3
"""Quality gate for blog etalon: words, tables, H1, expander clones, photo folders, stale prices."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG = ROOT / "content" / "blog"
UNIQ = ROOT / "public" / "images" / "blog" / "uniq"
DOOR = ("fundament-svai-", "zakaz-dostavka-", "krovlya-ostekleni-")
EXPANDER = (
    "Где обычно ломается решение",
    "Как пройти тему правильно",
    "Практика на участке",
)
STALE = ("95 000", "175 000", "185 000", "440 000", "400 000", "490 000")
GOLD = {"kak-vybrat-besedku-dlya-dachi", "fundament-dlya-besedki-kakoy-vybrat", "vintovye-svai-pod-besedku"}


def words(body: str) -> int:
    return len(re.findall(r"[A-Za-zА-Яа-яЁё0-9]+", body))


def main() -> int:
    report = {
        "short": [],
        "tables": [],
        "h1": [],
        "expander": [],
        "stale": [],
        "no_photos": [],
        "ok_photos": 0,
        "door": 0,
        "non_door": 0,
    }
    for path in sorted(BLOG.glob("*.mdx")):
        slug = path.stem
        text = path.read_text(encoding="utf-8", errors="replace")
        body = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.S)
        if slug.startswith(DOOR):
            report["door"] += 1
            continue
        report["non_door"] += 1
        w = words(body)
        if w < 1500:
            report["short"].append((slug, w))
        if "| --- |" in text or "|---|" in text:
            report["tables"].append(slug)
        if re.search(r"^#\s+", body, re.M):
            report["h1"].append(slug)
        if sum(1 for m in EXPANDER if m in body) >= 2:
            report["expander"].append(slug)
        if any(s in text for s in STALE):
            report["stale"].append(slug)
        folder = UNIQ / slug
        n = len(list(folder.glob("*"))) if folder.is_dir() else 0
        if n >= 4 or slug in GOLD and n >= 4:
            report["ok_photos"] += 1
        elif n < 4:
            report["no_photos"].append(slug)

    print("non_door", report["non_door"], "door", report["door"])
    print("short<1500", len(report["short"]))
    print("tables", len(report["tables"]))
    print("body_h1", len(report["h1"]))
    print("expander_clones", len(report["expander"]))
    print("stale_prices", len(report["stale"]))
    print("photo_folders_4+", report["ok_photos"])
    print("photo_folders_<4", len(report["no_photos"]))
    if report["short"][:10]:
        print("short_sample", report["short"][:10])
    if report["expander"][:10]:
        print("expander_sample", report["expander"][:10])
    # exit non-zero if critical
    critical = report["tables"] or report["h1"] or report["stale"]
    if "--strict" in sys.argv:
        critical = critical or report["short"] or report["expander"]
    return 1 if critical else 0


if __name__ == "__main__":
    raise SystemExit(main())
