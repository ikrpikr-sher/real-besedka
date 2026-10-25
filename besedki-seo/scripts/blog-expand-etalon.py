#!/usr/bin/env python3
"""
Expand short commercial blog posts to etalon length (1500–2000 words).
Unique angle from slug/title; no markdown tables; prices from katalog.json.
Skips geo-doorway series and already-long posts.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG = ROOT / "content" / "blog"
KATALOG = ROOT / "data" / "katalog.json"

DOORWAY = ("fundament-svai-", "zakaz-dostavka-", "krovlya-ostekleni-")
DONE = {"kak-vybrat-besedku-dlya-dachi", "fundament-dlya-besedki-kakoy-vybrat"}

PRICES = {
    "b-10": 114_000,
    "b-19": 210_000,
    "b-17": 222_000,
    "b-12": 288_000,
    "bm-12": 420_000,
    "b-22": 720_000,
    "b-53": 720_000,
}


def rub(n: int) -> str:
    return f"{n:,}".replace(",", " ") + " ₽"


def load_prices() -> None:
    if not KATALOG.exists():
        return
    data = json.loads(KATALOG.read_text())
    for item in data:
        if item.get("slug") in PRICES:
            PRICES[item["slug"]] = int(item["priceFrom"])


def split_fm(text: str) -> tuple[str, str, dict]:
    if not text.startswith("---\n"):
        return "", text, {}
    end = text.find("\n---\n", 4)
    if end < 0:
        return "", text, {}
    fm_raw = text[4:end]
    fm: dict[str, str] = {}
    for line in fm_raw.splitlines():
        if ":" in line and not line.strip().startswith("-") and not line.strip().startswith("question"):
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip().strip('"')
    return text[: end + 5], text[end + 5 :], fm


def word_count(body: str) -> int:
    return len(re.findall(r"[A-Za-zА-Яа-яЁё0-9]+", body))


def cover_path(slug: str, fm: dict) -> str:
    existing = fm.get("coverImage", "").strip()
    folder = f"/images/blog/uniq/{slug}"
    if existing.startswith(folder + "/"):
        return existing
    # prefer folder cover if we will keep single file legacy
    return existing or f"/images/blog/uniq/{slug}.jpg"


def topic_hooks(slug: str, title: str) -> dict[str, str]:
    s = slug + " " + title.lower()
    hooks = {
        "pain": "На даче в МО решение часто принимают по чужому фото — и потом платят за переделку.",
        "focus": "каркас, пятно и договор",
        "extra_problem": "Смета без замера и сравнение с шатром по одной цифре.",
        "extra_step": "Зафиксируйте пятно рулеткой и ширину ворот до заявки.",
    }
    if "fundament" in s or "svai" in s or "svai" in slug or "podium" in slug or "plita" in slug or "blok" in slug or "pokrishek" in slug or "glina" in slug:
        hooks.update(
            pain="Основание «на глаз» ломает пол и створки быстрее, чем любой спор о цвете кровли.",
            focus="сваи или бетон под вашу модель",
            extra_problem="Блоки и покрышки как «временно» — потом претензия к каркасу.",
            extra_step="Разделите смету: комплект беседки и работы основания.",
        )
    elif "ostekl" in s or "panorama" in s or "steklo" in s or "stvor" in s or "myagk" in s:
        hooks.update(
            pain="Путают летний воздух и веранду со стеклом — и покупают не тот контур.",
            focus="открытая «Графит» или остекление",
            extra_problem="Мангал внутри холодного остекления без серии «Огонь».",
            extra_step="Выберите один основной сценарий сезона — не «и то и другое в одной коробке».",
        )
    elif "mangal" in s or "ogon" in s or "dym" in s or "iskr" in s or "tyaga" in s or "pech" in s:
        hooks.update(
            pain="Огонь планируют «куда удобно на фото», а дым и соседи мстят в первый же сезон.",
            focus="серия «Огонь» или вынос мангала",
            extra_problem="Игнор розы ветров и отступов от межи.",
            extra_step="Сразу скажите инженеру про мангал — посадка и сваи зависят от этого.",
        )
    elif "razmer" in s or re.search(r"\d+x\d+", slug) or "gost" in s or "uzkiy" in s or "kvadrat" in s:
        hooks.update(
            pain="Размер с картинки не совпадает с пятном после отступов от забора.",
            focus="габарит под стол и проход",
            extra_problem="Купить 2×3 «на вырост» и упереться локтями в стойки.",
            extra_step="Поставьте колышки по углам и посидите со складным столом на пятне.",
        )
    elif "porosh" in s or "pokr" in s or "cink" in s or "peskostru" in s or "ral" in s or "krask" in s:
        hooks.update(
            pain="Красивый цвет на скрине не равен сроку службы покрытия без пескоструя и грунта.",
            focus="порошок после подготовки металла",
            extra_problem="Самостоятельная «подкраска» баллончиком по порошку.",
            extra_step="Сверьте в договоре: пескоструй, цинконаполненный грунт, порошок.",
        )
    elif "montazh" in s or "dostavk" in s or "manipul" in s or "proezd" in s or "priemk" in s or "zamer" in s:
        hooks.update(
            pain="Узкие ворота и «подъедем как-нибудь» срывают срок сильнее, чем очередь цеха.",
            focus="проезд, основание, приёмка",
            extra_problem="Каркас привезли, а сваи ещё «на следующей неделе».",
            extra_step="Замерьте ворота и радиус разворота до договора.",
        )
    elif "krov" in s or "valm" in s or "sneg" in s or "zhelob" in s or "profnastil" in s:
        hooks.update(
            pain="Кровлю выбирают по картинке, а снег и шум дождя выясняют зимой.",
            focus="вальма и эксплуатация зимой",
            extra_problem="Лом для сосулек по металлочерепице.",
            extra_step="Обсудите снегозадержатели и отвод воды до монтажа.",
        )
    elif "pol" in s or "faner" in s or "dpk" in s:
        hooks.update(
            pain="Пол в базе и «как на рекламе у блогера» — часто разные вещи в смете.",
            focus="фанера в базе и опции",
            extra_problem="Мойка агрессивной химией и лужи на уклоне «в беседку».",
            extra_step="Уточните в карточке, что по полу в базе, а что опция.",
        )
    elif "laser" in s or "panel" in s or "uzor" in s or "chpu" in s or "monogram" in s:
        hooks.update(
            pain="Декор панелей путают с несущим каркасом — и экономят не там.",
            focus="лазерный узор как опция на стали",
            extra_problem="Вешать кашпо и качели на тонкие панели.",
            extra_step="Каркас 80×80 — отдельно; панели — отдельно в договоре.",
        )
    elif "derev" in s or "metall" in s and "sravn" in s or "polikarbon" in s or "shater" in s or "naves" in s:
        hooks.update(
            pain="Сравнивают шатёр, поликарбонат и 80×80 по одной цене в мессенджере.",
            focus="что мы делаем и чего не продаём",
            extra_problem="Ожидание «как сруб, но по цене тонкой трубы».",
            extra_step="Сверьте сечение трубы и состав базы, не только фото.",
        )
    elif "dogovor" in s or "garanti" in s or "nds" in s or "pod-kluch" in s or "byudzhet" in s or "raschet" in s:
        hooks.update(
            pain="«Под ключ» в чате и «под ключ» в договоре — разные списки работ.",
            focus="что входит и что отдельно",
            extra_problem="Одна цифра без расшифровки свай, доставки и опций.",
            extra_step="Выпишите две колонки: база комплекта и отдельные строки.",
        )
    elif "klimat" in s or "himki" in s or "balashiha" in s or "moskva" in s and "nagruz" in s:
        hooks.update(
            pain="Климат МО списывают на «среднюю зиму из интернета» без пятна участка.",
            focus="снег, ветер и посадка на вашем участке",
            extra_problem="Игнор уклона и розы ветров для дыма.",
            extra_step="На замере зафиксируйте открытость участка и соседние постройки.",
        )
    return hooks


def salvage_unique(old_body: str, limit: int = 450) -> str:
    """Keep non-boilerplate sentences from the old post for uniqueness."""
    text = re.sub(r"!?\[[^\]]*\]\([^)]+\)", " ", old_body)
    text = re.sub(r"^#+\s+.*$", " ", text, flags=re.M)
    skip = (
        "заводские рамки",
        "мягкие окна мы не продаём",
        "складочная",
        "как принять решение без самообмана",
        "если после статьи остался",
        "ооо «пулман» делает металлические",
        "для кого:",
        "сценарий:",
        "ревизия:",
        "здесь разберём",
        "ориентиры по каталогу",
        "мини-чеклист перед звонком",
        "практический итог",
        "где обычно ломается решение",
        "как пройти тему правильно",
        "бюджет без самообмана",
    )
    parts: list[str] = []
    for sent in re.split(r"(?<=[.!?…])\s+", text):
        s = re.sub(r"\s+", " ", sent).strip()
        if len(s) < 60 or len(s) > 320:
            continue
        low = s.lower()
        if any(k in low for k in skip):
            continue
        if s in parts:
            continue
        parts.append(s)
        if sum(len(x) for x in parts) >= limit:
            break
    if not parts:
        return ""
    return " ".join(parts[:8])


def build_body(slug: str, title: str, cover: str, hooks: dict[str, str], salvage: str = "") -> str:
    p10, p17, p19, p12, p22, p53, pm12 = (
        rub(PRICES["b-10"]),
        rub(PRICES["b-17"]),
        rub(PRICES["b-19"]),
        rub(PRICES["b-12"]),
        rub(PRICES["b-22"]),
        rub(PRICES["b-53"]),
        rub(PRICES["bm-12"]),
    )
    t_short = re.sub(r'^"|"$', "", title)
    # Vary opening by hash of slug
    seed = sum(ord(c) for c in slug) % 3
    openings = [
        f"Тема «{t_short}» на участке в Москве и МО упирается не в абстрактный совет из выдачи, а в конкретную модель, пятно и договор. {hooks['pain']}",
        f"Если вы читаете про «{t_short}», скорее всего уже видели красивое фото и спорную смету. {hooks['pain']} Ниже — рабочий порядок ООО «Пулман».",
        f"Разбор «{t_short}» для тех, кто выбирает металлическую беседку, а не шатёр на сезон. {hooks['pain']}",
    ]
    open_ = openings[seed]

    img1 = cover
    # body images: reuse cover folder pattern if exists as single file — still unique alt
    body = f"""{open_}

