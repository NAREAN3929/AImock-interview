import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("email_service")

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.sender_email = os.getenv("SENDER_EMAIL", "noreply@interview.ai")

    def send_otp_email(self, recipient_email: str, otp_code: str):
        subject = "🔑 Your Email Verification OTP Code - InterviewAI Prime"
        body = f"""
        Hello Candidate,

        Welcome to InterviewAI Prime!

        Your 6-digit email verification OTP code is:

        ======================================
        👉  {otp_code}  👈
        ======================================

        This OTP is valid for 5 MINUTES. Please enter this code in your browser modal to activate your account.

        If you did not request this verification, please ignore this email.

        Best regards,
        InterviewAI Prime Security Team
        """
        self._dispatch_email(recipient_email, subject, body, f"[OTP VERIFICATION] Sent OTP '{otp_code}' to {recipient_email}")

    def send_password_reset_email(self, recipient_email: str, reset_token: str):
        reset_link = f"http://localhost:5173/?reset_token={reset_token}"
        subject = "Password Reset Request - InterviewAI Prime"
        body = f"""
        Hello Candidate,

        We received a request to reset your password for InterviewAI Prime.

        Click the link below to set a new password in your browser:

        ======================================================================
        LINK:  {reset_link}
        ======================================================================

        This reset link is valid for 15 MINUTES.

        If you did not request a password reset, please ignore this email.

        Best regards,
        InterviewAI Prime Support Team
        """
        self._dispatch_email(recipient_email, subject, body, f"[PASSWORD RESET] Sent Reset Link to {recipient_email}: {reset_link}")

    def _dispatch_email(self, to_email: str, subject: str, body: str, log_message: str):
        # Console output for zero-config testing (ASCII-safe for Windows cp1252)
        try:
            print("\n" + "="*70)
            print(f"[EMAIL DISPATCH] TO: {to_email}")
            print(f"SUBJECT: {subject}")
            print(body)
            print("="*70 + "\n")
        except Exception:
            pass
        
        logger.info(log_message)

        # Send via SMTP if configured
        if self.smtp_host and self.smtp_user and self.smtp_password:
            try:
                msg = MIMEMultipart()
                msg['From'] = self.sender_email
                msg['To'] = to_email
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'plain'))

                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                server.quit()
                logger.info(f"Successfully delivered email via SMTP to {to_email}")
            except Exception as e:
                logger.error(f"Failed to send email via SMTP: {e}")

email_service = EmailService()
