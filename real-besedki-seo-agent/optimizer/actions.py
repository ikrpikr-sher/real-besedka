from __future__ import annotations

READ_ONLY = True


def require_write_permission(action: str, payload: dict) -> None:
    raise PermissionError(
        f"Этап 1: только чтение. Действие {action} заблокировано. "
        "Нужно отдельное разрешение пользователя. "
        f"payload={payload}"
    )
