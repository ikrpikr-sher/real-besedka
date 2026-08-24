from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from analytics.analyzer import analyze
from analytics.check_report import render_check_report
from analytics.reports import render_report
from analytics.traffic_light import compute_traffic_light, render_traffic_light_block
from config import SITE_URL
from database.models import last_snapshot, save_snapshot
from optimizer.actions import READ_ONLY
from optimizer.backlog import render_backlog
from optimizer.recommendations import build_findings, build_proposals
from sources.content_audit import audit_content
from sources.catalog import parse_catalog
from sources.envload import load_env, upsert_env
from sources.gsc import inspect_url, gsc_config, pull_report, _access_token
from sources.keyso import verify_token
from sources.live import fetch_live
from sources.local import scan_repo
from sources.pagespeed import fetch_weekly_pagespeed
from sources.site_check import run_site_check
from database.yadro_store import list_runs, save_run
from sources.yadro import (
    cluster_summary,
    collect_live,
    default_cluster_path,
    default_out_path,
    import_csv,
    pick_source,
    render_effectiveness,
    render_status,
    to_core_rows,
    write_cluster_csv,
    write_core_csv,
)


def collect(live: bool, *, with_check: bool = False, with_pagespeed: bool = False) -> dict:
    local = scan_repo()
    catalog = parse_catalog()
    content = audit_content()
    live_data = None
    site_check = None
    pagespeed = None
    if live or with_check:
        site_check = run_site_check()
    if live:
        extra = [p["path"] for p in catalog[:5]]
        extra += ["/katalog", "/katalog/poisk", "/blog", "/kontakty"]
        live_data = fetch_live(SITE_URL, extra_paths=extra)
    if with_pagespeed:
        pagespeed = fetch_weekly_pagespeed()
    audit_findings = analyze(local, live_data, catalog, content)
    traffic_light = compute_traffic_light(site_check, live_data, content)
    snapshot = {
        "site_id": "real-besedki",
        "site_url": SITE_URL,
        "report_date": date.today().isoformat(),
        "read_only": READ_ONLY,
        "local": local,
        "live": live_data,
        "catalog": catalog,
        "content": content,
        "site_check": site_check,
        "pagespeed": pagespeed,
        "traffic_light": traffic_light,
        "audit_findings": audit_findings,
    }
    snapshot["findings"] = build_findings(snapshot)
    snapshot["proposals"] = build_proposals(snapshot)
    snapshot["expected_effect"] = (
        "Главный риск — массовые правки title/H1 и деплой без сверки с продом. "
        "katalog.json на сервере не перезаписывать rsync-ом. "
        "После разрешения на этап 2 — OG-теги, title/description товаров, meta блога."
    )
    return snapshot


def run_check(with_pagespeed: bool) -> int:
    print("РЕЖИМ: ТОЛЬКО ЧТЕНИЕ. Проверка сайта на проде.")
    site_check = run_site_check()
    content = audit_content()
    live_data = fetch_live(SITE_URL, extra_paths=["/katalog/poisk"])
    pagespeed = fetch_weekly_pagespeed() if with_pagespeed else None
    traffic_light = compute_traffic_light(site_check, live_data, content)
    text = render_check_report(site_check, traffic_light, pagespeed)
    logs = ROOT / "logs"
    logs.mkdir(exist_ok=True)
    stamp = date.today().isoformat()
    path = logs / f"{stamp}_check.md"
    path.write_text(text, encoding="utf-8")
    print(text)
    print(f"Файл: {path}")
    return 0


def run_pagespeed() -> int:
    print("РЕЖИМ: ТОЛЬКО ЧТЕНИЕ. PageSpeed Insights (mobile).")
    data = fetch_weekly_pagespeed()
    logs = ROOT / "logs"
    logs.mkdir(exist_ok=True)
    stamp = date.today().isoformat()
    path = logs / f"{stamp}_pagespeed.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    for key, row in data.items():
        if not isinstance(row, dict) or key == "note":
            continue
        score = row.get("performance_score")
        if score is not None:
            print(f"{row.get('url')}: {score}/100 (LCP {row.get('lcp_ms')} ms)")
        else:
            print(f"{row.get('url')}: {row.get('error') or 'н/д'}")
    if data.get("note"):
        print(data["note"])
    print(f"JSON: {path}")
    return 0


def run_backlog(no_live: bool) -> int:
    print("РЕЖИМ: ТОЛЬКО ЧТЕНИЕ. Backlog — план работ, без правок на сайте.")
    snapshot = collect(live=not no_live, with_check=not no_live)
    text = render_backlog(snapshot)
    logs = ROOT / "logs"
    logs.mkdir(exist_ok=True)
    stamp = snapshot["report_date"]
    path = logs / f"{stamp}_backlog.md"
    path.write_text(text, encoding="utf-8")
    print(text)
    print(f"Файл: {path}")
    return 0


