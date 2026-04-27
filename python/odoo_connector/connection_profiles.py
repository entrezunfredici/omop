"""Connection profile storage and selection."""

from __future__ import annotations

from dataclasses import dataclass, field, fields as dc_fields

from .errors import ConfigurationError, NotFoundError


@dataclass(slots=True)
class ConnectionProfile:
    id: str
    label: str
    base_url: str
    database: str
    login: str
    auth_type: str
    api_mode: str
    enabled: bool
    port: int = 443
    # Authentication: password takes precedence over secret_ref when set.
    password: str = ""
    secret_ref: str = ""


class ConnectionProfiles:
    def __init__(self, profiles: list[ConnectionProfile]) -> None:
        self._profiles = {profile.id: profile for profile in profiles}

    @classmethod
    def from_config(cls, config: dict) -> "ConnectionProfiles":
        raw_profiles = config.get("connection_profiles", [])
        known = {f.name for f in dc_fields(ConnectionProfile)}
        profiles = [
            ConnectionProfile(**{k: v for k, v in item.items() if k in known})
            for item in raw_profiles
        ]

        if not profiles:
            raise ConfigurationError("No connection profiles configured")

        return cls(profiles)

    def get(self, profile_id: str) -> ConnectionProfile:
        profile = self._profiles.get(profile_id)
        if profile is None:
            raise NotFoundError(
                f"Connection profile '{profile_id}' not found",
                {"connection_profile_id": profile_id},
            )
        if not profile.enabled:
            raise ConfigurationError(
                f"Connection profile '{profile_id}' is disabled",
                {"connection_profile_id": profile_id},
            )
        return profile