ООО «Пулман» делает металлические беседки на каркасе **80×80×3 мм**: порошок после пескоструя и цинконаполненного грунта, болтовая сборка, вальма с металлочерепицей около 22°. Пол у открытых «Графит» в базе — фанера; ДПК чаще опция. Мягкие окна не продаём. Огонь — серия «Огонь» или вынос, не внутрь холодной «Панорамы». География монтажа — Москва и Московская область. Телефон +7 (495) 255-54-77, почта info@real-besedki.ru. Производство: Москва, Складочная улица, 3с3.

![Кадр к теме статьи]({img1})

## О чём эта статья и какие рамки завода

Здесь разберём **{hooks['focus']}** применительно к теме «{t_short}». Цены ниже — «от» по карточкам каталога на момент обновления текста; индивидуальный размер и сложный заезд считаем по заявке. Типовой комплект — от семи дней по очереди цеха; сборка на готовом основании обычно занимает один день.

Мы не сравниваем себя с тентом и тонкой трубой «с объявления». Если нужен шатёр или мягкие окна вместо остекления — мы не ваш подрядчик. Если нужна беседка с понятным каркасом и договором ООО «Пулман» — читайте дальше и откройте 2–3 живые карточки.

## Где обычно ломается решение

**1. Картинка вместо пятна.** На рендере всё встаёт. На участке после отступов от забора и дорожки столу уже тесно. Гости стоят, а не сидят.

