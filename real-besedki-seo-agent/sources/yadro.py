from __future__ import annotations

import csv
import json
import re
from datetime import date
from pathlib import Path
from typing import Any

from config import ROOT, SITE_URL
from sources.envload import load_env, masked
from sources.keyso import KeysoError, expand_keywords, keywords_by_list, normalize_row
from sources.wordstat import expand_phrases

SEEDS_PATH = ROOT / "data" / "yadro_seeds.json"
REPORTS = ROOT / "reports"

SIZE_RE = re.compile(r"(?<!\d)(\d)\s*[xх×]\s*(\d)(?!\d)", re.I)
SIZE_NA_RE = re.compile(r"(?<!\d)(\d)\s*на\s*(\d)(?!\d)", re.I)
BESED_RE = re.compile(r"беседк", re.I)
KNOWN_SIZES = {
    (2, 2),
    (3, 3),
    (3, 4),
    (4, 3),
    (4, 4),
    (4, 6),
    (5, 4),
    (5, 5),
    (6, 3),
    (6, 4),
    (6, 5),
    (6, 6),
    (8, 4),
    (8, 5),
}

MINUS_RE = re.compile(
    r"\b("
    r"аренда|б/?у|чертеж|чертёж|своими руками|поликарбонат|шат[её]р|тент|"
    r"брус|сруб|деревянн\w*|бесплатно скачать|детск\w+\s+площадк|"
    r"надувн|пластиков"
    r")\b",
    re.I,
)
MANGAL_RE = re.compile(r"\b(мангал|барбекю|грил|костров)", re.I)
GAP_RE = re.compile(
    r"\b(камин|отоплени|опт\w*|дилер|шестигранн)",
    re.I,
)
SOFT_RE = re.compile(
    r"мягк\w*\s+окн|окн\w*\s+мягк|мягк\w*\s+стекл|стекл\w*\s+мягк|жидк\w*\s+окн",
    re.I,
)
WOOD_RE = re.compile(r"\b(дерев\w*|брус|сруб|лиственниц|кедр|сосна)\b", re.I)
NOISE_RE = re.compile(r"^беседк[аеиуыойяюм]*$", re.I)
OFFER_RE = re.compile(
    r"металл|остекл|закрыт|лофт|лазер|кован|чпу|80\s*[xх×]\s*80|под\s+ключ",
    re.I,
)
GLAZE_RE = re.compile(r"остекл|закрыт\w*\s+бесед|зимн\w+\s+бесед|тёпл\w+\s+бесед", re.I)
OPEN_RE = re.compile(r"открыт\w*\s+бесед", re.I)
TURNKEY_RE = re.compile(r"под\s+ключ", re.I)
NAVES_RE = re.compile(r"\bнавес", re.I)
KACHELI_RE = re.compile(r"качел", re.I)
LASER_RE = re.compile(r"лазер", re.I)
FRAME_RE = re.compile(r"80\s*[xх×]\s*80", re.I)
BRAND_RE = re.compile(r"real[\s\-]?besed|пулман", re.I)
GEO_RE = re.compile(
    r"москв|московск|подмосков|[\s\-]мо\b|"
    r"подольск|химк|балаших|мытищ|королев|люберц|одинцов|"
    r"красногорск|домодедов|видное|зеленоград|щ[её]лково|сергиев|"
    r"раменск|долгопрудн|реутов|жуковск|пушкино|истра|звенигород|"
    r"наро-фоминск|чехов|серпухов|коломн|дмитров|солнечногорск|клин|"
    r"ленинский район|рубл[её]вк|новая рига|новорижск|калужское шоссе",
    re.I,
)

CSV_FIELDS = [
    "эффективность",
    "вердикт",
    "кластер",
    "интент",
    "запрос",
    "частота_ws",
    "частота_wsk",
    "посадочная",
    "действие",
    "приоритет",
    "источник",
    "сид",
    "заметка",
]

CLUSTER_FIELDS = [
    "кластер",
    "фраз",
    "сажать",
    "статья",
    "дыра",
    "минус",
    "ср_эффективность",
    "сумма_ws",
    "посадочная",
    "действие",
]


def load_seeds() -> dict[str, Any]:
    return json.loads(SEEDS_PATH.read_text(encoding="utf-8"))


