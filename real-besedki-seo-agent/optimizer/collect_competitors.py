"""Keys.so: конкуренты по P0 + большое ядро. Только чтение кабинета Keys.so."""

from __future__ import annotations

import json
import sys
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from sources.envload import load_env
from sources.keyso import (
    KeysoError,
    concurents_by_keywords,
    domain_dashboard,
    expand_keywords,
    keyword_dashboard,
    normalize_row,
    organic_keywords,
    organic_sitepages,
)
from sources.yadro import cluster_summary, to_core_rows, write_cluster_csv, write_core_csv

REPORTS = ROOT / "reports"
SNAP = REPORTS / "_keyso_probe"
TODAY = date.today().isoformat()

P0 = [
    "металлическая беседка",
    "беседка из металла",
    "беседка с остеклением",
    "беседка под ключ",
    "беседка лофт",
    "закрытая беседка",
    "беседка 3х3 металлическая",
    "беседка 3х4 металлическая",
    "беседка с мангалом",
]

SIZE_SEEDS = [
    "беседка 3х3 металлическая",
    "беседка 3х4 металлическая",
    "беседка 4х3 металлическая",
    "беседка 4х4 металлическая",
    "беседка 5х4 металлическая",
    "беседка 6х3 металлическая",
    "беседка 3х3",
    "беседка 3х4",
    "беседка лофт",
    "закрытая беседка",
    "остекление беседки",
    "беседка с остеклением",
]

DOMAINS = [
    # металл / ковка / мангал-металл
    ("dachabel.ru", "металл"),
    ("ur-met.ru", "металл"),
    ("metal-mangal.ru", "металл+мангал"),
    ("mangalplus.ru", "металл+мангал"),
    ("metall-kovka24.ru", "ковка"),
    ("rammetall.ru", "металл"),
    ("besedkiloft.ru", "лофт"),
    ("besedki-amarant.ru", "дизайн-металл"),
    ("amarant.ru", "дизайн-металл"),
    ("besedka-metallicheskaya.ru", "металл"),
    ("createmet.ru", "металл"),
    ("safamaster.ru", "металл"),
    ("artli-kovka.ru", "ковка"),
    ("spectorgstroy.ru", "металл"),
    ("nva-house.ru", "металл"),
    ("mos-mangal.ru", "металл+мангал"),
    ("dekorkovka.ru", "ковка"),
    # остекление / навес
    ("msknaves.ru", "навес/остекление"),
    ("corpsun.ru", "остекление"),
    ("greenbesedka.ru", "закрытые"),
    ("oasis-stroy.ru", "остекление"),
    ("rusbesedka.ru", "смешанный"),
    ("barbeku.pro", "мангал/закрытые"),
    # дерево — лидеры «под ключ»
    ("master-besedok.ru", "дерево"),
    ("pkgreenwood.ru", "дерево"),
    ("h-wd.ru", "дерево"),
    ("timberlock.ru", "дерево"),
    ("kingwoods.ru", "дерево"),
    ("vse-besedki.ru", "дерево"),
    ("vasha-besedka.ru", "дерево"),
    ("nadvorike.ru", "дерево"),
    ("arh-besedki.ru", "дерево"),
    # прошлый рынок, проверить
    ("vipzavod.ru", "проверка"),
    ("rusrolls.ru", "проверка"),
    ("stalpro.ru", "проверка"),
    ("real-besedki.ru", "мы"),
]

SKIP_MARKET = {
    "m.avito.ru",
    "avito.ru",
    "aliexpress.ru",
    "livemaster.ru",
    "sima-land.ru",
    "satom.ru",
    "moscow.promportal.su",
    "wildberries.ru",
    "uslugi.yandex.ru",
    "ru.pinterest.com",
    "dzen.ru",
    "msk.blizko.ru",
    "market.yandex.ru",
    "vseinstrumenti.ru",
}


def _sleep() -> None:
    time.sleep(1.2)


def _dump(name: str, data) -> None:
    SNAP.mkdir(parents=True, exist_ok=True)
    (SNAP / f"{name}.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2)[:4_000_000],
        encoding="utf-8",
    )


def collect_serp(token: str) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for phrase in P0:
        path = SNAP / f"kd_{phrase.replace(' ', '_')}.json"
        if path.exists() and phrase in {
            "металлическая беседка",
            "беседка из металла",
            "беседка с остеклением",
            "беседка под ключ",
        }:
            kd = json.loads(path.read_text(encoding="utf-8"))
        else:
            try:
                kd = keyword_dashboard(token, phrase) or {}
                _dump(f"kd_{phrase.replace(' ', '_')}", kd)
            except KeysoError as exc:
                print("kd fail", phrase, exc)
                kd = {}
            _sleep()
        out[phrase] = kd
        print(
            f"SERP {phrase}: wsk={kd.get('wsk')} top={len(kd.get('top') or [])} ads={kd.get('adscnt')}"
        )
    return out


