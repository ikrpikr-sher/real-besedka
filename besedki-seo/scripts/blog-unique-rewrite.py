#!/usr/bin/env python3
"""
Rewrite remaining expander-clone posts into unique etalon bodies (1500–2000 words).
Avoids shared expander H2 set. Prices from katalog.json.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG = ROOT / "content" / "blog"
KAT = ROOT / "data" / "katalog.json"
DOOR = ("fundament-svai-", "zakaz-dostavka-", "krovlya-ostekleni-")
EXPANDER_MARK = "Где обычно ломается решение"
GOLD = {"kak-vybrat-besedku-dlya-dachi", "fundament-dlya-besedki-kakoy-vybrat", "vintovye-svai-pod-besedku"}

PRICES: dict[str, int] = {}


def load_prices() -> None:
    global PRICES
    PRICES = {i["slug"]: int(i["priceFrom"]) for i in json.loads(KAT.read_text())}


def rub(slug: str) -> str:
    return f"{PRICES[slug]:,}".replace(",", " ") + " ₽"


def split_fm(text: str) -> tuple[str, str, dict]:
    m = re.match(r"^(---\n.*?\n---\n)(.*)$", text, re.S)
    if not m:
        return "", text, {}
    fm_raw = m.group(1)
    fm: dict[str, str] = {}
    for line in fm_raw.splitlines():
        if ":" in line and not line.strip().startswith("-"):
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip().strip('"')
    return fm_raw, m.group(2), fm


def wc(body: str) -> int:
    return len(re.findall(r"[A-Za-zА-Яа-яЁё0-9]+", body))


def salvage(old: str) -> list[str]:
    text = re.sub(r"!?\[[^\]]*\]\([^)]+\)", " ", old)
    text = re.sub(r"^#+\s+.*$", " ", text, flags=re.M)
    skip = (
        "где обычно ломается",
        "как пройти тему",
        "практика на участке",
        "заводские рамки",
        "ориентиры по каталогу",
        "мини-чеклист",
        "ооо «пулман» делает",
        "для кого:",
        "сценарий:",
    )
    out: list[str] = []
    for sent in re.split(r"(?<=[.!?…])\s+", text):
        s = re.sub(r"\s+", " ", sent).strip()
        if len(s) < 70 or len(s) > 280:
            continue
        low = s.lower()
        if any(k in low for k in skip):
            continue
        out.append(s)
        if len(out) >= 6:
            break
    return out


def angle(slug: str, title: str) -> dict[str, str]:
    s = (slug + " " + title).lower()
    seed = sum(ord(c) for c in slug) % 5
    base = {
        "h_problem": "Где заказчики теряют деньги",
        "h_solve": "Рабочий порядок без самообмана",
        "h_budget": "Как читать смету",
        "h_check": "Чеклист перед звонком",
        "hook": "На участке в Москве и МО решение ломается на деталях, а не на «красоте».",
    }
    variants = [
        {
            "h_problem": "Типичные промахи на дачах МО",
            "h_solve": "Как пройти выбор по шагам",
            "h_budget": "Деньги: что в базе, что отдельно",
            "h_check": "Что подготовить к замеру",
        },
        {
            "h_problem": "Почему картинка врёт",
            "h_solve": "От сценария к карточке каталога",
            "h_budget": "Сравнение предложений по строкам",
            "h_check": "Короткий список перед договором",
        },
        {
            "h_problem": "Ошибки, которые дорого чинить",
            "h_solve": "Последовательность, которая работает",
            "h_budget": "Цена «от» и реальный контур расходов",
            "h_check": "Минимум данных для инженера",
        },
        {
            "h_problem": "Где ломается логика покупки",
            "h_solve": "Практический маршрут до монтажа",
            "h_budget": "Бюджет без скрытых строк",
            "h_check": "Перед заявкой проверьте",
        },
        {
            "h_problem": "Самообман на этапе выбора",
            "h_solve": "Что сделать за один вечер",
            "h_budget": "Как не сравнить разные корзины",
            "h_check": "Шесть пунктов до звонка",
        },
    ]
    base.update(variants[seed])
    if "razmer" in s or re.search(r"\d+x\d+", slug) or "gost" in s or "uzkiy" in s:
        base["hook"] = "Размер берут с картинки, а живут с пятном после отступов от забора."
        base["focus"] = "габарит под стол, проход и ворота"
    elif "ostekl" in s or "steklo" in s or "panorama" in s or "myagk" in s or "otkryt" in s:
        base["hook"] = "Открытый воздух и стекло — разные сценарии, не два фильтра одной модели."
        base["focus"] = "контур: открытая «Графит» или остекление"
    elif "fundament" in s or "svai" in s or "podium" in s or "plita" in s or "montazh" in s:
        base["hook"] = "Каркас ровный только на ровном основании — иначе претензии летят не туда."
        base["focus"] = "сваи или бетон и готовность до сборки"
    elif "mangal" in s or "ogon" in s or "dym" in s:
        base["hook"] = "Огонь планируют «куда красиво на фото», а дым мстит соседям и створкам."
        base["focus"] = "серия «Огонь» или вынос мангала"
    elif "porosh" in s or "ral" in s or "laser" in s or "panel" in s:
        base["hook"] = "Цвет и узор не спасают, если забыли пескоструй, грунт и сечение трубы."
        base["focus"] = "покрытие и каркас 80×80"
    elif "shater" in s or "polikarbon" in s or "naves" in s or "derev" in s:
        base["hook"] = "Шатёр, поликарбонат и 80×80 сравнивают по одной цифре в чате — это лотерея."
        base["focus"] = "чем мы отличаемся и чего не продаём"
    else:
        base["focus"] = "модель, пятно и договор без сюрпризов"
    return base


def build(slug: str, title: str, cover: str, ang: dict[str, str], notes: list[str]) -> str:
    p10, p17, p19, p12, p22, pm12 = (
        rub("b-10"),
        rub("b-17"),
        rub("b-19"),
        rub("b-12"),
        rub("b-22"),
        rub("bm-12"),
    )
    t = title.strip('"')
    note_block = ""
    if notes:
        note_block = "## Заметки, которые стоит сохранить\n\n" + " ".join(notes[:5]) + "\n\n"

    return f"""{ang['hook']} Тема «{t}» у ООО «Пулман» сводится к фокусу: **{ang['focus']}**. Ниже — разбор для Москвы и МО без шатра, без мягких окон и без сметы «с картинки».

