#!/usr/bin/env python3
"""Site-wide blog hygiene: strip body H1, convert markdown tables to prose. No price inventing."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG = ROOT / "content" / "blog"


def split_fm(text: str) -> tuple[str, str]:
    if not text.startswith("---\n"):
        return "", text
    end = text.find("\n---\n", 4)
    if end < 0:
        return "", text
    return text[: end + 5], text[end + 5 :]


def strip_body_h1(body: str) -> str:
    out = body.lstrip("\ufeff")
    out = re.sub(r"^(?:\s*\n)*\s*#\s+[^\n]+\n+", "", out)
    out = re.sub(r"^(?:\s*\n)*\s*<h1\b[^>]*>[\s\S]*?</h1>\s*", "", out, flags=re.I)
    return out


def cells(line: str) -> list[str]:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def is_sep(line: str) -> bool:
    s = line.strip().replace(" ", "")
    return bool(re.match(r"^\|?[:\-]+(\|[:\-]+)+\|?$", s))


def table_to_prose(block: str) -> str:
    lines = [ln for ln in block.strip().splitlines() if ln.strip()]
    if len(lines) < 2:
        return block
    header = cells(lines[0])
    rows_start = 2 if is_sep(lines[1]) else 1
    rows = [cells(ln) for ln in lines[rows_start:] if ln.strip().startswith("|")]
    if not rows:
        return block
    out: list[str] = []
    for row in rows:
        # pad
        while len(row) < len(header):
            row.append("")
        if len(header) == 2:
            out.append(f"- **{row[0]}** — {row[1]}")
        elif len(header) >= 3:
            head = row[0]
            rest = "; ".join(
                f"{header[i]}: {row[i]}" for i in range(1, min(len(header), len(row))) if row[i]
            )
            out.append(f"- **{head}** — {rest}" if rest else f"- **{head}**")
        else:
            out.append("- " + " — ".join(c for c in row if c))
    return "\n".join(out) + "\n"


def convert_tables(body: str) -> str:
    lines = body.splitlines(keepends=True)
    out: list[str] = []
    i = 0
    while i < len(lines):
        ln = lines[i]
        if ln.strip().startswith("|") and i + 1 < len(lines) and is_sep(lines[i + 1]):
            block_lines = [ln]
            i += 1
            block_lines.append(lines[i])
            i += 1
            while i < len(lines) and lines[i].strip().startswith("|"):
                block_lines.append(lines[i])
                i += 1
            out.append(table_to_prose("".join(block_lines)))
            if i < len(lines) and lines[i].strip() == "":
                out.append(lines[i])
                i += 1
            continue
        out.append(ln)
        i += 1
    return "".join(out)


def process_file(path: Path, write: bool) -> dict:
    raw = path.read_text(encoding="utf-8")
    fm, body = split_fm(raw)
    orig_body = body
    body = strip_body_h1(body)
    body = convert_tables(body)
    # kill leftover table separators that broke
    changed = body != orig_body
    if write and changed:
        path.write_text(fm + body, encoding="utf-8")
    return {
        "slug": path.stem,
        "changed": changed,
        "still_tables": "| --- |" in body or "|---|" in body,
        "still_h1": bool(re.search(r"^#\s+", body, re.M)),
    }


def main() -> int:
    write = "--write" in sys.argv
    files = sorted(BLOG.glob("*.mdx"))
    changed = 0
    still_t = 0
    still_h = 0
    for p in files:
        r = process_file(p, write=write)
        if r["changed"]:
            changed += 1
        if r["still_tables"]:
            still_t += 1
        if r["still_h1"]:
            still_h += 1
    mode = "WRITE" if write else "DRY"
    print(f"{mode}: files={len(files)} changed={changed} still_tables={still_t} still_body_h1={still_h}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