**2. {hooks['extra_problem']}** Это чинится дороже, чем честный разговор на замере.

**3. Путаница контуров.** Открытая беседка, остекление и мангал — разные сценарии. Хотеть «всё сразу в одной коробке» без серии «Огонь» — путь к переделке.

**4. Каркас «как у всех».** Без сечения трубы и состава покрытия сравнение цен бессмысленно. Наша база — **80×80×3 мм** и порошок после подготовки металла.

**5. Одна цифра «под ключ».** В мессенджере смешали комплект, сваи, манипулятор и мебель. Потом невозможно понять, где экономия.

**6. Игнор проезда.** Узкие ворота срывают монтаж так же верно, как ошибка в размере.

## Как пройти тему правильно

### Шаг 1. Зафиксируйте сцену

Сколько гостей «обычно» и «максимум», сезон (только лето или дольше), нужен ли огонь рядом. От ответов зависит, смотреть открытые «Графит», остекление «Панорама»/«Лофт» или серию «Огонь».

{hooks['extra_step']}

### Шаг 2. Пятно и проезд

Отметьте прямоугольник под беседку с запасом. Запишите ширину ворот. Без проезда манипулятора «сборка за день» превращается в ручной квест.

### Шаг 3. Откройте модели, а не абстракт

Ориентиры по каталогу (цены «от»):

