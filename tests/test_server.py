"""Tests for the FastAPI HTTP service.

These tests require fastapi and httpx to be installed (available in the plugin venv).
They are skipped automatically when those packages are absent (e.g. on a dev machine
without the Python venv active).
"""

import unittest
from unittest.mock import patch, MagicMock

try:
    from fastapi.testclient import TestClient
    from python.odoo_connector.server import app
    _FASTAPI_AVAILABLE = True
except ModuleNotFoundError:
    _FASTAPI_AVAILABLE = False

skipIfNoFastAPI = unittest.skipUnless(_FASTAPI_AVAILABLE, "fastapi not installed")


# Minimal config that passes validate_config
_BASE_CONFIG = {
    "active_connection_profile_id": "default",
    "active_access_profile_id": "readonly",
    "default_limit": 25,
    "read_only": True,
    "connection_profiles": [
        {
            "id": "default",
            "label": "Default",
            "base_url": "https://odoo.example.com",
            "database": "testdb",
            "login": "bot@example.com",
            "password": "secret",
            "auth_type": "password",
            "secret_ref": "default",
            "api_mode": "jsonrpc",
            "enabled": True,
            "port": 443,
        }
    ],
    "access_profiles": [
        {
            "id": "readonly",
            "label": "Readonly",
            "connection_profile_id": "default",
            "enabled": True,
            "default_read_confirmation": False,
            "default_create_confirmation": True,
            "default_write_confirmation": True,
            "default_delete_confirmation": True,
        }
    ],
    "permission_rules": [
        {
            "id": "read_all",
            "access_profile_id": "readonly",
            "model": "project.task",
            "field": "*",
            "operation": "read",
            "allowed": True,
        }
    ],
}


@skipIfNoFastAPI
class HealthEndpointTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_health_returns_ok(self) -> None:
        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json(), {"status": "ok"})


@skipIfNoFastAPI
class ExecuteEndpointTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.fake_client = MagicMock()
        self.fake_client.get.return_value = [{"id": 1, "name": "Task"}]

    def _post(self, action: str, model: str = "project.task", payload: dict | None = None, config: dict | None = None) -> MagicMock:
        return self.client.post(
            "/execute",
            json={
                "action": action,
                "model": model,
                "payload": payload or {},
                "config": config or _BASE_CONFIG,
            },
        )

    def test_read_returns_records(self) -> None:
        with (
            patch("python.odoo_connector.action_executor.SecretService.get_secret", return_value="secret"),
            patch("python.odoo_connector.action_executor.OdooClient", return_value=self.fake_client),
        ):
            r = self._post("odoo_read", payload={"fields": ["id", "name"]})

        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertTrue(body["ok"])
        self.assertEqual(body["records"], [{"id": 1, "name": "Task"}])

    def test_invalid_action_returns_400(self) -> None:
        with (
            patch("python.odoo_connector.action_executor.SecretService.get_secret", return_value="secret"),
            patch("python.odoo_connector.action_executor.OdooClient", return_value=self.fake_client),
        ):
            r = self._post("odoo_hack")

        self.assertEqual(r.status_code, 400)

    def test_invalid_model_name_returns_400(self) -> None:
        r = self._post("odoo_read", model="../../etc/passwd")
        self.assertEqual(r.status_code, 400)
        detail = r.json()["detail"]
        self.assertIn("VALIDATION_ERROR", str(detail))

    def test_read_only_blocks_create(self) -> None:
        config = {**_BASE_CONFIG, "read_only": True}
        with (
            patch("python.odoo_connector.action_executor.SecretService.get_secret", return_value="secret"),
            patch("python.odoo_connector.action_executor.OdooClient", return_value=self.fake_client),
        ):
            r = self._post("odoo_create", payload={"values": {"name": "x", "project_id": 1}}, config=config)

        self.assertEqual(r.status_code, 400)
        self.assertIn("AUTHORIZATION_DENIED", str(r.json()))

    def test_missing_config_returns_400(self) -> None:
        r = self._post("odoo_read", config={})
        self.assertEqual(r.status_code, 400)
        self.assertIn("VALIDATION_ERROR", str(r.json()))


@skipIfNoFastAPI
class TokenAuthTest(unittest.TestCase):
    def test_no_token_required_when_env_not_set(self) -> None:
        import python.odoo_connector.server as srv
        original = srv._PLUGIN_TOKEN
        try:
            srv._PLUGIN_TOKEN = ""
            client = TestClient(app)
            r = client.get("/health")
            self.assertEqual(r.status_code, 200)
        finally:
            srv._PLUGIN_TOKEN = original

    def test_valid_token_accepted(self) -> None:
        import python.odoo_connector.server as srv
        original = srv._PLUGIN_TOKEN
        try:
            srv._PLUGIN_TOKEN = "test-secret"
            client = TestClient(app)
            fake = MagicMock()
            fake.get.return_value = []
            with (
                patch("python.odoo_connector.action_executor.SecretService.get_secret", return_value="secret"),
                patch("python.odoo_connector.action_executor.OdooClient", return_value=fake),
            ):
                r = client.post(
                    "/execute",
                    json={"action": "odoo_read", "model": "project.task", "payload": {}, "config": _BASE_CONFIG},
                    headers={"X-Plugin-Token": "test-secret"},
                )
            self.assertNotEqual(r.status_code, 401)
        finally:
            srv._PLUGIN_TOKEN = original

    def test_wrong_token_rejected(self) -> None:
        import python.odoo_connector.server as srv
        original = srv._PLUGIN_TOKEN
        try:
            srv._PLUGIN_TOKEN = "test-secret"
            client = TestClient(app)
            r = client.post(
                "/execute",
                json={"action": "odoo_read", "model": "project.task", "payload": {}, "config": _BASE_CONFIG},
                headers={"X-Plugin-Token": "wrong"},
            )
            self.assertEqual(r.status_code, 401)
        finally:
            srv._PLUGIN_TOKEN = original

    def test_missing_token_rejected(self) -> None:
        import python.odoo_connector.server as srv
        original = srv._PLUGIN_TOKEN
        try:
            srv._PLUGIN_TOKEN = "test-secret"
            client = TestClient(app)
            r = client.post(
                "/execute",
                json={"action": "odoo_read", "model": "project.task", "payload": {}, "config": _BASE_CONFIG},
            )
            self.assertEqual(r.status_code, 401)
        finally:
            srv._PLUGIN_TOKEN = original


if __name__ == "__main__":
    unittest.main()
