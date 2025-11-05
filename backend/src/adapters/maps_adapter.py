"""
Google Maps Adapter
Mock and real implementations for location services
"""
import os
import requests
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class Location:
    lat: float
    lng: float


@dataclass
class DistanceResult:
    distance_km: float
    duration_minutes: int
    route: Optional[List[Dict]] = None


class MapsAdapter:
    """Adapter for Google Maps API"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.mock_mode = os.getenv("GOOGLE_MAPS_MOCK_MODE", "true").lower() == "true"
        self.base_url = "https://maps.googleapis.com/maps/api"
    
    def geocode(self, address: str) -> Optional[Location]:
        """Convert address to coordinates"""
        if self.mock_mode:
            return self._mock_geocode(address)
        else:
            return self._real_geocode(address)
    
    def reverse_geocode(self, lat: float, lng: float) -> Optional[str]:
        """Convert coordinates to address"""
        if self.mock_mode:
            return self._mock_reverse_geocode(lat, lng)
        else:
            return self._real_reverse_geocode(lat, lng)
    
    def calculate_distance(
        self, 
        origin: Location, 
        destination: Location
    ) -> DistanceResult:
        """Calculate distance and duration between two points"""
        if self.mock_mode:
            return self._mock_calculate_distance(origin, destination)
        else:
            return self._real_calculate_distance(origin, destination)
    
    def find_places_nearby(
        self, 
        location: Location, 
        radius_km: float = 10,
        place_type: str = "doctor"
    ) -> List[Dict]:
        """Find places near a location"""
        if self.mock_mode:
            return self._mock_find_places_nearby(location, radius_km)
        else:
            return self._real_find_places_nearby(location, radius_km, place_type)
    
    # Mock implementations
    def _mock_geocode(self, address: str) -> Optional[Location]:
        """Mock geocoding - returns fixed coordinates for major SA cities"""
        address_lower = address.lower()
        
        # Mock data for major South African cities
        mock_locations = {
            "johannesburg": Location(-26.2041, 28.0473),
            "cape town": Location(-33.9249, 18.4241),
            "durban": Location(-29.8587, 31.0218),
            "pretoria": Location(-25.7479, 28.2293),
            "port elizabeth": Location(-33.9608, 25.6022),
            "bloemfontein": Location(-29.0852, 26.1596),
            "east london": Location(-33.0292, 27.8546),
        }
        
        for city, location in mock_locations.items():
            if city in address_lower:
                return location
        
        # Default to Johannesburg
        return Location(-26.2041, 28.0473)
    
    def _mock_reverse_geocode(self, lat: float, lng: float) -> str:
        """Mock reverse geocoding"""
        return f"Mock Address at {lat}, {lng}"
    
    def _mock_calculate_distance(
        self, 
        origin: Location, 
        destination: Location
    ) -> DistanceResult:
        """Mock distance calculation using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2
        
        # Haversine formula
        R = 6371  # Earth radius in km
        
        lat1, lon1 = radians(origin.lat), radians(origin.lng)
        lat2, lon2 = radians(destination.lat), radians(destination.lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        distance_km = R * c
        
        # Estimate duration (60 km/h average)
        duration_minutes = int((distance_km / 60) * 60)
        
        return DistanceResult(
            distance_km=round(distance_km, 2),
            duration_minutes=duration_minutes
        )
    
    def _mock_find_places_nearby(
        self, 
        location: Location, 
        radius_km: float
    ) -> List[Dict]:
        """Mock nearby places"""
        return [
            {
                "name": "Mock Clinic 1",
                "location": {"lat": location.lat + 0.01, "lng": location.lng + 0.01},
                "distance_km": 1.5,
                "types": ["doctor", "hospital"]
            },
            {
                "name": "Mock Clinic 2",
                "location": {"lat": location.lat - 0.01, "lng": location.lng - 0.01},
                "distance_km": 2.3,
                "types": ["doctor", "clinic"]
            }
        ]
    
    # Real implementations
    def _real_geocode(self, address: str) -> Optional[Location]:
        """Real Google Maps Geocoding API"""
        try:
            url = f"{self.base_url}/geocode/json"
            params = {
                "address": address,
                "key": self.api_key,
                "region": "za"  # South Africa
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") == "OK" and data.get("results"):
                location = data["results"][0]["geometry"]["location"]
                return Location(lat=location["lat"], lng=location["lng"])
            
            return None
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None
    
    def _real_reverse_geocode(self, lat: float, lng: float) -> Optional[str]:
        """Real Google Maps Reverse Geocoding API"""
        try:
            url = f"{self.base_url}/geocode/json"
            params = {
                "latlng": f"{lat},{lng}",
                "key": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") == "OK" and data.get("results"):
                return data["results"][0]["formatted_address"]
            
            return None
        except Exception as e:
            print(f"Reverse geocoding error: {e}")
            return None
    
    def _real_calculate_distance(
        self, 
        origin: Location, 
        destination: Location
    ) -> DistanceResult:
        """Real Google Maps Distance Matrix API"""
        try:
            url = f"{self.base_url}/distancematrix/json"
            params = {
                "origins": f"{origin.lat},{origin.lng}",
                "destinations": f"{destination.lat},{destination.lng}",
                "key": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") == "OK":
                element = data["rows"][0]["elements"][0]
                distance_km = element["distance"]["value"] / 1000  # Convert to km
                duration_minutes = element["duration"]["value"] / 60  # Convert to minutes
                
                return DistanceResult(
                    distance_km=round(distance_km, 2),
                    duration_minutes=int(duration_minutes)
                )
            
            # Fallback to Haversine if API fails
            return self._mock_calculate_distance(origin, destination)
        except Exception as e:
            print(f"Distance calculation error: {e}")
            return self._mock_calculate_distance(origin, destination)
    
    def _real_find_places_nearby(
        self, 
        location: Location, 
        radius_km: float,
        place_type: str
    ) -> List[Dict]:
        """Real Google Maps Places API"""
        try:
            url = f"{self.base_url}/place/nearbysearch/json"
            params = {
                "location": f"{location.lat},{location.lng}",
                "radius": int(radius_km * 1000),  # Convert to meters
                "type": place_type,
                "key": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") == "OK":
                places = []
                for place in data.get("results", []):
                    loc = place["geometry"]["location"]
                    places.append({
                        "name": place["name"],
                        "location": {"lat": loc["lat"], "lng": loc["lng"]},
                        "types": place.get("types", []),
                        "place_id": place.get("place_id")
                    })
                return places
            
            return []
        except Exception as e:
            print(f"Places search error: {e}")
            return []


# Factory function
def get_maps_adapter() -> MapsAdapter:
    """Factory function for dependency injection"""
    return MapsAdapter()