def source_status(env: dict[str, str] | None = None) -> dict[str, str]:
    env = env if env is not None else load_env()
    return {
        "KEYSO_TOKEN": masked(env.get("KEYSO_TOKEN", "")),
        "YANDEX_WORDSTAT_API_KEY": masked(
            env.get("YANDEX_WORDSTAT_API_KEY") or env.get("YANDEX_SEARCH_API_KEY") or ""
        ),
        "YANDEX_FOLDER_ID": masked(
            env.get("YANDEX_FOLDER_ID") or env.get("YANDEX_WORDSTAT_FOLDER_ID") or ""
        ),
        "YANDEX_WORDSTAT_TOKEN": masked(env.get("YANDEX_WORDSTAT_TOKEN", "")),
    }


def pick_source(env: dict[str, str], requested: str) -> str:
    has_keyso = bool(env.get("KEYSO_TOKEN"))
    has_cloud = bool(
        (env.get("YANDEX_WORDSTAT_API_KEY") or env.get("YANDEX_SEARCH_API_KEY"))
        and (env.get("YANDEX_FOLDER_ID") or env.get("YANDEX_WORDSTAT_FOLDER_ID"))
    )
    has_v1 = bool(env.get("YANDEX_WORDSTAT_TOKEN"))
    if requested == "keyso":
        if not has_keyso:
            raise RuntimeError("Нет KEYSO_TOKEN в real-besedki-seo-agent/.env")
        return "keyso"
    if requested == "wordstat":
        if not (has_cloud or has_v1):
            raise RuntimeError(
                "Нет Wordstat. Добавьте YANDEX_WORDSTAT_API_KEY и YANDEX_FOLDER_ID "
                "или YANDEX_WORDSTAT_TOKEN."
            )
        return "wordstat"
    if has_keyso:
        return "keyso"
    if has_cloud or has_v1:
        return "wordstat"
    raise RuntimeError(
        "Нет источника частотности. Либо KEYSO_TOKEN (Keys.so API), "
        "либо Yandex Cloud Wordstat (Api-Key + folderId), либо CSV: "
        "python main.py yadro import --file выгрузка.csv"
    )


