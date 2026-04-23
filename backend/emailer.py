"""Email sender with Resend integration.

Falls back to logging the reset link to stdout + database when no RESEND_API_KEY
is configured, so the platform works end-to-end in beta without real emails.
Managers can view the latest reset link for any user from the admin panel.
"""
import os
import logging
import httpx

from db import db
from models import new_id, now_iso

logger = logging.getLogger(__name__)


async def send_password_reset(to_email: str, reset_url: str) -> bool:
    api_key = os.environ.get("RESEND_API_KEY")
    from_email = os.environ.get("RESEND_FROM", "MyTown <onboarding@resend.dev>")

    subject = "Reset your MyTown password"
    html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width:560px;margin:auto;padding:24px;color:#0F172A;">
            <h2 style="margin:0 0 12px;">Reset your MyTown password</h2>
            <p style="color:#475569;line-height:1.6;">We received a request to reset your password. Click the button below to choose a new one. This link expires in 2 hours.</p>
            <p><a href="{reset_url}" style="display:inline-block;background:#0F172A;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Reset password</a></p>
            <p style="color:#64748B;font-size:13px;">If you didn't request this, you can ignore this email.</p>
            <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;">
            <p style="color:#94A3B8;font-size:12px;">MyTown — DH Website Services. Pontypridd beta.</p>
        </div>
    """

    delivery = {
        "id": new_id(),
        "to": to_email,
        "subject": subject,
        "reset_url": reset_url,
        "provider": "resend" if api_key else "console",
        "status": "pending",
        "created_at": now_iso(),
    }

    if not api_key:
        logger.warning(
            "[email-stub] No RESEND_API_KEY set. Password reset URL for %s: %s",
            to_email, reset_url,
        )
        delivery["status"] = "stub-logged"
        await db.email_log.insert_one(delivery)
        return True

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": from_email,
                    "to": [to_email],
                    "subject": subject,
                    "html": html,
                },
            )
            if resp.status_code >= 400:
                logger.error("Resend error %s: %s", resp.status_code, resp.text)
                delivery["status"] = "error"
                delivery["error"] = resp.text[:500]
                await db.email_log.insert_one(delivery)
                return False
            delivery["status"] = "sent"
            delivery["provider_response"] = resp.json()
            await db.email_log.insert_one(delivery)
            return True
    except Exception as e:
        logger.exception("Resend send failed: %s", e)
        delivery["status"] = "error"
        delivery["error"] = str(e)[:500]
        await db.email_log.insert_one(delivery)
        return False
