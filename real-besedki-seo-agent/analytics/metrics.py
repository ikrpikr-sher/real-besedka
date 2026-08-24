from __future__ import annotations


def title_len_ok(title: str | None) -> bool:
    if not title:
        return False
    n = len(title)
    return 20 <= n <= 70


def description_len_ok(description: str | None) -> bool:
    if not description:
        return False
    n = len(description)
    return 70 <= n <= 180


def count_by_severity(findings: list[dict]) -> dict[str, int]:
    out = {"critical": 0, "warning": 0, "info": 0}
    for item in findings:
        sev = item.get("severity") or "info"
        if sev in out:
            out[sev] += 1
        else:
            out["info"] += 1
    return out