def classify(query: str) -> dict[str, str]:
    q = " ".join(query.lower().replace("ё", "е").split())
    if NOISE_RE.search(q):
        return _row("шум морфологии", "служебный", "—", "не сажать, это словоформа", "минус", "беседку/беседке без модификатора")
    if WOOD_RE.search(q) and "металл" not in q:
        return _row("минус", "не наш оффер", "—", "минус-слова, не сажать", "минус", "дерево без металла")
    if MINUS_RE.search(q):
        hard = bool(
            re.search(
                r"аренда|б/?у|чертеж|чертёж|поликарбонат|шат[её]р|тент|брус|своими руками",
                q,
            )
        )
        if hard or "металл" not in q:
            return _row("минус", "не наш оффер", "—", "минус-слова, не сажать", "минус", "не наш оффер")
    if MANGAL_RE.search(q):
        gazebo_bbq = bool(BESED_RE.search(q)) and bool(
            re.search(
                r"беседка с мангалом|беседки с мангалом|мангальная беседка|мангальные беседки|"
                r"беседка мангал|беседки мангал|беседка барбекю|беседки с барбекю",
                q,
            )
        )
        into_gazebo = bool(re.search(r"мангал(ы)? в беседк|мангал для беседк", q))
        if gazebo_bbq and not into_gazebo:
            return _row(
                "беседки с мангалом",
                "коммерческий",
                f"{SITE_URL}/katalog/besedki-s-mangalom",
                "каталог беседок с мангалом",
                "P0",
                "серия «Огонь»; не путать с отдельным мангалом",
            )
        return _row(
            "мангалы",
            "коммерческий",
            f"{SITE_URL}/katalog/mangaly",
            "каталог мангалов, не клон «беседка с мангалом»",
            "P0",
            "M-01…M-04; в беседку только с дымоходом",
        )
    if GAP_RE.search(q):
        return _row(
            "дыры лидера",
            "спрос рынка без оффера",
            "—",
            "не создавать URL без SKU",
            "P0-дыра",
            "нет SKU / не врать в сниппете",
        )
    if BRAND_RE.search(q):
        return _row("бренд", "навигационный", f"{SITE_URL}/", "дешёвый трафик", "P0", "")
    if SOFT_RE.search(q):
        return _row(
            "мягкие окна",
            "инфо→заявка",
            f"{SITE_URL}/blog/osteklenie-ili-myagkie-okna-dlya-besedki",
            "сравнение, не продаём мягкие окна",
            "P1",
            "CTA на остекление",
        )
    if KACHELI_RE.search(q):
        return _row("качели", "коммерческий", f"{SITE_URL}/katalog/kacheli", "каталог качелей", "P1", "")
    if NAVES_RE.search(q):
        return _row("навесы", "коммерческий", f"{SITE_URL}/katalog/navesy", "каталог навесов", "P1", "")
    size = SIZE_RE.search(q) or SIZE_NA_RE.search(q)
    if size and BESED_RE.search(q):
        a, b = int(size.group(1)), int(size.group(2))
        pair = (a, b) if (a, b) in KNOWN_SIZES else ((b, a) if (b, a) in KNOWN_SIZES else None)
        if pair:
            n, m = pair
            return _row(
                f"размер {n}х{m}",
                "коммерческий",
                f"{SITE_URL}/katalog/razmer/{n}x{m}",
                "хаб размера",
                "P0" if (n, m) in {(3, 3), (3, 4), (4, 3), (4, 4), (5, 4), (6, 3)} else "P1",
                "",
            )
    if GLAZE_RE.search(q) and not BESED_RE.search(q):
        return _row(
            "масс рынок",
            "чужой коридор",
            f"{SITE_URL}/katalog/besedki-s-ostekleniem",
            "остекление террас/веранд — не наша выдача",
            "P2",
            "оконные компании, не беседка",
        )
    if GLAZE_RE.search(q):
        return _row(
            "остекление",
            "коммерческий",
            f"{SITE_URL}/katalog/besedki-s-ostekleniem",
            "каталог остекления",
            "P0",
            "",
        )
    if OPEN_RE.search(q):
        return _row(
            "открытые",
            "коммерческий",
            f"{SITE_URL}/katalog/otkrytye-besedki",
            "каталог открытых",
            "P1",
            "",
        )
    if (TURNKEY_RE.search(q) or GEO_RE.search(q)) and BESED_RE.search(q):
        return _row(
            "под ключ" if TURNKEY_RE.search(q) else "гео ядро",
            "коммерческий",
            f"{SITE_URL}/uslugi/besedki-pod-klyuch",
            "услуга под ключ / гео",
            "P0",
            "",
        )
    if LASER_RE.search(q) or FRAME_RE.search(q):
        return _row("атрибуты", "коммерческий", f"{SITE_URL}/katalog", "каталог, отличие оффера", "P0", "")
    if not BESED_RE.search(q):
        return _row(
            "чужой металл",
            "чужой коридор",
            "—",
            "ворота/грядки/перила с чужих доменов, не сажать",
            "минус",
            "ключ конкурента без «беседк»",
        )
    if not OFFER_RE.search(q) and not GEO_RE.search(q):
        return _row(
            "масс рынок",
            "чужой коридор",
            f"{SITE_URL}/katalog",
            "не бить ценой дерево 130–220к",
            "P2",
            "общий спрос «беседка для дачи», SERP у дерева и маркетплейсов",
        )
    return _row("голова металл", "коммерческий", f"{SITE_URL}/katalog", "сажать на каталог/главную", "P0", "")


