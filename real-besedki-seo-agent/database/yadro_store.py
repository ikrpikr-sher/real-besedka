from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "yadro.db"


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            source TEXT NOT NULL,
            seeds INTEGER,
            raw_rows INTEGER,
            core_rows INTEGER,
            note TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS phrases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id INTEGER NOT NULL,
            query TEXT NOT NULL,
            ws INTEGER,
            wsk INTEGER,
            cluster TEXT,
            verdict TEXT,
            score INTEGER,
            landing TEXT,
            source TEXT,
            UNIQUE(run_id, query)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS wordstat_cache (
            phrase TEXT NOT NULL,
            region TEXT NOT NULL,
            fetched_at TEXT NOT NULL,
            payload TEXT NOT NULL,
            PRIMARY KEY (phrase, region)
        )
        """
    )
    conn.commit()
    return conn


def save_run(
    *,
    source: str,
    seeds: int,
    raw_rows: int,
    core_rows: list[dict[str, str]],
    note: str = "",
) -> int:
    conn = connect()
    cur = conn.execute(
        "INSERT INTO runs (created_at, source, seeds, raw_rows, core_rows, note) VALUES (?, ?, ?, ?, ?, ?)",
        (
            datetime.now(timezone.utc).isoformat(),
            source,
            seeds,
            raw_rows,
            len(core_rows),
            note,
        ),
    )
    run_id = int(cur.lastrowid)
    for row in core_rows:
        conn.execute(
            """
            INSERT OR REPLACE INTO phrases
            (run_id, query, ws, wsk, cluster, verdict, score, landing, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                run_id,
                row.get("запрос") or "",
                _int(row.get("частота_ws")),
                _int(row.get("частота_wsk")),
                row.get("кластер") or "",
                row.get("вердикт") or "",
                _int(row.get("эффективность")),
                row.get("посадочная") or "",
                row.get("источник") or source,
            ),
        )
    conn.commit()
    conn.close()
    return run_id


def list_runs(limit: int = 10) -> list[dict[str, Any]]:
    conn = connect()
    rows = conn.execute(
        "SELECT id, created_at, source, seeds, raw_rows, core_rows, note FROM runs ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return [
        {
            "id": r[0],
            "created_at": r[1],
            "source": r[2],
            "seeds": r[3],
            "raw_rows": r[4],
            "core_rows": r[5],
            "note": r[6],
        }
        for r in rows
    ]


def cache_get(phrase: str, region: str) -> dict[str, Any] | None:
    conn = connect()
    row = conn.execute(
        "SELECT payload FROM wordstat_cache WHERE phrase = ? AND region = ?",
        (phrase, region),
    ).fetchone()
    conn.close()
    if not row:
        return None
    return json.loads(row[0])


def cache_put(phrase: str, region: str, payload: dict[str, Any]) -> None:
    conn = connect()
    conn.execute(
        """
        INSERT OR REPLACE INTO wordstat_cache (phrase, region, fetched_at, payload)
        VALUES (?, ?, ?, ?)
        """,
        (
            phrase,
            region,
            datetime.now(timezone.utc).isoformat(),
            json.dumps(payload, ensure_ascii=False),
        ),
    )
    conn.commit()
    conn.close()


def _int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(float(str(value).replace(" ", "").replace("\xa0", "")))
    except ValueError:
        return None