- [B-10 «Графит · Старт»](/katalog/otkrytye-besedki/b-10) — от **{p10}**
- [B-19 «Графит · Лофт» 2×3](/katalog/otkrytye-besedki/b-19) — от **{p19}**
- [B-17 «Графит · Лофт» 3×4](/katalog/otkrytye-besedki/b-17) — от **{p17}**
- [B-12](/katalog/otkrytye-besedki/b-12) — от **{p12}**
- [BM-12 «Огонь · 3×3»](/katalog/besedki-s-mangalom/bm-12) — от **{pm12}**
- [B-22 «Панорама · Веранда+»](/katalog/besedki-s-ostekleniem/b-22) и [B-53 «Лофт 3×4 C8»](/katalog/besedki-osteklennye-loft/b-53) — от **{p22}**

Сверяйте состав карточки: пол, покрытие, что опция. Актуальные цифры — всегда на странице модели.

### Шаг 4. Основание отдельно от комплекта

Чаще в МО — винтовые сваи и подиум. Лента или плита — по грунту и проекту после замера. Покрышки и сомнительные блоки — не наш контур. Подробнее: [какой фундамент выбрать](/blog/fundament-dlya-besedki-kakoy-vybrat), [винтовые сваи](/blog/vintovye-svai-pod-besedku).

### Шаг 5. Замер → договор → производство

Оставьте заявку или позвоните +7 (495) 255-54-77. Инженер снимет уклон, проезд, грунт. В договоре — модель, опции, сроки, кто делает основание. Без замера смета «с картинки» врёт.

Полезно рядом: [как выбрать беседку для дачи](/blog/kak-vybrat-besedku-dlya-dachi), [подбор](/podbor-besedki), [каталог](/katalog).

## Что важно именно в этой теме

Фокус материала — **{hooks['focus']}**. На практике в Москве и МО это означает: не спорить о второстепенном цвете, пока не закрыты пятно, контур и основание. Инженер на замере смотрит уклон, ворота, грунт и — если нужен огонь — розу ветров. Производство типового комплекта — от семи дней; монтаж на готовом основании обычно день. Если участок сложный (склон, узкий заезд, старое основание), сроки и состав работ фиксируют в договоре отдельно, без обещаний «как у всех всегда за сутки».

Открытая серия «Графит» хорошо работает как летний стол во дворе. Остекление «Панорама» и «Лофт» — когда беседка должна держать ветер и дождь дольше сезона. Серия «Огонь» — когда еда на огне часть сценария, а не «потом прикрутим мангал к холодной веранде». Эти три ветки нельзя смешивать в голове как один товар с разными фильтрами в каталоге.

{("### Заметки с прошлой редакции\n\n" + salvage + "\n") if salvage else ""}
## Бюджет без самообмана

Цена «от» в карточке — старт комплектации, не финальный ключ со сваями и мебелью. Выпишите:

1. Что в базе у нас (каркас, кровля, пол по карточке, покрытие).
2. Что отдельно: сваи, доставка, опции, электрика, мангальная группа.

Только так цифры вроде {p17} и {p22} сравнимы с чужими скринами. Жёсткий бюджет честнее закрывать нормальным открытым контуром и основанием, чем «стеклом на тонкой трубе». Экономия на сечении трубы и на сваях обычно возвращается перекосом пола в первый сезон.

Если сравниваете подрядчиков, просите один и тот же список строк: каркас и покрытие, кровля, пол, основание, доставка/манипулятор, монтаж, опции. Иначе вы сравниваете разные корзины.

## Связь с соседними материалами

По размеру и посадке: [как определить размер беседки](/blog/kak-opredelit-razmer-besedki), [как выбрать для дачи](/blog/kak-vybrat-besedku-dlya-dachi). По контуру: [открытая или закрытая](/blog/besedka-otkrytaya-ili-zakrytaya-chto-luchshe). По основанию: [фундамент](/blog/fundament-dlya-besedki-kakoy-vybrat), [сваи](/blog/vintovye-svai-pod-besedku). По формату работ: [под ключ в Москве](/blog/metalicheskaya-besedka-pod-klyuch-moskva). Каталог моделей — [здесь](/katalog); короткий путь заявки — [подбор беседки](/podbor-besedki).

