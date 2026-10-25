#!/usr/bin/env python3
"""Replace known stale «от … ₽» catalog prices in blog MDX from katalog.json."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG = ROOT / "content" / "blog"
KAT = ROOT / "data" / "katalog.json"

# Historic wrong → current (from sync). Only unambiguous model anchors.
REPLACEMENTS = [
    # (regex finding wrong amount near optional model hint, new formatted)
]


def fmt(n: int) -> str:
    s = f"{n:,}".replace(",", " ")
    return s


def main() -> int:
    prices = {i["slug"]: int(i["priceFrom"]) for i in json.loads(KAT.read_text())}
    # Map wrong displayed amounts that were hardcoded historically
    # Only replace when the wrong number is clearly the old catalog «от»
    mapping = {
        "95 000": fmt(prices["b-10"]),
        "95\u00a0000": fmt(prices["b-10"]),
        "114 000": fmt(prices["b-10"]),  # idempotent if already ok
        "175 000": fmt(prices["b-19"]),
        "185 000": fmt(prices["b-17"]),
        "210 000": fmt(prices["b-19"]),
        "222 000": fmt(prices["b-17"]),
        "440 000": fmt(prices["b-22"]),
        "720 000": fmt(prices["b-22"]),
        "400 000": fmt(prices.get("b-21", prices["b-22"])),  # careful
        "490 000": fmt(prices.get("b-23", prices["b-22"])),
    }
    # Safer: only replace clearly stale ones that differ from current
    safe = {
        "95 000": fmt(prices["b-10"]),
        "175 000": fmt(prices["b-19"]),
        "185 000": fmt(prices["b-17"]),
        "440 000": fmt(prices["b-22"]),
    }
    # also without spaces variants in bold
    write = "--write" in sys.argv
    changed_files = 0
    total_repl = 0
    for path in sorted(BLOG.glob("*.mdx")):
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in safe.items():
            if old == new:
                continue
            # replace in «от … ₽» contexts and plain mentions with ₽
            patterns = [
                (rf"от\s+\*\*{re.escape(old)}\s*₽\*\*", f"от **{new} ₽**"),
                (rf"от\s+{re.escape(old)}\s*₽", f"от {new} ₽"),
                (rf"{re.escape(old)}\s*₽", f"{new} ₽"),
            ]
            for pat, repl in patterns:
                text, n = re.subn(pat, repl, text)
                total_repl += n
        if text != orig:
            changed_files += 1
            if write:
                path.write_text(text, encoding="utf-8")
    print(
        f"{'WRITE' if write else 'DRY'}: files={changed_files} replacements≈{total_repl} "
        f"map={safe}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
