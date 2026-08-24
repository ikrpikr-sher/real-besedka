from __future__ import annotations

import re
import subprocess
from pathlib import Path
from typing import Any

VPS_HOST = "31.128.44.47"
SSH_USER = "root"
SSH_KEY = Path.home() / ".ssh/besedki_deploy"
FIVEXX_RE = re.compile(r'" [5]\d{2} ')


def check_server_logs() -> dict[str, Any]:
    issues: list[dict[str, Any]] = []
    if not SSH_KEY.exists():
        return {
            "available": False,
            "note": "SSH ключ ~/.ssh/besedki_deploy не найден — логи не проверены",
            "issues": issues,
        }
    cmd = (
        "echo '=== pm2 ==='; pm2 jlist 2>/dev/null | python3 -c \"import sys,json;"
        "d=json.load(sys.stdin); print([(x.get('name'),x.get('pm2_env',{}).get('status')) for x in d])\" 2>/dev/null || pm2 status;"
        "echo '=== nginx errors ==='; tail -100 /var/log/nginx/error.log 2>/dev/null | tail -5;"
        "echo '=== 5xx today ==='; grep -E '\" [5][0-9]{2} ' /var/log/nginx/access.log 2>/dev/null | tail -3;"
        "echo '=== mobile 200 ==='; tail -200 /var/log/nginx/access.log 2>/dev/null | grep -iE 'iphone|android' | tail -3"
    )
    try:
        proc = subprocess.run(
            [
                "ssh",
                "-o",
                "BatchMode=yes",
                "-o",
                "ConnectTimeout=10",
                "-i",
                str(SSH_KEY),
                f"{SSH_USER}@{VPS_HOST}",
                cmd,
            ],
            capture_output=True,
            text=True,
            timeout=25,
        )
        output = (proc.stdout or "") + (proc.stderr or "")
        recent_5xx: list[str] = []
        if "=== 5xx today ===" in output:
            section = output.split("=== 5xx today ===", 1)[1]
            if "=== mobile 200 ===" in section:
                section = section.split("=== mobile 200 ===", 1)[0]
            recent_5xx = [
                ln for ln in section.strip().splitlines() if ln.strip() and FIVEXX_RE.search(ln)
            ]
        if recent_5xx:
            issues.append(
                {
                    "priority": "P0",
                    "category": "server",
                    "problem": "5xx в nginx access.log (недавние)",
                    "url": f"https://real-besedki.ru/",
                    "cause": recent_5xx[0][:200],
                    "impact": "Клиенты видят ошибку сервера",
                    "fact_kind": "verified",
                }
            )
        pm2_down = "errored" in output.lower() or "stopped" in output.lower()
        if pm2_down and "online" not in output.lower():
            issues.append(
                {
                    "priority": "P0",
                    "category": "server",
                    "problem": "PM2 процесс не online",
                    "url": VPS_HOST,
                    "cause": output.split("=== pm2 ===")[-1][:300] if "=== pm2 ===" in output else output[:300],
                    "impact": "Сайт не отдаётся",
                    "fact_kind": "verified",
                }
            )
        return {
            "available": proc.returncode == 0,
            "output_preview": output[-2500:],
            "issues": issues,
        }
    except Exception as exc:
        return {
            "available": False,
            "error": str(exc),
            "note": "SSH недоступен — логи не проверены (не факт проблемы сайта)",
            "issues": issues,
        }
