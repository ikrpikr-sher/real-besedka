#!/usr/bin/env python3
"""Build script-free homepage snapshot (keeps external stylesheet link).

Do NOT inline large CSS into a single <style> tag — iOS Safari ignores
blocks near ~32KB, which breaks layout (huge icons, no Tailwind classes).
"""
import re
import sys

html = sys.stdin.read()

html = re.sub(r"<script\b[\s\S]*?</script>", "", html, flags=re.I)
html = re.sub(r"<link[^>]+as=\"script\"[^>]*>", "", html, flags=re.I)
html = re.sub(r"<link[^>]+rel=\"preload\"[^>]*>", "", html, flags=re.I)

sys.stdout.write(html)