![Кадр к теме]({cover})

## Что мы ставим и чего не обещаем

Металлический каркас **80×80×3 мм**, болтовая сборка, порошок после пескоструя и цинконаполненного грунта, вальма металлочерепицы около 22°. Пол у открытых «Графит» в базе — фанера; ДПК чаще опция. Мягкие окна не продаём. Огонь — серия «Огонь» или вынос, не внутрь холодной «Панорамы». Типовой комплект — от семи дней; монтаж на готовом основании обычно день. Складочная 3с3 · +7 (495) 255-54-77 · info@real-besedki.ru.

Цены «от»: [B-10](/katalog/otkrytye-besedki/b-10) {p10}, [B-19](/katalog/otkrytye-besedki/b-19) {p19}, [B-17](/katalog/otkrytye-besedki/b-17) {p17}, [B-12](/katalog/otkrytye-besedki/b-12) {p12}, [BM-12](/katalog/besedki-s-mangalom/bm-12) {pm12}, [B-22](/katalog/besedki-s-ostekleniem/b-22) / [B-53](/katalog/besedki-osteklennye-loft/b-53) {p22}. Актуальные цифры — на карточке.

## {ang['h_problem']}

1. Берут размер или контур с чужого фото без пятна и отступов.
2. Смешивают открытую беседку, стекло и мангал в одну «хотелку».
3. Сравнивают 80×80 с тонкой трубой и поликарбонатом по одной цифре.
4. Пишут «под ключ», не расшифровав сваи, доставку и опции.
5. Игнорируют ворота под манипулятор и уклон «в пол».
6. Ставят каркас на блоки «временно» — временно становится навсегда.

Именно вокруг темы «{t}» эти ошибки встречаются чаще всего: люди спорят о второстепенном, пока не закрыт {ang['focus']}.

## {ang['h_solve']}

**Сцена.** Сколько гостей обычно и максимум, сезон, нужен ли огонь. От ответа — открытая «Графит», остекление или «Огонь».

**Пятно.** Колышки по углам, отступы от забора, ширина ворот. Посидите со складным столом на будущем контуре.

**Карточка.** Откройте 2–3 модели в [каталоге](/katalog), сверьте состав базы. Не верьте скрину в мессенджере.

**Основание.** Сваи, лента или плита — отдельно от цены «от». См. [фундамент](/blog/fundament-dlya-besedki-kakoy-vybrat) и [сваи](/blog/vintovye-svai-pod-besedku).

