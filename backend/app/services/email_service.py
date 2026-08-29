"""
Email delivery via Brevo's HTTP API, not raw SMTP.

Why: Render's free tier (and many other free hosts) blocks outbound
traffic on SMTP ports 25/465/587 to fight spam abuse — this is a network-
level block, not something fixable in application code. Brevo's API is
a normal HTTPS POST, which isn't blocked, and it works identically in
local dev and in production, so there's only one code path to maintain.
"""

import httpx

from app.core.config import settings

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_otp_email(to_email: str, otp: str, purpose: str) -> None:
    subject_map = {
        "signup": "Verify your Fit-Track account",
        "login": "Your Fit-Track login code",
        "reset_password": "Reset your Fit-Track password",
    }
    subject = subject_map.get(purpose, "Your Fit-Track verification code")

    body = (
        f"Your verification code is: {otp}\n\n"
        f"This code expires in {settings.otp_expire_minutes} minutes. "
        f"If you didn't request this, you can ignore this email."
    )

    payload = {
        "sender": {"name": settings.brevo_sender_name, "email": settings.brevo_sender_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "textContent": body,
    }
    headers = {
        "api-key": settings.brevo_api_key,
        "accept": "application/json",
        "content-type": "application/json",
    }

    with httpx.Client(timeout=15.0) as client:
        resp = client.post(BREVO_URL, json=payload, headers=headers)
        resp.raise_for_status()
