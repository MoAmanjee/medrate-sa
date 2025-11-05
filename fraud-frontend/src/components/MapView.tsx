import React, { useEffect, useRef, useState } from 'react';
import { Doctor } from '../types';

interface MapViewProps {
  doctors: Doctor[];
}

const MapView: React.FC<MapViewProps> = ({ doctors }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [doctors, isLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLocation);
          map.setZoom(13);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    doctors.forEach((doctor) => {
      if (doctor.location) {
        const marker = new window.google.maps.Marker({
          position: {
            lat: doctor.location.lat,
            lng: doctor.location.lng,
          },
          map: mapInstanceRef.current,
          title: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-4">
              <h3 class="font-semibold text-lg">Dr. ${doctor.firstName} ${doctor.lastName}</h3>
              <p class="text-primary-600 font-medium">${doctor.specialty}</p>
              <p class="text-gray-600 text-sm">${doctor.location.address}</p>
              <div class="mt-2">
                <span class="text-yellow-500">★</span>
                <span class="text-sm">${doctor.rating?.toFixed(1) || '0.0'}</span>
                <span class="text-sm text-gray-600 ml-2">$${doctor.fee || 0}</span>
              </div>
              <a 
                href="/doctor/${doctor.id}" 
                class="inline-block mt-2 bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
              >
                View Profile
              </a>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      }
    });
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Doctor Locations ({doctors.length})
        </h3>
        <p className="text-gray-600 text-sm">
          Click on markers to view doctor details and book appointments.
        </p>
      </div>
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg shadow-md"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default MapView;
