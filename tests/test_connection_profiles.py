"""Tests for ConnectionProfiles — including direct password field."""

import unittest

from python.odoo_connector.connection_profiles import ConnectionProfile, ConnectionProfiles
from python.odoo_connector.errors import ConfigurationError, NotFoundError


def _make_config(extra: dict | None = None) -> dict:
    profile = {
        "id": "prod",
        "label": "Production",
        "base_url": "https://odoo.example.com",
        "database": "mydb",
        "login": "admin@example.com",
        "auth_type": "password",
        "api_mode": "jsonrpc",
        "enabled": True,
        "port": 443,
    }
    if extra:
        profile.update(extra)
    return {"connection_profiles": [profile]}


class ConnectionProfilesFromConfigTest(unittest.TestCase):
    def test_loads_minimal_profile(self) -> None:
        cp = ConnectionProfiles.from_config(_make_config())
        profile = cp.get("prod")
        self.assertEqual(profile.id, "prod")
        self.assertEqual(profile.login, "admin@example.com")

    def test_loads_direct_password(self) -> None:
        cp = ConnectionProfiles.from_config(_make_config({"password": "s3cr3t"}))
        profile = cp.get("prod")
        self.assertEqual(profile.password, "s3cr3t")

    def test_loads_secret_ref(self) -> None:
        cp = ConnectionProfiles.from_config(_make_config({"secret_ref": "my_ref"}))
        profile = cp.get("prod")
        self.assertEqual(profile.secret_ref, "my_ref")

    def test_password_defaults_to_empty_string(self) -> None:
        cp = ConnectionProfiles.from_config(_make_config())
        self.assertEqual(cp.get("prod").password, "")

    def test_secret_ref_defaults_to_empty_string(self) -> None:
        cp = ConnectionProfiles.from_config(_make_config())
        self.assertEqual(cp.get("prod").secret_ref, "")

    def test_unknown_fields_are_ignored(self) -> None:
        """Extra keys in the config dict must not raise TypeError."""
        cp = ConnectionProfiles.from_config(_make_config({"unknown_future_field": "value"}))
        self.assertIsNotNone(cp.get("prod"))

    def test_raises_when_no_profiles(self) -> None:
        with self.assertRaises(ConfigurationError):
            ConnectionProfiles.from_config({"connection_profiles": []})

    def test_raises_on_missing_profile_id(self) -> None:
        cp = ConnectionProfiles.from_config(_make_config())
        with self.assertRaises(NotFoundError):
            cp.get("nonexistent")

    def test_raises_on_disabled_profile(self) -> None:
        cp = ConnectionProfiles.from_config(_make_config({"enabled": False}))
        with self.assertRaises(ConfigurationError):
            cp.get("prod")

    def test_default_port_is_443(self) -> None:
        config = _make_config()
        # Remove port to rely on the dataclass default
        config["connection_profiles"][0].pop("port", None)
        cp = ConnectionProfiles.from_config(config)
        self.assertEqual(cp.get("prod").port, 443)


if __name__ == "__main__":
    unittest.main()
