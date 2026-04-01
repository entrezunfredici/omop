"""Public package exports for the embedded Odoo connector."""

from .access_policy import OdooAccessPolicy
from .errors import NotFoundError, ServiceError
from .odoo_client import OdooClient
from .secret import SecretService
from .validators import validate_action_payload

__all__ = [
    "NotFoundError",
    "OdooAccessPolicy",
    "OdooClient",
    "SecretService",
    "ServiceError",
    "validate_action_payload",
]
