"""FastAPI HTTP service wrapping the action executor.

Start with:
    python -m python.odoo_connector.server

Environment variables:
    ODOO_SERVICE_HOST   bind host            (default: 127.0.0.1)
    ODOO_SERVICE_PORT   bind port            (default: 8765)
    ODOO_PLUGIN_TOKEN   shared secret token  (recommended; if unset, auth is disabled with a warning)
"""

from __future__ import annotations

import logging
import os
from typing import Any, Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .action_executor import ActionExecutor
from .errors import ConnectorError

logger = logging.getLogger(__name__)

app = FastAPI(title="OMOCP Python Service", version="0.1.0")

# Restrict CORS to localhost — the service should never be called from external origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1"],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "X-Plugin-Token"],
)

_PLUGIN_TOKEN: str = os.environ.get("ODOO_PLUGIN_TOKEN", "")
if not _PLUGIN_TOKEN:
    logger.warning(
        "ODOO_PLUGIN_TOKEN is not set. The /execute endpoint accepts all requests. "
        "Set this variable to a shared secret to restrict access."
    )

_executor = ActionExecutor()


def _verify_token(x_plugin_token: Annotated[str, Header()] = "") -> None:
    if _PLUGIN_TOKEN and x_plugin_token != _PLUGIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Plugin-Token")


class ExecuteRequest(BaseModel):
    action: str
    model: str = ""
    payload: dict[str, Any] = {}
    config: dict[str, Any] = {}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/execute", dependencies=[Depends(_verify_token)])
def execute(req: ExecuteRequest) -> dict[str, Any]:
    try:
        return _executor.execute(
            action=req.action,
            model=req.model,
            payload=req.payload,
            config=req.config,
        )
    except ConnectorError as exc:
        raise HTTPException(status_code=400, detail=exc.to_dict()) from exc
    except Exception as exc:
        logger.exception("Unexpected error processing action '%s'", req.action)
        raise HTTPException(
            status_code=500,
            detail={"ok": False, "error": {"code": "INTERNAL_ERROR", "message": "Internal server error"}},
        ) from exc


if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("ODOO_SERVICE_HOST", "127.0.0.1")
    port = int(os.environ.get("ODOO_SERVICE_PORT", "8765"))
    uvicorn.run("python.odoo_connector.server:app", host=host, port=port, log_level="info")
