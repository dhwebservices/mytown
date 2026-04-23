import logging
import os
import requests


logger = logging.getLogger(__name__)


def _service_headers() -> dict:
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not service_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not configured.")
    return {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }


def _rest_url(table: str) -> str:
    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    if not base_url:
        raise RuntimeError("SUPABASE_URL is not configured.")
    return f"{base_url}/rest/v1/{table}"


def sync_profile_row(profile: dict) -> dict | None:
    payload = {
        "id": profile["id"],
        "email": str(profile.get("email") or "").lower().strip(),
        "username": str(profile.get("username") or "").lower().strip(),
        "role": profile.get("role"),
        "full_name": profile.get("full_name"),
        "phone": profile.get("phone"),
        "status": profile.get("status", "active"),
        "email_verified": bool(profile.get("email_verified")),
    }
    response = requests.post(
        _rest_url("profiles"),
        headers=_service_headers(),
        params={"on_conflict": "id"},
        json=payload,
        timeout=20,
    )
    if not response.ok:
        raise RuntimeError(response.text)
    try:
        rows = response.json()
    except Exception:
        rows = []
    return rows[0] if isinstance(rows, list) and rows else None


def try_sync_profile_row(profile: dict) -> None:
    try:
        sync_profile_row(profile)
    except Exception as error:
        logger.warning("Supabase profile sync skipped: %s", error)