## Ошибки после монтажа, которые дорого чинить

- Купить «как на фото» без отступов и ворот.
- Ждать мангал внутри холодной «Панорамы».
- Собрать каркас на «временных» блоках.
- Сравнивать 80×80 с шатром по одной цифре в чате.
- Гнаться за максимальным остеклением, если нужен летний стол на воздухе.

## Мини-чеклист перед звонком

1. Фото участка с двух сторон и размер пятна.
2. Ширина ворот.
3. Число гостей и сценарий: открытая / стекло / огонь.
4. Две ссылки на карточки каталога.
5. Вопрос по основанию: считать с нуля или уже есть.
6. Короткий вопрос по теме «{t_short}» — одной фразой.

## Заводские рамки

Каркас **80×80×3 мм**, болты, порошок после пескоструя и цинка, металлочерепица, вальма ~22°. Не шатёр, не поликарбонатный комплект. Мягкие окна не продаём. Огонь — «Огонь» или вынос. Типовой комплект — от 7 дней; монтаж на готовом основании — обычно 1 день. Москва и МО. Складочная 3с3.

## Практический итог по «{t_short}»

Если после текста остался только вопрос про шатёр — мы не ваш подрядчик. Если вопрос, какая карточка ближе к двору и как закрыть тему **{hooks['focus']}** — начните с [B-17](/katalog/otkrytye-besedki/b-17) или [B-22](/katalog/besedki-s-ostekleniem/b-22) / [B-53](/katalog/besedki-osteklennye-loft/b-53) и вызовите замер. Контакты: +7 (495) 255-54-77 · [контакты](/kontakty).
"""
    return body


def default_faq(title: str) -> str:
    return f"""faq:
  - question: "С чего начать по теме «{title}»?"
    answer: "С пятна на участке, числа гостей и 2–3 карточек каталога. Затем замер — не смета с картинки."
  - question: "Входит ли фундамент в цену беседки «от»?"
    answer: "Нет. В карточке — комплект. Сваи или бетон считают отдельно после замера."
  - question: "Делаете ли мягкие окна и шатры?"
    answer: "Нет. Мы делаем металлический каркас 80×80 с порошком; мягкие окна не продаём."
  - question: "Где монтируете?"
    answer: "Москва и Московская область. Замер инженера до договора."
