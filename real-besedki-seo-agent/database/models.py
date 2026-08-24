from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "snapshots.db"


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            payload TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS change_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            object TEXT NOT NULL,
            old_value TEXT,
            new_value TEXT,
            reason TEXT,
            expected TEXT
        )
        """
    )
    conn.commit()
    return conn


def save_snapshot(site_id: str, payload: dict[str, Any]) -> None:
    conn = connect()
    conn.execute(
        "INSERT INTO snapshots (site_id, created_at, payload) VALUES (?, ?, ?)",
        (
            site_id,
            datetime.now(timezone.utc).isoformat(),
            json.dumps(payload, ensure_ascii=False, default=str),
        ),
    )
    conn.commit()
    conn.close()


def last_snapshot(site_id: str) -> dict[str, Any] | None:
    conn = connect()
    row = conn.execute(
        "SELECT payload FROM snapshots WHERE site_id = ? ORDER BY id DESC LIMIT 1",
        (site_id,),
    ).fetchone()
    conn.close()
    if not row:
        return None
    return json.loads(row[0])
