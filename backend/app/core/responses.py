from typing import Any

from fastapi import HTTPException, status


def success(data: Any = None, message: str = "OK") -> dict:
    return {"success": True, "data": data, "message": message, "error": None}


def raise_error(status_code: int, message: str) -> None:
    raise HTTPException(status_code=status_code, detail=message)


class AppExceptions:
    UNAUTHORIZED = status.HTTP_401_UNAUTHORIZED
    FORBIDDEN = status.HTTP_403_FORBIDDEN
    NOT_FOUND = status.HTTP_404_NOT_FOUND
    BAD_REQUEST = status.HTTP_400_BAD_REQUEST
    CONFLICT = status.HTTP_409_CONFLICT
