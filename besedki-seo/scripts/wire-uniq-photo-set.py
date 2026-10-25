#!/usr/bin/env python3
"""
Safely ingest GenerateImage assets → uniq/<slug>/ and wire MDX.

CRITICAL: never rewrite or shorten MDX prose. Only:
  - copy/resize images into public/images/blog/uniq/<slug>/
  - set coverImage frontmatter
  - replace existing image markdown lines OR insert missing embeds
    at safe anchor points (after first paragraph / near ## headings)
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path("/Users/user/real-besedka/besedki-seo")
BLOG = ROOT / "content" / "blog"
UNIQ = ROOT / "public" / "images" / "blog" / "uniq"
ASSETS = Path("/Users/user/.cursor/projects/Users-user-real-besedka/assets")

SLOT_NAMES = ("01_cover.jpg", "02_detail.jpg", "03_scheme.jpg", "04_node.jpg")
STEMS = ("cover", "detail", "scheme", "node")

ALT = (
    "Двор дачи МО: сцена по теме статьи, металлическая беседка",
    "Деталь или сравнение по теме: узел, зона, материал",
    "Контур беседки на участке: открытый каркас, кровля или остекление",
    "Узел качества: каркас 80×80, порошок, пол или крепёж",
)


def word_count(body: str) -> int:
    return len(re.findall(r"[A-Za-zА-Яа-яЁё0-9]+", body))


def find_asset(slug: str, slot: int, stem: str) -> Path | None:
    candidates = [
        ASSETS / f"{slug}-0{slot}_{stem}.jpg",
        ASSETS / f"{slug}_0{slot}_{stem}.jpg",
        ASSETS / f"{slug}-0{slot}-{stem}.jpg",
    ]
    for p in candidates:
        if p.exists() and p.stat().st_size > 20_000:
            return p
    hits = sorted(
        ASSETS.glob(f"{slug}*0{slot}*.jpg"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    hits = [h for h in hits if h.stat().st_size > 20_000]
    return hits[0] if hits else None


def ingest_slug(slug: str) -> list[str]:
    dest_dir = UNIQ / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    placed: list[str] = []
    for i, stem in enumerate(STEMS, start=1):
        dest_name = SLOT_NAMES[i - 1]
        dest = dest_dir / dest_name
        if dest.exists() and dest.stat().st_size > 40_000:
            placed.append(dest_name)
            continue
        src = find_asset(slug, i, stem)
        if src is None:
            continue
        shutil.copy2(src, dest)
        subprocess.run(
            ["sips", "-Z", "1400", "-s", "format", "jpeg", "-s", "formatOptions", "80", str(dest)],
            capture_output=True,
            check=False,
        )
        placed.append(dest_name)
    return placed


def list_slots(slug: str) -> list[str]:
    dest_dir = UNIQ / slug
    files: list[str] = []
    for name in SLOT_NAMES:
        p = dest_dir / name
        if p.exists() and p.stat().st_size > 20_000:
            files.append(name)
    if len(files) < 4:
        numbered = sorted(dest_dir.glob("0[1-4]_*.jpg"))
        files = [p.name for p in numbered[:4]]
    return files


def wire_mdx(slug: str) -> tuple[bool, str]:
    path = BLOG / f"{slug}.mdx"
    if not path.exists():
        return False, "no mdx"
    files = list_slots(slug)
    if len(files) < 4:
        return False, f"need 4 images, have {len(files)}"

    original = path.read_text()
    wc_before = word_count(re.sub(r"^---.*?---\n", "", original, count=1, flags=re.S))

    cover = f"/images/blog/uniq/{slug}/{files[0]}"
    text = re.sub(
        r'^coverImage:\s+".*"',
        f'coverImage: "{cover}"',
        original,
        count=1,
        flags=re.M,
    )

    embed_urls = [f"/images/blog/uniq/{slug}/{files[i]}" for i in range(4)]
    embed_lines = [f"![{ALT[i]}]({embed_urls[i]})" for i in range(4)]

    # Split FM / body without altering body words
    if not text.startswith("---\n"):
        return False, "no frontmatter"
    end = text.find("\n---\n", 4)
    if end < 0:
        return False, "bad frontmatter"
    fm = text[: end + 5]
    body = text[end + 5 :]

    img_re = re.compile(r"^!\[([^\]]*)\]\(([^)]+)\)\s*$")

    # Collect indices of image-only lines we may replace (uniq for this slug OR blog/new/<slug>)
    lines = body.splitlines(keepends=True)
    our_idxs: list[int] = []
    for i, line in enumerate(lines):
        m = img_re.match(line.rstrip("\n"))
        if not m:
            continue
        url = m.group(2)
        if f"/images/blog/uniq/{slug}/" in url or url.startswith(f"/images/blog/new/{slug}/"):
            our_idxs.append(i)
        elif url == f"/images/blog/uniq/{slug}.jpg":
            our_idxs.append(i)

    if len(our_idxs) >= 4:
        # Replace first 4 existing embeds in place; leave extras as-is (or update if same slug)
        for j in range(4):
            lines[our_idxs[j]] = embed_lines[j] + "\n"
        # If more than 4 our embeds, leave them (don't delete — avoid shortening)
        new_body = "".join(lines)
    elif len(our_idxs) > 0:
        # Replace what we have, insert remaining near later ## headings
        for j, idx in enumerate(our_idxs):
            if j < 4:
                lines[idx] = embed_lines[j] + "\n"
        new_body = "".join(lines)
        missing = embed_lines[len(our_idxs) : 4]
        new_body = _insert_embeds(new_body, missing)
    else:
        # No embeds yet — insert 4 without removing any prose
        new_body = _insert_embeds(body, embed_lines)

    new_text = fm + new_body
    wc_after = word_count(re.sub(r"^---.*?---\n", "", new_text, count=1, flags=re.S))

    # Guard: never reduce word count for already-long posts
    if wc_before >= 1500 and wc_after < wc_before:
        return False, f"ABORT word drop {wc_before}->{wc_after}"

    if new_text != original:
        path.write_text(new_text)
    return True, f"ok words {wc_before}->{wc_after}"


def _insert_embeds(body: str, embeds: list[str]) -> str:
    """Insert embed lines after intro and near ## section boundaries. Never deletes text."""
    if not embeds:
        return body

    # After first paragraph block (first blank line after non-empty content)
    parts = re.split(r"(\n## )", body)
    # parts: [intro, '\n## ', sec1, '\n## ', sec2, ...]
    if len(parts) == 1:
        # no headings — append after first double newline
        chunks = body.split("\n\n", 1)
        if len(chunks) == 2:
            return chunks[0] + "\n\n" + embeds[0] + "\n\n" + chunks[1] + "".join(
                "\n\n" + e for e in embeds[1:]
            )
        return body.rstrip() + "\n\n" + "\n\n".join(embeds) + "\n"

    intro = parts[0]
    rest_parts = parts[1:]  # pairs of sep+section

    # Rebuild sections list
    sections: list[str] = []
    i = 0
    while i < len(rest_parts):
        if rest_parts[i] == "\n## " and i + 1 < len(rest_parts):
            sections.append("## " + rest_parts[i + 1])
            i += 2
        else:
            sections.append(rest_parts[i])
            i += 1

    out_intro = intro.rstrip() + "\n\n" + embeds[0] + "\n"
    remaining = embeds[1:]
    n = len(sections)
    # place remaining at ~1/3, 2/3, end of sections
    targets: list[int] = []
    if n >= 1 and remaining:
        targets.append(0)
    if n >= 3 and len(remaining) > 1:
        targets.append(n // 3)
    if n >= 2 and len(remaining) > 2:
        targets.append(max(0, (2 * n) // 3))
    # dedupe preserve order
    seen: set[int] = set()
    place: list[tuple[int, str]] = []
    for ti, emb in zip(targets, remaining):
        if ti in seen:
            continue
        seen.add(ti)
        place.append((ti, emb))
    leftover = remaining[len(place) :]

    for ti, emb in place:
        sections[ti] = sections[ti].rstrip() + "\n\n" + emb + "\n"

    out = out_intro + "\n" + "\n".join(sections)
    for emb in leftover:
        out = out.rstrip() + "\n\n" + emb + "\n"
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("slugs", nargs="+")
    ap.add_argument("--ingest-only", action="store_true")
    ap.add_argument("--wire-only", action="store_true")
    args = ap.parse_args()
    for slug in args.slugs:
        if not args.wire_only:
            placed = ingest_slug(slug)
            print(f"ingest {slug}: {placed}")
        if not args.ingest_only:
            ok, msg = wire_mdx(slug)
            print(f"wire {slug}: {msg}" + ("" if ok else " FAIL"))


if __name__ == "__main__":
    main()
