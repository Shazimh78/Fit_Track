import smtplib
from email.mime.text import MIMEText

from app.core.config import settings


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

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg["To"] = to_email

    # Sync SMTP call — fine at this volume; move to a background task queue
    # (e.g. Celery/RQ) if email volume grows enough to block request latency.
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_user, [to_email], msg.as_string())
