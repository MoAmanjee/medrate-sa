"""
Twilio Video Adapter
Telehealth video consultation integration
"""
import os
from typing import Dict, Optional
from twilio.rest import Client as TwilioClient
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant


class TwilioVideoAdapter:
    """Twilio Video integration for telehealth appointments"""
    
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.api_key = os.getenv("TWILIO_API_KEY")
        self.api_secret = os.getenv("TWILIO_API_SECRET")
        self.mock_mode = os.getenv("TWILIO_VIDEO_MOCK_MODE", "true").lower() == "true"
        
        if not self.mock_mode and self.account_sid and self.auth_token:
            self.client = TwilioClient(self.account_sid, self.auth_token)
        else:
            self.client = None
    
    def create_room(
        self,
        appointment_id: str,
        doctor_name: str,
        patient_name: str
    ) -> Dict:
        """Create Twilio Video room for appointment"""
        if self.mock_mode:
            return {
                "success": True,
                "room_name": f"room_{appointment_id}",
                "room_url": f"https://mock-video.com/room/{appointment_id}",
                "message": "Mock video room created"
            }
        
        if not self.client:
            return {
                "success": False,
                "error": "Twilio client not initialized"
            }
        
        try:
            room_name = f"appointment_{appointment_id}"
            
            room = self.client.video.rooms.create(
                unique_name=room_name,
                type='go',  # Group room
                record_participants_on_connect=False,
                status_callback=f"{os.getenv('API_URL')}/api/appointments/{appointment_id}/video-callback"
            )
            
            return {
                "success": True,
                "room_name": room.unique_name,
                "room_sid": room.sid,
                "room_url": f"https://twilio.com/room/{room.unique_name}",
                "message": "Video room created"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create video room"
            }
    
    def generate_access_token(
        self,
        identity: str,  # User identifier (doctor_id or patient_id)
        room_name: str
    ) -> Dict:
        """Generate access token for video room"""
        if self.mock_mode:
            return {
                "success": True,
                "token": "mock_token",
                "message": "Mock token generated"
            }
        
        if not self.api_key or not self.api_secret:
            return {
                "success": False,
                "error": "Twilio API credentials not configured"
            }
        
        try:
            # Create access token
            token = AccessToken(
                self.account_sid,
                self.api_key,
                self.api_secret,
                identity=identity
            )
            
            # Grant video access
            video_grant = VideoGrant(room=room_name)
            token.add_grant(video_grant)
            
            return {
                "success": True,
                "token": token.to_jwt(),
                "identity": identity,
                "room_name": room_name,
                "message": "Access token generated"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate access token"
            }
    
    def end_room(self, room_sid: str) -> Dict:
        """End video room"""
        if self.mock_mode:
            return {"success": True, "message": "Mock room ended"}
        
        if not self.client:
            return {"success": False, "error": "Twilio client not initialized"}
        
        try:
            room = self.client.video.rooms(room_sid).update(status='completed')
            
            return {
                "success": True,
                "room_sid": room_sid,
                "status": room.status,
                "message": "Room ended"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to end room"
            }


# Factory function
def get_twilio_video_adapter() -> TwilioVideoAdapter:
    """Factory function for dependency injection"""
    return TwilioVideoAdapter()

