#!/usr/bin/env python3
"""Assign unique AI covers to TSV blog posts. Never reuse one file on two slugs."""
from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path("/Users/user/real-besedka")
TSVS = [
    ROOT / "real-besedki-seo-agent/reports/dzen/sto-tem.tsv",
    ROOT / "real-besedki-seo-agent/reports/dzen/sto-tem-30.tsv",
]
BLOG = ROOT / "besedki-seo/content/blog"
UNIQ = ROOT / "besedki-seo/public/images/blog/uniq"
ASSETS = Path("/Users/user/.cursor/projects/Users-user-real-besedka/assets")

SHARED = re.compile(
    r"(/images/(?:blog|proekty|mangaly|osteklenie)/[^\s)]+)"
)


def tsv_slugs() -> list[str]:
    slugs: list[str] = []
    seen: set[str] = set()
    for tsv in TSVS:
        if not tsv.exists():
            continue
        for i, line in enumerate(tsv.read_text().splitlines()):
            if i == 0 or not line.strip():
                continue
            parts = line.split("\t")
            if len(parts) > 1:
                slug = parts[1].strip()
                if slug and slug not in seen:
                    seen.add(slug)
                    slugs.append(slug)
    return slugs


def ingest() -> int:
    UNIQ.mkdir(parents=True, exist_ok=True)
    n = 0
    slugs = set(tsv_slugs())
    for src in ASSETS.glob("*.jpg"):
        if src.stem not in slugs:
            continue
        dest = UNIQ / f"{src.stem}.jpg"
        if dest.exists() and dest.stat().st_size >= 40_000:
            continue
        shutil.copy2(src, dest)
        subprocess.run(
            ["sips", "-Z", "1200", "-s", "format", "jpeg", "-s", "formatOptions", "78", str(dest)],
            capture_output=True,
            check=False,
        )
        n += 1
    return n


def apply_mdx() -> tuple[int, int]:
    slugs = tsv_slugs()
    covers_set = 0
    inlines_set = 0
    for slug in slugs:
        dest = UNIQ / f"{slug}.jpg"
        if not dest.exists():
            continue
        path = BLOG / f"{slug}.mdx"
        if not path.exists():
            continue
        orig = path.read_text()
        cover = f"/images/blog/uniq/{slug}.jpg"
        text = re.sub(r'^coverImage:\s+".*"', f'coverImage: "{cover}"', orig, count=1, flags=re.M)
        if text != orig:
            covers_set += 1

        def repl(m: re.Match[str]) -> str:
            nonlocal inlines_set
            src = m.group(2)
            if src == cover or src.startswith("/images/blog/uniq/"):
                return m.group(0)
            inlines_set += 1
            return f"![{m.group(1)}]({cover})"

        text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", repl, text)
        if text != orig:
            path.write_text(text)
    return covers_set, inlines_set


def main() -> None:
    ingested = ingest()
    covers, inlines = apply_mdx()
    have = {p.stem for p in UNIQ.glob("*.jpg")}
    missing = [s for s in tsv_slugs() if s not in have]
    print(f"ingested={ingested} covers_updated={covers} inlines_rewritten={inlines}")
    print(f"have={len(have)} missing={len(missing)}")
    if missing:
        print("MISSING")
        print("\n".join(missing))


if __name__ == "__main__":
    main()