def collect_live(
    *,
    source: str,
    env: dict[str, str],
    depth: int = 1,
    num_phrases: int = 50,
    enrich_freq: bool = False,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    pack = load_seeds()
    seeds = [row["phrase"] for row in pack["seeds"]]
    region = str(pack.get("region_id") or "213")
    base = str(pack.get("keyso_base") or "msk")
    meta: dict[str, Any] = {"source": source, "seeds": len(seeds), "region": region}

    if source == "keyso":
        token = env["KEYSO_TOKEN"]
        raw = expand_keywords(seeds, token, base=base)
        rows = [normalize_row(item, source="keyso-extended") for item in raw]
        rows = [r for r in rows if r]
        if enrich_freq:
            phrases = [r["query"] for r in rows][:800]
            try:
                freq = keywords_by_list(phrases, token, base=base) if phrases else []
            except KeysoError:
                freq = []
            by_word = {}
            for item in freq:
                norm = normalize_row(item, source="keyso-ws")
                if norm:
                    by_word[norm["query"].casefold()] = norm
            for row in rows:
                extra = by_word.get(row["query"].casefold())
                if extra:
                    row["ws"] = extra.get("ws") if extra.get("ws") is not None else row.get("ws")
                    row["wsk"] = extra.get("wsk") if extra.get("wsk") is not None else row.get("wsk")
        meta["raw_rows"] = len(rows)
        return rows, meta

    api_key = env.get("YANDEX_WORDSTAT_API_KEY") or env.get("YANDEX_SEARCH_API_KEY") or ""
    folder = env.get("YANDEX_WORDSTAT_FOLDER_ID") or env.get("YANDEX_FOLDER_ID") or ""
    token = env.get("YANDEX_WORDSTAT_TOKEN") or ""
    rows = expand_phrases(
        seeds,
        api_key=api_key,
        folder_id=folder,
        oauth_token=token,
        region_id=region,
        num_phrases=num_phrases,
        depth=depth,
    )
    meta["raw_rows"] = len(rows)
    return rows, meta


def import_csv(path: Path) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8-sig")
    sample = text[:4096]
    dialect = csv.Sniffer().sniff(sample, delimiters=";,|\t")
    reader = csv.DictReader(text.splitlines(), dialect=dialect)
    rows = []
    for item in reader:
        mapped = { (k or "").strip().casefold(): (v or "").strip() for k, v in item.items() }
        query = _first(mapped, "запрос", "ключ", "фраза", "word", "keyword", "query", "ключч")
        if not query:
            continue
        ws = _to_int(_first(mapped, "частота_ws", "ws", "частотность", "частота", "ws ", '" "'))
        wsk = _to_int(_first(mapped, "частота_wsk", "wsk", "!ws", "[!ws]", "точная"))
        rows.append(
            {
                "query": query,
                "ws": ws,
                "wsk": wsk,
                "seed": _first(mapped, "сид", "seed", "initial_word") or "",
                "source": "import",
                "kind": "import",
            }
        )
    return rows


def to_core_rows(raw: list[dict[str, Any]]) -> list[dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    for item in raw:
        query = str(item.get("query") or "").strip()
        if not query:
            continue
        mapped = classify(query)
        mapped["запрос"] = query
        mapped["частота_ws"] = "" if item.get("ws") is None else str(item.get("ws"))
        mapped["частота_wsk"] = "" if item.get("wsk") is None else str(item.get("wsk"))
        mapped["источник"] = str(item.get("source") or "")
        mapped["сид"] = str(item.get("seed") or "")
        key = query.casefold()
        prev = out.get(key)
        if prev is None:
            out[key] = mapped
            continue
        if (_to_int(mapped["частота_ws"]) or 0) > (_to_int(prev["частота_ws"]) or 0):
            out[key] = mapped
    rows = []
    for mapped in out.values():
        score, verdict = score_effectiveness(mapped)
        mapped["эффективность"] = str(score)
        mapped["вердикт"] = verdict
        rows.append(mapped)
    rows.sort(
        key=lambda r: (
            -int(r["эффективность"]),
            -(_to_int(r["частота_ws"]) or -1),
            r["кластер"],
            r["запрос"],
        )
    )
    return rows


def score_effectiveness(row: dict[str, str]) -> tuple[int, str]:
    """Оценка под заявку, не под объём фраз. Частоту не выдумываем."""
    priority = row.get("приоритет") or ""
    intent = row.get("интент") or ""
    landing = row.get("посадочная") or ""
    cluster = row.get("кластер") or ""
    ws = _to_int(row.get("частота_ws"))

    if priority == "минус" or cluster == "минус":
        return 0, "минус"
    if "дыра" in priority or landing in ("—", "-", ""):
        return 8, "дыра"
    if intent == "чужой коридор":
        return 18, "чужой"
    if intent == "навигационный":
        score, verdict = 42, "бренд"
    elif intent.startswith("инфо"):
        score, verdict = 48, "статья"
    else:
        score, verdict = 72, "сажать"

    if priority.startswith("P0"):
        score += 14
    elif priority.startswith("P1"):
        score += 5

    if cluster == "остекление":
        score += 10
    elif cluster in {"атрибуты", "под ключ"}:
        score += 8
    elif cluster.startswith("размер") and priority.startswith("P0"):
        score += 8
    elif cluster == "голова металл":
        score += 4

    if ws is not None:
        if ws >= 1000:
            score += 10
        elif ws >= 200:
            score += 6
        elif ws >= 50:
            score += 3
        elif ws == 0:
            score -= 12
    return min(100, max(0, score)), verdict


def cluster_summary(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    buckets: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        buckets.setdefault(row["кластер"], []).append(row)
    out = []
    for cluster, items in buckets.items():
        plant = sum(1 for r in items if r["вердикт"] == "сажать")
        article = sum(1 for r in items if r["вердикт"] == "статья")
        gap = sum(1 for r in items if r["вердикт"] == "дыра")
        minus = sum(1 for r in items if r["вердикт"] == "минус")
        scores = [int(r["эффективность"]) for r in items]
        ws_sum = sum(_to_int(r["частота_ws"]) or 0 for r in items)
        landing = next((r["посадочная"] for r in items if r["посадочная"] not in ("", "—")), "—")
        action = items[0]["действие"]
        avg = round(sum(scores) / len(scores)) if scores else 0
        out.append(
            {
                "кластер": cluster,
                "фраз": str(len(items)),
                "сажать": str(plant),
                "статья": str(article),
                "дыра": str(gap),
                "минус": str(minus),
                "ср_эффективность": str(avg),
                "сумма_ws": str(ws_sum) if ws_sum else "",
                "посадочная": landing,
                "действие": action,
            }
        )
    out.sort(key=lambda r: (-int(r["ср_эффективность"]), -int(r["сажать"]), r["кластер"]))
    return out


def write_cluster_csv(rows: list[dict[str, str]], path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=CLUSTER_FIELDS, delimiter=";")
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in CLUSTER_FIELDS})
    return path


def render_effectiveness(rows: list[dict[str, str]], clusters: list[dict[str, str]]) -> str:
    plant = [r for r in rows if r["вердикт"] == "сажать"]
    gaps = [r for r in rows if r["вердикт"] == "дыра"]
    minus = [r for r in rows if r["вердикт"] == "минус"]
    has_ws = any(_to_int(r.get("частота_ws")) is not None for r in rows)
    lines = [
        "Ядро — эффективность под заявку",
        "",
        f"Фраз: {len(rows)}",
        f"Сажать на живой URL: {len(plant)}",
        f"Статья (инфо→заявка): {sum(1 for r in rows if r['вердикт'] == 'статья')}",
        f"Дыры без SKU (не создавать страницу): {len(gaps)}",
        f"Минус: {len(minus)}",
        "Частотность Wordstat: "
        + ("есть в файле" if has_ws else "нет — рейтинг по офферу и посадочной, не по спросу"),
        "",
        "Кластеры по эффективности:",
    ]
    for row in clusters[:12]:
        ws = f", ws={row['сумма_ws']}" if row["сумма_ws"] else ""
        lines.append(
            f"  {row['ср_эффективность']:>3}  {row['кластер']}: {row['фраз']} фраз, "
            f"сажать {row['сажать']}{ws}"
        )
    lines += [
        "",
        "Правило: не раздувать ядро ради фраз. Сажать только то, что ведёт на оффер.",
        "Мангал в беседку — /katalog/mangaly. Беседка с мангалом — /katalog/besedki-s-mangalom.",
    ]
    return "\n".join(lines)


def write_core_csv(rows: list[dict[str, str]], path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_FIELDS, delimiter=";")
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in CSV_FIELDS})
    return path