def collect_domains(token: str) -> list[dict]:
    rows = []
    for domain, segment in DOMAINS:
        rec = {"domain": domain, "segment": segment}
        try:
            dash = domain_dashboard(token, domain)
        except KeysoError as exc:
            print("dash fail", domain, exc)
            dash = None
        _sleep()
        if not dash:
            rec.update({"ok": False, "vis": 0, "it10": 0, "keys_cnt": 0})
            rows.append(rec)
            print("NO DASH", domain)
            continue
        rec.update(
            {
                "ok": True,
                "vis": dash.get("vis") or 0,
                "it1": dash.get("it1") or 0,
                "it3": dash.get("it3") or 0,
                "it5": dash.get("it5") or 0,
                "it10": dash.get("it10") or 0,
                "it50": dash.get("it50") or 0,
                "pagesinindex": dash.get("pagesinindex") or 0,
                "dr": dash.get("dr") or 0,
                "adscnt": dash.get("adscnt") or 0,
            }
        )
        pages = 2 if segment in {"металл", "металл+мангал", "лофт", "дизайн-металл", "остекление", "мы"} else 1
        try:
            kws = organic_keywords(token, domain, pages=pages)
        except KeysoError as exc:
            print("kw fail", domain, exc)
            kws = []
        _sleep()
        try:
            site = organic_sitepages(token, domain)
        except KeysoError as exc:
            print("pages fail", domain, exc)
            site = []
        _sleep()
        rec["keywords"] = kws
        rec["sitepages"] = site
        rec["keys_cnt"] = len(kws)
        rec["top_words"] = [x.get("word") for x in kws[:8] if x.get("word")]
        rec["top_urls"] = [x.get("url") or x.get("new_url") for x in site[:6]]
        _dump(f"dom_{domain.replace('.', '_')}", rec)
        print(
            f"OK {domain:32} vis={rec['vis']:>7} it10={rec['it10']:>5} kws={len(kws):>4} {segment}"
        )
        rows.append(rec)
    return rows


def collect_cbk(token: str) -> list[dict]:
    existing = SNAP / "concurents_by_kw.json"
    if existing.exists():
        data = json.loads(existing.read_text(encoding="utf-8"))
        rows = list(data.get("data") or [])
        if data.get("last_page", 1) > 1:
            try:
                extra = concurents_by_keywords(P0[:4], token)
                rows = extra
                _dump("concurents_by_kw_full", {"data": extra})
            except KeysoError as exc:
                print("cbk extra", exc)
        return rows
    try:
        rows = concurents_by_keywords(P0[:4], token)
        _dump("concurents_by_kw_full", {"data": rows})
        return rows
    except KeysoError as exc:
        print("cbk", exc)
        return []


def merge_core(token: str, domain_rows: list[dict]) -> tuple[list[dict], list[dict]]:
    raw: list[dict] = []
    seen: set[str] = set()

    old_csv = REPORTS / "2026-08-15_yadro-effektivnost.csv"
    if old_csv.exists():
        from sources.yadro import import_csv

        for item in import_csv(old_csv):
            q = (item.get("query") or "").casefold()
            if q and q not in seen:
                seen.add(q)
                raw.append(item)

    print("size expand…")
    try:
        ext = expand_keywords(SIZE_SEEDS, token, base="msk", similarity=40)
        for item in ext:
            norm = normalize_row(item, source="keyso-size")
            if not norm:
                continue
            q = norm["query"].casefold()
            if q in seen:
                continue
            seen.add(q)
            raw.append(norm)
        print("size phrases", len(ext))
    except KeysoError as exc:
        print("size expand fail", exc)

    for rec in domain_rows:
        if rec.get("segment") in {"дерево", "проверка"}:
            continue
        for item in rec.get("keywords") or []:
            norm = normalize_row(item, seed=rec["domain"], source="keyso-competitor")
            if not norm:
                continue
            q = norm["query"].casefold()
            if q in seen:
                continue
            seen.add(q)
            raw.append(norm)

    core = to_core_rows(raw)
    clusters = cluster_summary(core)
    write_core_csv(core, REPORTS / f"{TODAY}_yadro-bolshoe.csv")
    write_cluster_csv(clusters, REPORTS / f"{TODAY}_yadro-bolshoe-klastery.csv")
    return core, clusters


def slim_domains(rows: list[dict]) -> list[dict]:
    out = []
    for rec in rows:
        out.append({k: rec[k] for k in rec if k not in {"keywords", "sitepages"}})
    return out


def main() -> int:
    token = load_env()["KEYSO_TOKEN"]
    print("=== SERP P0 ===")
    serps = collect_serp(token)
    print("=== CBK ===")
    cbk = collect_cbk(token)
    print("cbk", len(cbk))
    print("=== DOMAINS ===")
    domains = collect_domains(token)
    print("=== CORE ===")
    core, clusters = merge_core(token, domains)
    plant = sum(1 for r in core if r["вердикт"] == "сажать")
    summary = {
        "date": TODAY,
        "source": "Keys.so API msk",
        "own": {
            "domain": "real-besedki.ru",
            "note": "в индексе видимости почти нет",
        },
        "serp_phrases": {
            k: {
                "ws": v.get("ws"),
                "wsk": v.get("wsk"),
                "adscnt": v.get("adscnt"),
                "cpc": v.get("cpc"),
                "top": [
                    {
                        "pos": t.get("pos"),
                        "domain": t.get("domain"),
                        "url": t.get("url"),
                        "vis": t.get("vis"),
                    }
                    for t in (v.get("top") or [])[:15]
                ],
            }
            for k, v in serps.items()
        },
        "concurents": cbk,
        "domains": slim_domains(domains),
        "core": {
            "phrases": len(core),
            "plant": plant,
            "clusters": clusters[:20],
        },
    }
    _dump("competitor_summary", summary)
    (REPORTS / f"{TODAY}_konkurenty.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"CORE {len(core)} plant {plant}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