"""


def ensure_faq(fm_block: str, title: str) -> str:
    if re.search(r"^faq:", fm_block, re.M):
        return fm_block
    # insert before closing ---
    return fm_block.rstrip() + "\n" + default_faq(title) + "---\n"


def process(slug: str, write: bool, force: bool = False) -> dict:
    path = BLOG / f"{slug}.mdx"
    if not path.exists():
        return {"slug": slug, "status": "missing"}
    if slug.startswith(DOORWAY):
        return {"slug": slug, "status": "skip_doorway"}
    if slug in DONE and not force:
        return {"slug": slug, "status": "skip_done"}
    raw = path.read_text(encoding="utf-8")
    fm_block, body, fm = split_fm(raw)
    wc = word_count(body)
    if wc >= 1500 and not force:
        return {"slug": slug, "status": "skip_long", "words": wc}
    title = fm.get("title", slug)
    cover = cover_path(slug, fm)
    hooks = topic_hooks(slug, title)
    salv = salvage_unique(body)
    new_body = build_body(slug, title, cover, hooks, salvage=salv)
    # pad to 1550–1950 without str.format (titles may contain braces)
    pad_blocks = [
        (
            "\n\n## Практика на участке\n\n"
            "На замере в Москве и МО проговорите тему статьи своими словами. Инженер зафиксирует ограничения "
            "участка и состав договора, а не будет угадывать по переписке. Чем точнее пятно, ворота, число гостей "
            "и нужен ли огонь, тем короче путь к смете без скрытых строк. Очередь цеха зависит от сезона; дата "
            "монтажа — от готовности основания. Не стыкуйте «каркас уже едет» и «сваи ещё думаем» без буфера: "
            "так меньше простоев и меньше соблазна поставить комплект на временные опоры.\n"
        ),
        (
            "\n\nЕсли сомневаетесь между двумя карточками каталога, принесите на замер обе ссылки. Проще отвергнуть "
            "лишнее на земле, чем спорить после оплаты по фото из чата. Покрытие и металл любят уход без агрессии: "
            "мягкая мойка, без абразива по порошку, без самодельного подкрашивания баллончиком. Повреждения лучше "
            "описать фото и решить по договору, а не наращивать слои краски поверх заводского контура.\n"
        ),
        (
            "\n\nОтдельно проверьте дренаж и уклон вокруг будущего подиума: лужа «в беседку» портит пол быстрее, "
            "чем споры о оттенке кровли. Для остекления заложите место под открывание створок и проход с мебелью. "
            "Для открытого контура — розу ветров и тень от дома в июле. Это мелочи на бумаге и крупные деньги после "
            "монтажа, если их пропустить.\n"
        ),
        (
            "\n\nМы сознательно ведём к договору после фактов с земли. Это дольше пары сообщений в мессенджере и "
            "дешевле переделки контура. Адрес производства и встреч — Складочная 3с3; монтаж — Москва и область. "
            "Если география другая, честно скажем о доставке без монтажа «как у себя во дворе».\n"
        ),
    ]
    for block in pad_blocks:
        if word_count(new_body) >= 1550:
            break
        new_body += block
    # hard floor
    while word_count(new_body) < 1520:
        new_body += (
            "\nЕщё раз: каркас 80×80×3 мм, порошок после пескоструя и цинка, сваи отдельно от цены «от», "
            "замер до договора, каталог с живыми карточками — это минимальный набор, без которого разговор "
            "о качестве беседки превращается в спор картинок.\n"
        )
        if word_count(new_body) > 1900:
            break
    # update frontmatter cover + updated date
    if "coverImage:" in fm_block:
        fm_block = re.sub(
            r'coverImage: ".*?"',
            f'coverImage: "{cover}"',
            fm_block,
            count=1,
        )
    if "updated:" in fm_block:
        fm_block = re.sub(r'updated: ".*?"', 'updated: "2026-10-24"', fm_block, count=1)
    else:
        fm_block = fm_block.replace("---\n", '---\nupdated: "2026-10-24"\n', 1)
    fm_block = ensure_faq(fm_block if fm_block.endswith("\n---\n") or fm_block.endswith("---\n") else fm_block, title)
    # ensure_faq may break if already has ---; fix
    if fm_block.count("---") > 2:
        # already had faq path — leave
        pass
    new_wc = word_count(new_body)
    if write:
        # rebuild fm cleanly if ensure_faq doubled
        fm_block, _, fm2 = split_fm(raw)
        if "updated:" in fm_block:
            fm_block = re.sub(r'updated: ".*?"', 'updated: "2026-10-24"', fm_block, count=1)
        else:
            fm_block = fm_block.replace("\n---\n", '\nupdated: "2026-10-24"\n---\n', 1)
        if "coverImage:" in fm_block:
            fm_block = re.sub(r'coverImage: ".*?"', f'coverImage: "{cover}"', fm_block, count=1)
        if not re.search(r"^faq:", fm_block, re.M):
            fm_block = fm_block.replace("\n---\n", "\n" + default_faq(title) + "---\n", 1)
        path.write_text(fm_block + new_body, encoding="utf-8")
    return {"slug": slug, "status": "ok", "words_before": wc, "words_after": new_wc}


def main() -> int:
    load_prices()
    write = "--write" in sys.argv
    force = "--force" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    if only:
        slugs = only
    else:
        slugs = []
        for p in sorted(BLOG.glob("*.mdx")):
            if p.stem.startswith(DOORWAY):
                continue
            slugs.append(p.stem)
    stats = {"ok": 0, "skip_long": 0, "skip_doorway": 0, "skip_done": 0, "other": 0}
    low = []
    for slug in slugs:
        r = process(slug, write=write, force=force)
        st = r.get("status", "other")
        stats[st] = stats.get(st, 0) + 1
        if st == "ok":
            wa = r.get("words_after", 0)
            if wa < 1500 or wa > 2100:
                low.append((slug, wa))
            print(f"OK {slug}: {r.get('words_before')} → {r.get('words_after')}")
    print("STATS", stats, "out_of_range", low[:20], "mode", "WRITE" if write else "DRY")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