def default_out_path() -> Path:
    return REPORTS / f"{date.today().isoformat()}_yadro-effektivnost.csv"


def default_cluster_path() -> Path:
    return REPORTS / f"{date.today().isoformat()}_yadro-klastery.csv"


def render_status() -> str:
    env = load_env()
    flags = source_status(env)
    pack = load_seeds()
    lines = [
        "Сервис ядра real-besedki (не клон Keys.so)",
        "",
        f"Сидов: {len(pack['seeds'])} (голова, не модификаторы)",
        f"Регион Wordstat: {pack.get('region_name')} ({pack.get('region_id')})",
        f"База Keys.so: {pack.get('keyso_base')}",
        "",
        "Ключи (значения не печатаются):",
    ]
    for key, value in flags.items():
        lines.append(f"  {key}: {value}")
    lines += [
        "",
        "Как собрать:",
        "  1) Keys.so: токен из кабинета → KEYSO_TOKEN в .env",
        "     python main.py yadro collect --source keyso --run",
        "  2) Официальный Wordstat Cloud: Api-Key + folderId",
        "     python main.py yadro collect --source wordstat --run",
        "  3) Выгрузка из UI Keys.so / Wordstat:",
        "     python main.py yadro import --file путь.csv",
        "",
        "Без --run платные API не вызываются. Сайт не меняется.",
        "Не клонируем базу Keys.so и не парсим их UI.",
    ]
    return "\n".join(lines)


def _row(cluster: str, intent: str, url: str, action: str, priority: str, note: str) -> dict[str, str]:
    return {
        "кластер": cluster,
        "интент": intent,
        "посадочная": url,
        "действие": action,
        "приоритет": priority,
        "заметка": note,
    }


def _first(mapped: dict[str, str], *keys: str) -> str:
    for key in keys:
        if key in mapped and mapped[key]:
            return mapped[key]
        for mk, mv in mapped.items():
            if mk.replace(" ", "") == key.replace(" ", "") and mv:
                return mv
    return ""


def _to_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    text = str(value).replace(" ", "").replace("\xa0", "").replace(",", ".")
    try:
        return int(float(text))
    except ValueError:
        return None
