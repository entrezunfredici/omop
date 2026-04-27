"""FastAPI HTTP service wrapping the action executor.

Start with:
    python -m python.odoo_connector.server

Environment variables:
    ODOO_SERVICE_HOST  bind host  (default: 0.0.0.0)
    ODOO_SERVICE_PORT  bind port  (default: 8765)
"""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .action_executor import ActionExecutor
from .errors import ConnectorError

app = FastAPI(title="OMOCP Python Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

_executor = ActionExecutor()


class ExecuteRequest(BaseModel):
    action: str
    model: str = ""
    payload: dict[str, Any] = {}
    config: dict[str, Any] = {}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/execute")
def execute(req: ExecuteRequest) -> dict[str, Any]:
    try:
        result = _executor.execute(
            action=req.action,
            model=req.model,
            payload=req.payload,
            config=req.config,
        )
        return result
    except ConnectorError as exc:
        raise HTTPException(status_code=400, detail=exc.to_dict()) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail={"ok": False, "error": {"code": "INTERNAL_ERROR", "message": str(exc)}}) from exc


if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("ODOO_SERVICE_HOST", "0.0.0.0")
    port = int(os.environ.get("ODOO_SERVICE_PORT", "8765"))
    uvicorn.run("python.odoo_connector.server:app", host=host, port=port, log_level="info")
