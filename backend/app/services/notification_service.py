"""
Notification Service
SMS (Twilio), Email (SendGrid), Push (FCM)
"""
import os
from typing import Dict, Optional
from twilio.rest import Client as TwilioClient
import sendgrid
from sendgrid.helpers.mail import Mail
from firebase_admin import messaging
import firebase_admin


class NotificationService:
    """Service for sending notifications"""
    
    def __init__(self):
        # Twilio
        self.twilio_sid = os.getenv("TWILIO_SID")
        self.twilio_auth = os.getenv("TWILIO_AUTH")
        self.twilio_phone = os.getenv("TWILIO_PHONE")
        self.twilio_client = None
        
        if self.twilio_sid and self.twilio_auth:
            self.twilio_client = TwilioClient(self.twilio_sid, self.twilio_auth)
        
        # SendGrid
        self.sendgrid_key = os.getenv("SENDGRID_API_KEY")
        self.sendgrid_from = os.getenv("SENDGRID_FROM_EMAIL", "noreply@ratethedoctor.co.za")
        self.sendgrid_client = None
        
        if self.sendgrid_key:
            self.sendgrid_client = sendgrid.SendGridAPIClient(api_key=self.sendgrid_key)
        
        # Firebase (for push notifications)
        try:
            firebase_admin.get_app()
        except ValueError:
            # Initialize Firebase if not already initialized
            cred = firebase_admin.credentials.Certificate(
                os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
            )
            firebase_admin.initialize_app(cred)
    
    def send_booking_confirmation(
        self,
        phone: str,
        email: str,
        appointment_details: Dict,
        checkin_code: Optional[Dict] = None
    ) -> Dict:
        """Send booking confirmation with check-in code"""
        results = {"sms": False, "email": False, "push": False}
        
        # SMS
        if phone and self.twilio_client:
            try:
                message = f"""Appointment Confirmed!
Doctor: {appointment_details['doctor_name']}
Date: {appointment_details['date']}
Time: {appointment_details['time']}
Ref: {appointment_details['booking_reference']}
"""
                
                if checkin_code:
                    message += f"\nCheck-in Code: {checkin_code['otp_code']}"
                    if checkin_code.get('qr_code_data'):
                        message += "\nQR code sent via email."
                
                self.twilio_client.messages.create(
                    body=message,
                    from_=self.twilio_phone,
                    to=phone
                )
                results["sms"] = True
            except Exception as e:
                print(f"SMS error: {e}")
        
        # Email
        if email and self.sendgrid_client:
            try:
                subject = "Appointment Confirmed - RateTheDoctor"
                html_content = self._generate_booking_email_html(
                    appointment_details,
                    checkin_code
                )
                
                message = Mail(
                    from_email=self.sendgrid_from,
                    to_emails=email,
                    subject=subject,
                    html_content=html_content
                )
                
                self.sendgrid_client.send(message)
                results["email"] = True
            except Exception as e:
                print(f"Email error: {e}")
        
        return results
    
    def send_otp(self, phone: str, email: str, otp_code: str, purpose: str) -> Dict:
        """Send OTP code"""
        results = {"sms": False, "email": False}
        
        # SMS
        if phone and self.twilio_client:
            try:
                message = f"Your RateTheDoctor verification code: {otp_code}"
                self.twilio_client.messages.create(
                    body=message,
                    from_=self.twilio_phone,
                    to=phone
                )
                results["sms"] = True
            except Exception as e:
                print(f"SMS error: {e}")
        
        # Email
        if email and self.sendgrid_client:
            try:
                message = Mail(
                    from_email=self.sendgrid_from,
                    to_emails=email,
                    subject="RateTheDoctor Verification Code",
                    html_content=f"<p>Your verification code is: <strong>{otp_code}</strong></p>"
                )
                self.sendgrid_client.send(message)
                results["email"] = True
            except Exception as e:
                print(f"Email error: {e}")
        
        return results
    
    def send_push_notification(
        self,
        fcm_token: str,
        title: str,
        body: str,
        data: Optional[Dict] = None
    ) -> bool:
        """Send push notification via FCM"""
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                token=fcm_token
            )
            
            messaging.send(message)
            return True
        except Exception as e:
            print(f"Push notification error: {e}")
            return False
    
    def _generate_booking_email_html(self, details: Dict, checkin_code: Optional[Dict]) -> str:
        """Generate HTML email for booking confirmation"""
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Appointment Confirmed</h2>
            <p><strong>Doctor:</strong> {details['doctor_name']}</p>
            <p><strong>Date:</strong> {details['date']}</p>
            <p><strong>Time:</strong> {details['time']}</p>
            <p><strong>Reference:</strong> {details['booking_reference']}</p>
        """
        
        if checkin_code:
            html += f"""
            <h3>Check-in Information</h3>
            <p><strong>OTP Code:</strong> <span style="font-size: 24px; font-weight: bold;">{checkin_code['otp_code']}</span></p>
            """
            
            if checkin_code.get('qr_code_data'):
                html += f'<p><img src="{checkin_code["qr_code_data"]}" alt="QR Code" /></p>'
        
        html += """
            <p>Please arrive 10 minutes before your appointment.</p>
            <p>Thank you for using RateTheDoctor!</p>
        </body>
        </html>
        """
        
        return html


# Factory function
def get_notification_service() -> NotificationService:
    """Factory function for dependency injection"""
    return NotificationService()

