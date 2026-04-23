import os
import requests


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def _base_headers(api_key: str) -> dict:
    return {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _request(method: str, path: str, *, payload: dict | None = None, use_service_role: bool = False):
    base_url = _require_env("SUPABASE_URL").rstrip("/")
    api_key = _require_env("SUPABASE_SERVICE_ROLE_KEY" if use_service_role else "SUPABASE_ANON_KEY")
    response = requests.request(
        method,
        f"{base_url}{path}",
        headers=_base_headers(api_key),
        json=payload,
        timeout=20,
    )
    try:
        data = response.json()
    except Exception:
        data = {}
    if not response.ok:
        message = data.get("msg") or data.get("error_description") or data.get("error") or response.text
        raise RuntimeError(message)
    return data


def sign_up_user(email: str, password: str, *, user_metadata: dict | None = None):
    return _request(
        "POST",
        "/auth/v1/signup",
        payload={
            "email": email,
            "password": password,
            "data": user_metadata or {},
        },
    )


def sign_in_user(email: str, password: str):
    return _request(
        "POST",
        "/auth/v1/token?grant_type=password",
        payload={
            "email": email,
            "password": password,
        },
    )


def admin_create_user(email: str, password: str, *, user_metadata: dict | None = None, email_confirm: bool = False):
    return _request(
        "POST",
        "/auth/v1/admin/users",
        payload={
            "email": email,
            "password": password,
            "email_confirm": email_confirm,
            "user_metadata": user_metadata or {},
        },
        use_service_role=True,
    )


def admin_update_user(user_id: str, attributes: dict):
    return _request(
        "PUT",
        f"/auth/v1/admin/users/{user_id}",
        payload=attributes,
        use_service_role=True,
    )
