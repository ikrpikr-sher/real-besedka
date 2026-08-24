#!/usr/bin/env bash
# Будни: P0 → check → report → backlog (для cron / Cursor Automation)
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
export PYTHONUNBUFFERED=1

echo "=== SEO weekday $(date '+%Y-%m-%d %H:%M %Z') ==="
python3 real-besedki-seo-agent/main.py weekday "$@"
EXIT=$?
echo "=== exit code: $EXIT ==="
exit "$EXIT"