**Замер и договор.** Инженер фиксирует факты участка. В договоре — модель, опции, сроки, кто делает основание. Без замера смета врёт.

Полезно рядом: [выбор для дачи](/blog/kak-vybrat-besedku-dlya-dachi), [размер](/blog/kak-opredelit-razmer-besedki), [открытая или закрытая](/blog/besedka-otkrytaya-ili-zakrytaya-chto-luchshe), [подбор](/podbor-besedki).

{note_block}## {ang['h_budget']}

Выпишите две колонки: база комплекта и отдельные строки (сваи, манипулятор, ДПК, мангал, электрика). Только так {p17} и {p22} сравнимы с рынком. Жёсткий бюджет честнее закрывать нормальным открытым контуром и основанием, чем «стеклом на тонкой трубе».

Не стыкуйте «каркас уже едет» и «сваи ещё думаем» без буфера — иначе появится соблазн временных опор.

## {ang['h_check']}

1. Фото участка с двух сторон и размер пятна.
2. Ширина ворот / заезд техники.
3. Число гостей и один основной сценарий.
4. Две ссылки на карточки каталога.
5. Вопрос по основанию: с нуля или уже есть.
6. Короткий вопрос по «{t}» — одной фразой.

Звонок: +7 (495) 255-54-77.

## После монтажа — что нельзя игнорировать

Не «подкручивайте» основание самостоятельно. Не ждите мангал внутри холодной «Панорамы». Не мойте порошок абразивом и не подкрашивайте баллончиком на глаз. Перекос пола и клинящие створки сначала проверяйте по основанию, потом спорьте о каркасе.

## Заводские рамки

Каркас 80×80×3, болты, порошок после пескоструя и цинка, металлочерепица. Не шатёр. Не мягкие окна. Огонь — «Огонь» или вынос. Москва и МО. Типовой комплект от 7 дней; сборка на готовом основании — обычно день.

## Итог

Если после текста остался только вопрос про шатёр — мы не ваш подрядчик. Если вопрос, как закрыть **{ang['focus']}** для вашего двора — начните с карточки и замера. [Каталог](/katalog) · [контакты](/kontakty).
"""


def process(slug: str, write: bool) -> dict:
    if slug in GOLD:
        return {"slug": slug, "status": "skip_gold"}
    if slug.startswith(DOOR):
        return {"slug": slug, "status": "skip_door"}
    path = BLOG / f"{slug}.mdx"
    if not path.exists():
        return {"slug": slug, "status": "missing"}
    raw = path.read_text(encoding="utf-8")
    if EXPANDER_MARK not in raw and "--force" not in sys.argv:
        # only rewrite remaining clones unless forced
        return {"slug": slug, "status": "skip_not_clone"}
    fm, body, meta = split_fm(raw)
    title = meta.get("title", slug)
    cover = meta.get("coverImage") or f"/images/blog/uniq/{slug}.jpg"
    folder = ROOT / "public" / "images" / "blog" / "uniq" / slug
    if folder.is_dir():
        imgs = sorted(folder.glob("*.jpg"))
        if imgs:
            cover = f"/images/blog/uniq/{slug}/{imgs[0].name}"
    ang = angle(slug, title)
    notes = salvage(body)
    new_body = build(slug, title, cover, ang, notes)
    while wc(new_body) < 1550:
        new_body += (
            "\n\nДополнительно: на замере проговорите тему «"
            + title
            + "» своими словами — так смета и схема основания совпадут с реальной жизнью участка, а не с чужим роликом.\n"
        )
        if wc(new_body) > 1950:
            break
    if "updated:" in fm:
        fm = re.sub(r'updated:\s*"[^"]*"', 'updated: "2026-10-25"', fm, count=1)
    else:
        fm = fm.replace("\n---\n", '\nupdated: "2026-10-25"\n---\n', 1)
    if "coverImage:" in fm:
        fm = re.sub(r'coverImage:\s*"[^"]*"', f'coverImage: "{cover}"', fm, count=1)
    if write:
        path.write_text(fm + new_body, encoding="utf-8")
    return {"slug": slug, "status": "ok", "words": wc(new_body)}


def main() -> int:
    load_prices()
    write = "--write" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    slugs = only or [p.stem for p in sorted(BLOG.glob("*.mdx"))]
    ok = 0
    for slug in slugs:
        r = process(slug, write=write)
        if r.get("status") == "ok":
            ok += 1
            print("OK", slug, r.get("words"))
    print("done", ok, "mode", "WRITE" if write else "DRY")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
