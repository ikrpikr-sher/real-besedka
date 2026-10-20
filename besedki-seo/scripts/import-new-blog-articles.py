#!/usr/bin/env python3
"""Import articles from Downloads pack into besedki-seo blog MDX + images."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

SRC = Path("/Users/user/Downloads/ВСЕ СТАТЬИ/беседки статьи новые")
ROOT = Path("/Users/user/real-besedka/besedki-seo")
BLOG = ROOT / "content" / "blog"
IMG_OUT = ROOT / "public" / "images" / "blog" / "new"
KATALOG = json.loads((ROOT / "data" / "katalog.json").read_text(encoding="utf-8"))

SKIP_SLUGS = {
    "besedka-ili-veranda",
    "besedka-na-sklone",
    "individualnyy-uzor-paneli",
}

GROUP_CATEGORY = {
    "01-vidy-besedok": "kak-vybrat",
    "02-razmery-planirovka": "kak-vybrat",
    "03-karkas-metall": "montazh-i-uhod",
    "04-krovlya": "montazh-i-uhod",
    "05-pol-nastil": "montazh-i-uhod",
    "06-fundament-svai": "montazh-i-uhod",
    "07-osteklenie-shtory-setki": "kak-vybrat",
    "08-lazernye-paneli-dizayn-loft": "stili",
    "09-pokrytie-kraska-zashchita": "montazh-i-uhod",
    "10-montazh-dostavka-sborka": "montazh-i-uhod",
    "11-sneg-veter-klimat": "montazh-i-uhod",
    "12-mangal-ochag-dym-pozharka": "kak-vybrat",
    "13-razresheniya-normy-uchastok": "kak-vybrat",
    "14-sravneniya-materialov": "sravneniya",
    "15-tseny-byudzhet-dogovor": "kak-vybrat",
    "16-navesy-hozbloki-pergoly-kacheli-mebel": "kak-vybrat",
    "17-ekspluatatsiya-uhod-remont": "montazh-i-uhod",
    "18-idei-stili-sezony": "proekty-i-idei",
    "19-biznes-kempingi-detskie-ploshchadki": "proekty-i-idei",
    "20-faq-mify-oshibki": "kak-vybrat",
    "90-goroda-200-po-4-stati": "kak-vybrat",
}

GROUP_TAGS = {
    "01-vidy-besedok": ["виды", "выбор"],
    "02-razmery-planirovka": ["размер", "планировка"],
    "03-karkas-metall": ["каркас", "80×80"],
    "04-krovlya": ["кровля", "вальма"],
    "05-pol-nastil": ["пол", "настил"],
    "06-fundament-svai": ["фундамент", "сваи"],
    "07-osteklenie-shtory-setki": ["остекление", "шторы"],
    "08-lazernye-paneli-dizayn-loft": ["лофт", "лазер"],
    "09-pokrytie-kraska-zashchita": ["порошок", "покрытие"],
    "10-montazh-dostavka-sborka": ["монтаж", "доставка"],
    "11-sneg-veter-klimat": ["снег", "климат"],
    "12-mangal-ochag-dym-pozharka": ["мангал", "огонь"],
    "13-razresheniya-normy-uchastok": ["нормы", "участок"],
    "14-sravneniya-materialov": ["сравнение", "материалы"],
    "15-tseny-byudzhet-dogovor": ["цены", "договор"],
    "16-navesy-hozbloki-pergoly-kacheli-mebel": ["навес", "мебель"],
    "17-ekspluatatsiya-uhod-remont": ["уход", "эксплуатация"],
    "18-idei-stili-sezony": ["идеи", "сезон"],
    "19-biznes-kempingi-detskie-ploshchadki": ["бизнес", "коммерция"],
    "20-faq-mify-oshibki": ["FAQ", "ошибки"],
    "90-goroda-200-po-4-stati": ["город", "регион"],
}

# Correct «от» from live katalog.json — never invent.
by_slug = {it["slug"]: it for it in KATALOG}


def money(n: int) -> str:
    return f"{n:,}".replace(",", " ") + " ₽"


PRICE_FIXES = [
    # (regex, replacement markdown)
    (
        r"Старт\s*2\s*[×x]\s*2\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Старт 2×2](/katalog/otkrytye-besedki/b-10) — от {money(by_slug['b-10']['priceFrom'])}",
    ),
    (
        r"Лофт\s*3\s*[×x]\s*4\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Лофт 3×4](/katalog/otkrytye-besedki/b-17) — от {money(by_slug['b-17']['priceFrom'])}",
    ),
    (
        r"Лофт\s*2\s*[×x]\s*3\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Лофт 2×3](/katalog/otkrytye-besedki/b-19) — от {money(by_slug['b-19']['priceFrom'])}",
    ),
    (
        r"Медведи\s*3\s*[×x]\s*3\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Медведи 3×3](/katalog/otkrytye-besedki/b-12) — от {money(by_slug['b-12']['priceFrom'])}",
    ),
    (
        r"Богатыри\s*4\s*[×x]\s*4\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Богатыри 4×4](/katalog/otkrytye-besedki/b-11) — от {money(by_slug['b-11']['priceFrom'])}",
    ),
    (
        r"Капсула\s*3\s*[×x]\s*3\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Панорама · Капсула](/katalog/besedki-s-ostekleniem/b-21) — от {money(by_slug['b-21']['priceFrom'])}",
    ),
    (
        r"Веранда\+?\s*3\s*[×x]\s*4\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Панорама · Веранда+](/katalog/besedki-s-ostekleniem/b-22) — от {money(by_slug['b-22']['priceFrom'])}",
    ),
    (
        r"Салон\s*4\s*[×x]\s*4\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Панорама · Салон](/katalog/besedki-s-ostekleniem/b-23) — от {money(by_slug['b-23']['priceFrom'])}",
    ),
    (
        r"остеклённая\s+Лофт\s*3\s*[×x]\s*4\s*[—\-–]\s*от\s*[\d\s]+\s*₽",
        f"[Лофт C8 3×4](/katalog/besedki-osteklennye-loft/b-53) — от {money(by_slug['b-53']['priceFrom'])}",
    ),
    (
        r"Беседки\s+от\s*[\d\s]+\s*₽",
        "Беседки — цены «от» в [каталоге](/katalog)",
    ),
]


def yaml_escape(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def parse_article(raw: str) -> tuple[dict, str]:
    raw = raw.lstrip("\ufeff")
    meta: dict[str, str] = {}
    body = raw
    if raw.startswith("---"):
        m = re.match(r"^---\n([\s\S]*?)\n---\n([\s\S]*)$", raw)
        if m:
            for line in m.group(1).splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    meta[k.strip()] = v.strip().strip("\"'")
            body = m.group(2)
            return meta, body
    # plain key: value header until first markdown heading
    lines = raw.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.match(r"^#\s+", line):
            break
        if re.match(r"^[a-zA-Z][\w]*:\s*", line):
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
            i += 1
            continue
        if line.strip() == "":
            i += 1
            continue
        break
    body = "\n".join(lines[i:])
    return meta, body


def pick_links(group: str, slug: str, title: str, body: str) -> list[tuple[str, str]]:
    s = f"{group} {slug} {title} {body[:1200]}".lower()
    links: list[tuple[str, str]] = []

    def add(label: str, path: str) -> None:
        if not any(p == path for _, p in links):
            links.append((label, path))

    if any(k in s for k in ["мангал", "огонь", "дым", "очаг", "жаров"]):
        add("BM-12 «Огонь» 3×3", "/katalog/besedki-s-mangalom/bm-12")
        add("M-03 мангал с дымоходом", "/katalog/mangaly/m-03")
        add("BM-11 «Огонь» 4×4", "/katalog/besedki-s-mangalom/bm-11")
    if any(k in s for k in ["остекл", "панорама", "створк", "стеклом", "зимн"]):
        add("B-22 Панорама Веранда+", "/katalog/besedki-s-ostekleniem/b-22")
        add("B-21 Панорама Капсула", "/katalog/besedki-s-ostekleniem/b-21")
        add("B-53 Лофт C8", "/katalog/besedki-osteklennye-loft/b-53")
    if any(k in s for k in ["лофт", "лазер", "панел", "орнамент"]):
        add("B-17 Лофт 3×4", "/katalog/otkrytye-besedki/b-17")
        add("B-12 Медведи", "/katalog/otkrytye-besedki/b-12")
        add("B-11 Богатыри", "/katalog/otkrytye-besedki/b-11")
    if any(k in s for k in ["навес"]):
        add("N-03 навес 5×4", "/katalog/navesy/n-03")
    if any(k in s for k in ["качел"]):
        add("Каталог качелей", "/katalog/kacheli")
    if any(k in s for k in ["2×2", "2x2", "старт"]):
        add("B-10 Старт 2×2", "/katalog/otkrytye-besedki/b-10")
    if any(k in s for k in ["3×4", "3x4"]):
        add("B-17 Лофт 3×4", "/katalog/otkrytye-besedki/b-17")
    if any(k in s for k in ["шестигран"]):
        add("B-51 шестигранная", "/katalog/otkrytye-besedki/b-51")
        add("B-52 шестигранная Ø3", "/katalog/otkrytye-besedki/b-52")
    # defaults
    for label, path in [
        ("B-17 Лофт 3×4", "/katalog/otkrytye-besedki/b-17"),
        ("B-12 Медведи 3×3", "/katalog/otkrytye-besedki/b-12"),
        ("B-22 Панорама", "/katalog/besedki-s-ostekleniem/b-22"),
        ("BM-12 Огонь", "/katalog/besedki-s-mangalom/bm-12"),
        ("B-11 Богатыри 4×4", "/katalog/otkrytye-besedki/b-11"),
    ]:
        add(label, path)
        if len(links) >= 5:
            break
    return links[:5]


def convert_image(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix.lower() in {".jpg", ".jpeg"}:
        shutil.copy2(src, dest)
        return
    # png/webp → jpeg via sips
    subprocess.run(
        ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", str(src), "--out", str(dest)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def fix_prices(text: str) -> str:
    out = text
    for pat, repl in PRICE_FIXES:
        out = re.sub(pat, repl, out, flags=re.I)
    # leftover generic wrong Start price
    out = re.sub(
        r"от\s*114\s*000\s*₽",
        f"от {money(by_slug['b-10']['priceFrom'])}",
        out,
    )
    # soften remaining bare «от N ₽» near known wrong amounts by pointing to catalog
    for wrong in ["222000", "720000", "324000", "288000", "540000", "210000", "960000"]:
        spaced = f"{int(wrong):,}".replace(",", " ")
        out = re.sub(
            rf"от\s*{spaced}\s*₽",
            "цена «от» в карточке каталога",
            out,
        )
        out = re.sub(
            rf"от\s*{wrong}\s*₽",
            "цена «от» в карточке каталога",
            out,
        )
    return out


def soft_windows_note(body: str) -> str:
    if re.search(r"мягк\w+\s+окн", body, re.I) and "мягкие окна мы не продаём" not in body.lower() and "мягкие окна завод не продаёт" not in body.lower():
        note = (
            "\n\n> Важно: мягкие окна ООО «Пулман» не продаёт. В каталоге — открытый «Графит», "
            "жёсткое остекление «Панорама»/лофт C8 и шторы как опция.\n"
        )
        # after first paragraph block
        parts = body.split("\n\n", 1)
        if len(parts) == 2:
            return parts[0] + note + "\n" + parts[1]
        return note + body
    return body


def ensure_links(body: str, links: list[tuple[str, str]]) -> str:
    marker = "## Карточки каталога по теме"
    if marker in body:
        body = re.sub(rf"\n*{re.escape(marker)}[\s\S]*?(?=\n## |\Z)", "", body)
    block = [f"\n\n{marker}\n", "Сверьте модели — цены «от» только в карточках:\n"]
    for label, path in links:
        block.append(f"- [{label}]({path})")
    return body.rstrip() + "\n" + "\n".join(block) + "\n"


def main() -> None:
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    imported = skipped = 0
    errors: list[str] = []

    articles = sorted(SRC.rglob("article.md"))
    for art_path in articles:
        slug = art_path.parent.name
        if slug in SKIP_SLUGS:
            skipped += 1
            continue
        group = art_path.relative_to(SRC).parts[0]
        raw = art_path.read_text(encoding="utf-8", errors="replace")
        meta, body = parse_article(raw)
        title = meta.get("title") or (re.search(r"^#\s+(.+)$", body, re.M).group(1) if re.search(r"^#\s+(.+)$", body, re.M) else slug)
        # drop duplicate H1 if equals title
        body = re.sub(rf"^#\s+{re.escape(title)}\s*\n+", "", body, count=1)
        description = meta.get("description") or (title[:150] + " — разбор ООО «Пулман».")
        if len(description) > 180:
            description = description[:177] + "…"

        # images
        foto_dir = art_path.parent / "foto"
        refs = re.findall(r"!\[([^\]]*)\]\(([^)]+)\)", body)
        cover_web = None
        rel_map: dict[str, str] = {}
        for idx, (alt, rel) in enumerate(refs):
            src_img = (art_path.parent / rel).resolve()
            if not src_img.exists():
                errors.append(f"missing img {slug} {rel}")
                continue
            stem = Path(rel).stem
            dest_name = f"{stem}.jpg"
            dest = IMG_OUT / slug / dest_name
            try:
                convert_image(src_img, dest)
            except Exception as e:  # noqa: BLE001
                errors.append(f"img fail {slug} {rel}: {e}")
                continue
            web = f"/images/blog/new/{slug}/{dest_name}"
            rel_map[rel] = web
            if cover_web is None:
                cover_web = web
            body = body.replace(f"![{alt}]({rel})", f"![{alt}]({web})")

        # also copy any unused foto files as extras
        if foto_dir.is_dir() and cover_web is None:
            for f in sorted(foto_dir.iterdir()):
                if f.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
                    continue
                dest = IMG_OUT / slug / f"{f.stem}.jpg"
                convert_image(f, dest)
                cover_web = f"/images/blog/new/{slug}/{f.stem}.jpg"
                body = f"![{title}]({cover_web})\n\n" + body
                break

        body = fix_prices(body)
        body = soft_windows_note(body)
        links = pick_links(group, slug, title, body)
        body = ensure_links(body, links)

        category = GROUP_CATEGORY.get(group, "kak-vybrat")
        tags = list(GROUP_TAGS.get(group, ["беседка"]))
        if group.startswith("90"):
            # city code from folder name like 108-vladivostok
            city_folder = art_path.relative_to(SRC).parts[1] if len(art_path.relative_to(SRC).parts) > 2 else ""
            city = city_folder.split("-", 1)[-1] if city_folder else "город"
            tags = ["город", city.replace("_", "-")][:2]

        # date: keep pack revision day
        date = "2026-09-30"
        fm = [
            "---",
            f"title: {yaml_escape(title)}",
            f"description: {yaml_escape(description)}",
            f'date: "{date}"',
            f'updated: "{date}"',
            'author: "Отдел проектирования ООО «Пулман»"',
            'authorRole: "Производитель металлических беседок"',
            f'category: "{category}"',
            "tags:",
            *[f'  - "{t}"' for t in tags],
        ]
        if cover_web:
            fm.append(f'coverImage: "{cover_web}"')
        fm.append("dzen: false")
        fm.append("---")
        out = "\n".join(fm) + "\n\n" + body.strip() + "\n"
        (BLOG / f"{slug}.mdx").write_text(out, encoding="utf-8")
        imported += 1
        if imported % 100 == 0:
            print(f"… {imported}")

    print(f"imported={imported} skipped={skipped} errors={len(errors)}")
    for e in errors[:20]:
        print("ERR", e)


if __name__ == "__main__":
    main()
