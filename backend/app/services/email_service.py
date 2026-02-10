"""Email service for sending invitations and notifications."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings


class EmailService:
    """Service for sending emails using Gmail SMTP."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL or settings.SMTP_USER
        self.from_name = settings.FROM_NAME
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email."""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email
            
            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, "plain")
                msg.attach(part1)
            
            part2 = MIMEText(html_content, "html")
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            print(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email to {to_email}. Error: {e}")
            return False
    
    def send_team_invitation(
        self,
        to_email: str,
        to_name: str,
        inviter_name: str,
        company_name: str,
        invitation_link: str
    ) -> bool:
        """Send team invitation email."""
        subject = f"{inviter_name}님이 {company_name} 팀에 초대했습니다"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    color: #6b7280;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎉 팀 초대</h1>
            </div>
            <div class="content">
                <p>안녕하세요 {to_name}님,</p>
                <p><strong>{inviter_name}</strong>님이 <strong>{company_name}</strong>의 R&D 프로젝트 팀에 초대했습니다.</p>
                <p>아래 버튼을 클릭하여 초대를 수락하고 계정을 생성하세요:</p>
                <div style="text-align: center;">
                    <a href="{invitation_link}" class="button">초대 수락하기</a>
                </div>
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                    <code style="background: #e5e7eb; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 10px;">
                        {invitation_link}
                    </code>
                </p>
            </div>
            <div class="footer">
                <p>이 이메일은 R&D SaaS Platform에서 자동으로 발송되었습니다.</p>
                <p>초대를 요청하지 않으셨다면 이 이메일을 무시하세요.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        안녕하세요 {to_name}님,
        
        {inviter_name}님이 {company_name}의 R&D 프로젝트 팀에 초대했습니다.
        
        아래 링크를 클릭하여 초대를 수락하고 계정을 생성하세요:
        {invitation_link}
        
        이 이메일은 R&D SaaS Platform에서 자동으로 발송되었습니다.
        초대를 요청하지 않으셨다면 이 이메일을 무시하세요.
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_verification_email(
        self,
        to_email: str,
        to_name: str,
        verification_link: str
    ) -> bool:
        """Send email verification email."""
        subject = "이메일 주소를 인증해주세요"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    color: #6b7280;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>✉️ 이메일 인증</h1>
            </div>
            <div class="content">
                <p>안녕하세요 {to_name}님,</p>
                <p>R&D SaaS Platform에 가입해주셔서 감사합니다!</p>
                <p>아래 버튼을 클릭하여 이메일 주소를 인증하고 계정을 활성화하세요:</p>
                <div style="text-align: center;">
                    <a href="{verification_link}" class="button">이메일 인증하기</a>
                </div>
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                    <code style="background: #e5e7eb; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 10px;">
                        {verification_link}
                    </code>
                </p>
                <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <strong>⚠️ 주의:</strong> 이메일 인증을 완료하지 않으면 로그인할 수 없습니다.
                </p>
            </div>
            <div class="footer">
                <p>이 이메일은 R&D SaaS Platform에서 자동으로 발송되었습니다.</p>
                <p>계정을 만들지 않으셨다면 이 이메일을 무시하세요.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        안녕하세요 {to_name}님,
        
        R&D SaaS Platform에 가입해주셔서 감사합니다!
        
        아래 링크를 클릭하여 이메일 주소를 인증하고 계정을 활성화하세요:
        {verification_link}
        
        ⚠️ 주의: 이메일 인증을 완료하지 않으면 로그인할 수 없습니다.
        
        이 이메일은 R&D SaaS Platform에서 자동으로 발송되었습니다.
        계정을 만들지 않으셨다면 이 이메일을 무시하세요.
        """
        
        return self.send_email(to_email, subject, html_content, text_content)


# Singleton instance
email_service = EmailService()
