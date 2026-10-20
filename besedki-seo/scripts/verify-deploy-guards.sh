#!/usr/bin/env bash
# Проверки, чтобы deploy не перезаписал живой каталог и 3D на сервере.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXCLUDE="$ROOT/.rsync-exclude"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes"

errors=0
fail() { echo "ERROR: $1" >&2; errors=$((errors + 1)); }
ok() { echo "  ok: $1"; }

echo "=== Verify deploy guards ==="

if [[ ! -f "$EXCLUDE" ]]; then
  fail "Missing .rsync-exclude"
else
  for pattern in \
    'data/katalog.json' \
    'data/proekty.json' \
    'public/models/*.glb' \
    'content/blog/' \
    'public/videos/' \
    'public/images/blog/'; do
    if ! grep -qxF "$pattern" "$EXCLUDE"; then
      fail ".rsync-exclude must contain: $pattern"
    else
      ok "$pattern excluded from rsync"
    fi
  done

  if grep -qxF 'public/models' "$EXCLUDE"; then
    fail "public/models must NOT be fully excluded — only *.glb"
  fi
fi

if [[ -f "$ROOT/data/katalog.json" ]]; then
  node "$ROOT/scripts/validate-katalog.mjs" --skip-file-check || errors=$((errors + 1))
else
  ok "no local katalog.json — skip validate"
fi

# Remote blog must exist on server (admin edits live there)
if $SSH "$HOST" "test -d $REMOTE/content/blog"; then
  remote_blog_count="$($SSH "$HOST" "find $REMOTE/content/blog -maxdepth 1 -name '*.mdx' | wc -l" | tr -d ' ')"
  if [[ "$remote_blog_count" -lt 1 ]]; then
    fail "Remote content/blog has no .mdx files"
  else
    ok "remote content/blog: $remote_blog_count posts"
  fi
else
  fail "Remote content/blog missing at $REMOTE/content/blog"
fi
if $SSH "$HOST" "test -f $REMOTE/data/katalog.json"; then
  remote_count="$($SSH "$HOST" "python3 -c \"import json; print(len(json.load(open('$REMOTE/data/katalog.json'))))\"")"
  if [[ "$remote_count" -lt 10 ]]; then
    fail "Remote katalog.json has only $remote_count items — suspicious"
  else
    ok "remote katalog.json: $remote_count items"
  fi
else
  fail "Remote katalog.json missing at $REMOTE/data/katalog.json"
fi

echo ""
if [[ "$errors" -gt 0 ]]; then
  echo "FAILED: $errors guard error(s)"
  exit 1
fi

echo "PASSED: deploy guards OK"
exit 0
