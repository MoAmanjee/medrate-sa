"""
Google Calendar Adapter
Sync appointments with Google Calendar
"""
import os
from typing import Dict, Optional
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class GoogleCalendarAdapter:
    """Google Calendar integration for appointment sync"""
    
    def __init__(self):
        self.credentials_path = os.getenv("GOOGLE_CALENDAR_CREDENTIALS_PATH")
        self.calendar_id = os.getenv("GOOGLE_CALENDAR_ID")
        self.mock_mode = os.getenv("GOOGLE_CALENDAR_MOCK_MODE", "true").lower() == "true"
        self.service = None
        
        if not self.mock_mode and self.credentials_path:
            self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Calendar service"""
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=['https://www.googleapis.com/auth/calendar']
            )
            self.service = build('calendar', 'v3', credentials=credentials)
        except Exception as e:
            print(f"Google Calendar initialization error: {e}")
            self.service = None
    
    def create_event(
        self,
        appointment_id: str,
        doctor_email: str,
        patient_name: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None
    ) -> Dict:
        """Create calendar event for appointment"""
        if self.mock_mode:
            return {
                "success": True,
                "event_id": f"mock_event_{appointment_id}",
                "message": "Mock calendar event created"
            }
        
        if not self.service:
            return {
                "success": False,
                "error": "Google Calendar service not initialized"
            }
        
        try:
            event = {
                'summary': f'Appointment: {patient_name}',
                'description': description or f'Appointment with {patient_name}',
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'Africa/Johannesburg',
                },
                'end': {
                    'dateTime": end_time.isoformat(),
                    'timeZone': 'Africa/Johannesburg',
                },
                'attendees': [
                    {'email': doctor_email},
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 30},  # 30 min before
                    ],
                },
            }
            
            event = self.service.events().insert(
                calendarId=self.calendar_id or 'primary',
                body=event
            ).execute()
            
            return {
                "success": True,
                "event_id": event.get('id'),
                "html_link": event.get('htmlLink'),
                "message": "Calendar event created"
            }
            
        except HttpError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create calendar event"
            }
    
    def update_event(
        self,
        event_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        status: Optional[str] = None
    ) -> Dict:
        """Update calendar event"""
        if self.mock_mode:
            return {"success": True, "message": "Mock event updated"}
        
        if not self.service:
            return {"success": False, "error": "Service not initialized"}
        
        try:
            event = self.service.events().get(
                calendarId=self.calendar_id or 'primary',
                eventId=event_id
            ).execute()
            
            if start_time:
                event['start']['dateTime'] = start_time.isoformat()
            if end_time:
                event['end']['dateTime'] = end_time.isoformat()
            if status == "cancelled":
                event['status'] = 'cancelled'
            
            updated_event = self.service.events().update(
                calendarId=self.calendar_id or 'primary',
                eventId=event_id,
                body=event
            ).execute()
            
            return {
                "success": True,
                "event_id": updated_event.get('id'),
                "message": "Event updated"
            }
            
        except HttpError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to update event"
            }
    
    def delete_event(self, event_id: str) -> Dict:
        """Delete calendar event"""
        if self.mock_mode:
            return {"success": True, "message": "Mock event deleted"}
        
        if not self.service:
            return {"success": False, "error": "Service not initialized"}
        
        try:
            self.service.events().delete(
                calendarId=self.calendar_id or 'primary',
                eventId=event_id
            ).execute()
            
            return {"success": True, "message": "Event deleted"}
            
        except HttpError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to delete event"
            }


# Factory function
def get_google_calendar_adapter() -> GoogleCalendarAdapter:
    """Factory function for dependency injection"""
    return GoogleCalendarAdapter()

