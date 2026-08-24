from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

Priority = Literal["P0", "P1", "P2"]
IssueStatus = Literal["open", "in_progress", "fixed", "owner"]
FactKind = Literal["fact", "hypothesis", "verified", "not_verified"]


@dataclass
class HealthIssue:
    priority: Priority
    category: str
    problem: str
    url: str = ""
    cause: str = ""
    impact: str = ""
    fix: str = ""
    verification: str = ""
    status: IssueStatus = "open"
    fact_kind: FactKind = "verified"
    evidence: dict[str, Any] = field(default_factory=dict)
    auto_fixable: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def issue_dict(**kwargs: Any) -> dict[str, Any]:
    return HealthIssue(**kwargs).to_dict()