def run_report(no_live: bool, with_pagespeed: bool) -> int:
    print("РЕЖИМ: ТОЛЬКО ЧТЕНИЕ. Код сайта и прод не изменяются.")
    previous = last_snapshot("real-besedki")
    is_monday = date.today().weekday() == 0
    snapshot = collect(
        live=not no_live,
        with_check=not no_live,
        with_pagespeed=with_pagespeed or is_monday,
    )
    text = render_report(snapshot, previous)
    save_snapshot("real-besedki", snapshot)

    logs = ROOT / "logs"
    logs.mkdir(exist_ok=True)
    stamp = snapshot["report_date"]
    (logs / f"{stamp}_seo.md").write_text(text, encoding="utf-8")
    slim = {k: snapshot[k] for k in snapshot if k != "live"}
    slim["live"] = None
    if snapshot.get("live"):
        live = dict(snapshot["live"])
        pages = []
        for page in live.get("pages") or []:
            row = dict(page)
            row.pop("body", None)
            row.pop("headers", None)
            pages.append(row)
        live["pages"] = pages
        robots = dict(live.get("robots") or {})
        robots.pop("body_preview", None)
        live["robots"] = robots
        slim["live"] = live
    (logs / f"{stamp}_seo.json").write_text(
        json.dumps(slim, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    print(text)
    return 0


def run_yadro(args: argparse.Namespace) -> int:
    action = args.action or "status"
    if action == "status":
        print(render_status())
        return 0

    if action == "key":
        return run_yadro_key(args)

    if action == "history":
        runs = list_runs(15)
        if not runs:
            print("Сборов ещё не было. Это локальный сервис ядра, не Keys.so.")
            return 0
        print("История сборов ядра (локально, не Keys.so)")
        for run in runs:
            print(
                f"  #{run['id']} {run['created_at'][:19]} {run['source']}: "
                f"{run['core_rows']} фраз (сырых {run['raw_rows']})"
            )
        return 0

    if action == "import":
        if not args.file:
            print("Нужен файл: python main.py yadro import --file выгрузка.csv")
            return 2
        path = Path(args.file).expanduser()
        if not path.exists():
            print(f"Файл не найден: {path}")
            return 2
        raw = import_csv(path)
        rows = to_core_rows(raw)
        out = Path(args.out).expanduser() if args.out else default_out_path()
        clusters = cluster_summary(rows)
        write_core_csv(rows, out)
        cluster_out = default_cluster_path()
        write_cluster_csv(clusters, cluster_out)
        print(render_effectiveness(rows, clusters))
        print(f"Файл ядра: {out}")
        print(f"Файл кластеров: {cluster_out}")
        run_id = save_run(
            source="import",
            seeds=0,
            raw_rows=len(raw),
            core_rows=rows,
            note=str(path),
        )
        print(f"Сохранено в сервис ядра, прогон #{run_id}")
        _write_yadro_log(
            {
                "action": "import",
                "in": str(path),
                "rows": len(rows),
                "out": str(out),
                "clusters": str(cluster_out),
                "run_id": run_id,
            }
        )
        return 0

    if action != "collect":
        print(f"Неизвестное действие: {action}")
        return 2

    if not args.run:
        print(render_status())
        print("")
        print("Сбор не запущен: нет --run. Платный API Keys.so / Wordstat без этого флага не дергаем.")
        return 0

    env = load_env()
    try:
        source = pick_source(env, args.source)
    except RuntimeError as exc:
        print(str(exc))
        return 2
    print(f"Источник: {source}. Сайт не меняется. Идёт сбор ядра…")
    try:
        raw, meta = collect_live(
            source=source,
            env=env,
            depth=args.depth,
            num_phrases=args.num_phrases,
            enrich_freq=args.enrich,
        )
    except Exception as exc:
        print(f"Сбор не удался: {exc}")
        return 1
    rows = to_core_rows(raw)
    out = Path(args.out).expanduser() if args.out else default_out_path()
    clusters = cluster_summary(rows)
    write_core_csv(rows, out)
    cluster_out = default_cluster_path()
    write_cluster_csv(clusters, cluster_out)
    print(render_effectiveness(rows, clusters))
    print(f"Сырых фраз: {meta.get('raw_rows', len(raw))}")
    print(f"Файл ядра: {out}")
    print(f"Файл кластеров: {cluster_out}")
    run_id = save_run(
        source=str(meta.get("source") or source),
        seeds=int(meta.get("seeds") or 0),
        raw_rows=int(meta.get("raw_rows") or len(raw)),
        core_rows=rows,
    )
    print(f"Сохранено в сервис ядра, прогон #{run_id}")
    _write_yadro_log(
        {
            "action": "collect",
            "meta": meta,
            "rows": len(rows),
            "out": str(out),
            "clusters": str(cluster_out),
            "run_id": run_id,
        }
    )
    return 0


def run_yadro_key(args: argparse.Namespace) -> int:
    token = (args.token or "").strip()
    if args.token_file:
        path = Path(args.token_file).expanduser()
        if not path.exists():
            print(f"Файл не найден: {path}")
            return 2
        token = path.read_text(encoding="utf-8").strip()
    if not token:
        print(
            "\n".join(
                [
                    "Ключ Keys.so я выпустить не могу — его даёт только кабинет Keys.so.",
                    "",
                    "1. Войдите: https://www.keys.so/ru/",
                    "2. Панель управления → блок REST API",
                    "3. «Активировать REST API» или «Сформировать новый токен»",
                    "   API есть только на тарифах Профессиональный и Корпоративный.",
                    "4. Сохраните токен в .env, не в чат:",
                    "   python main.py yadro key --token-file ~/Downloads/keyso.token",
                    "   или вручную: KEYSO_TOKEN=... в real-besedki-seo-agent/.env",
                    "5. Сбор: python main.py yadro collect --source keyso --run",
                    "",
                    "Нет Pro-тарифа — выгрузите CSV из Keys.so и:",
                    "   python main.py yadro import --file выгрузка.csv",
                ]
            )
        )
        return 2
    ok, message = verify_token(token)
    if not ok:
        print(f"Токен не сохранён. {message}")
        return 1
    dest = upsert_env("KEYSO_TOKEN", token)
    dest.chmod(0o600)
    print(message)
    print(f"Записан в {dest} (права 600, в git не попадает).")
    print("Дальше: python main.py yadro collect --source keyso --run")
    return 0


def _write_yadro_log(payload: dict) -> None:
    logs = ROOT / "logs"
    logs.mkdir(exist_ok=True)
    stamp = date.today().isoformat()
    path = logs / f"{stamp}_yadro.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")


def run_gsc(url: str | None) -> int:
    cfg = gsc_config()
    print("РЕЖИМ: ТОЛЬКО ЧТЕНИЕ GSC. Кабинет Google не меняется.")
    token, err = _access_token(cfg["credentials"])
    if err or not token:
        print(err or "Нет токена")
        print("Ключ: JSON сервисного аккаунта → ~/secrets/real-besedki-gsc.json")
        print("В GSC: Пользователи → email из JSON, право «Ограниченный».")
        print("Сайт в API: sc-domain:real-besedki.ru")
        return 1
    if url:
        status, payload = inspect_url(token, cfg["site"], url)
        print(json.dumps({"http": status, "url": url, "site": cfg["site"], "data": payload}, ensure_ascii=False, indent=2, default=str))
        return 0 if status == 200 else 1
    report = pull_report()
    logs = ROOT / "logs"
    logs.mkdir(exist_ok=True)
    out = logs / f"{date.today().isoformat()}_gsc.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    if not report.get("ok"):
        print(report.get("error") or "GSC не ответил")
        print(f"Черновик: {out}")
        return 1
    print(f"Сайт: {report['site']}")
    maps = (report.get("sitemaps") or {}).get("sitemap") or []
    print(f"Карт в GSC: {len(maps)}")
    for item in maps:
        print(f"  {item.get('path')}  ошибок={item.get('errors')}  предупреждений={item.get('warnings')}")
    print("Запросы (до 10):")
    for row in (report.get("queries") or [])[:10]:
        print(f"  {row['clicks']:.0f} кл / {row['impressions']:.0f} пок  {row['key']}")
    print(f"Полный JSON: {out}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="SEO-агент real-besedki.ru")
    parser.add_argument(
        "command",
        choices=["report", "check", "backlog", "pagespeed", "yadro", "gsc"],
        help="report/check — аудит сайта; backlog — P1/P2; pagespeed — PSI; yadro; gsc",
    )
    parser.add_argument(
        "action",
        nargs="?",
        default=None,
        help="для yadro: status | key | collect | import | history",
    )
    parser.add_argument("--no-live", action="store_true", help="только репозиторий, без запросов к продy")
    parser.add_argument("--pagespeed", action="store_true", help="добавить PageSpeed (report: также по понедельникам)")
    parser.add_argument("--source", choices=["auto", "wordstat", "keyso"], default="auto")
    parser.add_argument("--file", help="CSV выгрузка Keys.so / Wordstat для import")
    parser.add_argument("--out", help="куда писать CSV ядра")
    parser.add_argument("--run", action="store_true", help="реально вызвать платный API")
    parser.add_argument("--enrich", action="store_true", help="Keys.so: доп. keywords_by_list после расширения")
    parser.add_argument("--depth", type=int, default=1, help="глубина Wordstat (1–2)")
    parser.add_argument("--num-phrases", type=int, default=50, help="похожих фраз на сид в Wordstat")
    parser.add_argument("--token", help="Keys.so токен (лучше --token-file, не светить в истории шелла)")
    parser.add_argument("--token-file", help="файл с Keys.so токеном, одна строка")
    parser.add_argument("--url", help="для gsc: проверить один URL")
    args = parser.parse_args()

    if args.command == "report":
        return run_report(args.no_live, args.pagespeed)
    if args.command == "check":
        return run_check(args.pagespeed)
    if args.command == "backlog":
        return run_backlog(args.no_live)
    if args.command == "pagespeed":
        return run_pagespeed()
    if args.command == "gsc":
        return run_gsc(args.url)
    return run_yadro(args)


if __name__ == "__main__":
    raise SystemExit(main())
