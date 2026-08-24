from __future__ import annotations

from pathlib import Path

from config import ROOT


def load_env(path: Path | None = None) -> dict[str, str]:
    env_path = path or (ROOT / ".env")
    out: dict[str, str] = {}
    if not env_path.exists():
        return out
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        out[key.strip()] = value.strip().strip('"').strip("'")
    return out


def masked(value: str) -> str:
    if not value:
        return "нет"
    if len(value) <= 8:
        return "задан"
    return f"задан ({len(value)} симв.)"


def upsert_env(key: str, value: str, path: Path | None = None) -> Path:
    env_path = path or (ROOT / ".env")
    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
    out: list[str] = []
    found = False
    for line in lines:
        if line.startswith(f"{key}="):
            out.append(f"{key}={value}")
            found = True
        else:
            out.append(line)
    if not found:
        if out and out[-1].strip():
            out.append("")
        out.append(f"# Keys.so API — не коммитить")
        out.append(f"{key}={value}")
    env_path.write_text("\n".join(out) + "\n", encoding="utf-8")
    env_path.chmod(0o600)
    return env_path
