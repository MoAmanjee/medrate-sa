'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPinIcon, PhoneIcon, GlobeAltIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface Hospital {
  id: string;
  name: string;
  type: string;
  classification?: string;
  address: string;
  city: string;
  province: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  averageRating: number;
  totalReviews: number;
  verified: boolean;
}

interface MapComponentProps {
  hospitals: Hospital[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onHospitalClick?: (hospital: Hospital) => void;
  className?: string;
  showRadiusFilter?: boolean;
}

// Google Maps API key - Replace with your actual API key
// Get it from: https://console.cloud.google.com/google/maps-apis/credentials
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'DEMO_KEY';

// Check if we have a valid API key
const hasValidApiKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'DEMO_KEY' && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

const render = (status: Status) => {
  // Show API key setup message if no valid key
  if (!hasValidApiKey) {
    return (
      <div className="w-full h-96 rounded-lg border border-gray-200 bg-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-blue-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Google Maps Setup Required</h3>
          <p className="text-sm text-blue-800 mb-4">
            To display the interactive map with all hospital locations, you need to set up a Google Maps API key.
          </p>
          <div className="text-left text-xs text-blue-700 space-y-2">
            <p><strong>Steps to setup:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" className="underline">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable "Maps JavaScript API"</li>
              <li>Create credentials (API Key)</li>
              <li>Add the key to your .env.local file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  switch (status) {
    case Status.LOADING:
      return (
        <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="w-full h-96 rounded-lg border border-gray-200 bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-red-600 mb-2">Failed to load Google Maps</p>
            <p className="text-xs text-red-500">Please check your API key configuration</p>
          </div>
        </div>
      );
    default:
      return null;
  }
};

function GoogleMapComponent({ 
  hospitals, 
  center = { lat: -28.4793, lng: 24.6727 }, // Center of South Africa
  zoom = 6,
  onHospitalClick,
  className = '',
  showRadiusFilter = true
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [radius, setRadius] = useState<number>(50); // km
  const [centerPoint, setCenterPoint] = useState<{ lat: number; lng: number }>(center);
  const [showRadiusControls, setShowRadiusControls] = useState(false);

  // Memoize hospitals with coordinates
  const hospitalsWithCoords = useMemo(() => 
    hospitals.filter(h => h.latitude && h.longitude), 
    [hospitals]
  );

  // Filter hospitals by radius
  const hospitalsInRadius = useMemo(() => {
    if (!showRadiusFilter) return hospitalsWithCoords;
    
    return hospitalsWithCoords.filter(hospital => {
      const distance = calculateDistance(
        centerPoint.lat, 
        centerPoint.lng, 
        hospital.latitude!, 
        hospital.longitude!
      );
      return distance <= radius;
    });
  }, [hospitalsWithCoords, centerPoint, radius, showRadiusFilter]);

  // Calculate distance between two points in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Initialize Google Map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('🗺️ Initializing Google Maps...');

    // Create map
    const map = new google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // Add map event listeners
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      setSelectedHospital(null);
      
      // Update center point for radius filtering
      if (showRadiusFilter && event.latLng) {
        const newCenter = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        setCenterPoint(newCenter);
      }
    });

    setIsMapLoaded(true);
    console.log('✅ Google Maps initialized successfully');

  }, [center.lat, center.lng, zoom]);

  // Add markers when hospitals data changes
  const addMarkers = useCallback(() => {
    if (!isMapLoaded || !mapInstanceRef.current || hospitalsInRadius.length === 0) return;

    console.log(`🗺️ Adding ${hospitalsInRadius.length} hospital markers to Google Maps (${radius}km radius)`);

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Clear existing radius circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Create radius circle if filtering is enabled
    if (showRadiusFilter) {
      const circle = new google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        map: mapInstanceRef.current,
        center: centerPoint,
        radius: radius * 1000, // Convert km to meters
      });
      circleRef.current = circle;
    }

    // Create markers for each hospital
    hospitalsInRadius.forEach(hospital => {
      if (hospital.latitude && hospital.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: hospital.latitude, lng: hospital.longitude },
          map: mapInstanceRef.current,
          title: hospital.name,
          icon: getMarkerIcon(hospital.type)
        });

        // Create info window content
        const infoContent = createInfoWindowContent(hospital);

        // Add click listener
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(infoContent);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
          }
          setSelectedHospital(hospital);
          if (onHospitalClick) {
            onHospitalClick(hospital);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0 && mapInstanceRef.current) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      
      mapInstanceRef.current.fitBounds(bounds);
      console.log(`✅ Added ${markersRef.current.length} hospital markers to Google Maps`);
    }

  }, [hospitalsInRadius, isMapLoaded, onHospitalClick, showRadiusFilter, centerPoint, radius]);

  // Get marker icon based on hospital type
  const getMarkerIcon = (type: string): string => {
    // Use custom colored markers for better visibility
    const colors = {
      'PUBLIC': '#3b82f6',    // Blue
      'PRIVATE': '#10b981',    // Green  
      'CLINIC': '#f59e0b',    // Orange/Yellow
      'default': '#ef4444'    // Red
    };
    
    const color = colors[type as keyof typeof colors] || colors.default;
    
    // Create a custom SVG marker
    const svgMarker = {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.5,
      anchor: new google.maps.Point(12, 24)
    };
    
    return svgMarker as any;
  };

  // Create info window content
  const createInfoWindowContent = (hospital: Hospital): string => {
    return `
      <div class="p-3 min-w-[250px] max-w-[300px]">
        <h3 class="font-semibold text-gray-900 mb-2 text-sm">${hospital.name}</h3>
        <div class="space-y-1 text-xs text-gray-600">
          <div class="flex items-start">
            <svg class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>${hospital.address}, ${hospital.city}</span>
          </div>
          ${hospital.phone ? `
            <div class="flex items-center">
              <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span>${hospital.phone}</span>
            </div>
          ` : ''}
          <div class="mt-2 flex flex-wrap gap-1">
            <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${
              hospital.type === 'PUBLIC' ? 'bg-blue-100 text-blue-800' :
              hospital.type === 'PRIVATE' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }">
              ${hospital.type === 'PUBLIC' ? 'Public' : 
                hospital.type === 'PRIVATE' ? 'Private' : 'Clinic'}
            </span>
            ${hospital.verified ? '<span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Verified</span>' : ''}
          </div>
                    <div class="mt-2">
                      <a href="/hospital/${hospital.id}" class="text-blue-600 hover:text-blue-800 text-xs font-medium" target="_blank">
                        View Details →
                      </a>
                    </div>
        </div>
      </div>
    `;
  };

  // Initialize map when component mounts
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Add markers when data changes
  useEffect(() => {
    if (isMapLoaded) {
      addMarkers();
    }
  }, [addMarkers, isMapLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Radius Controls */}
      {showRadiusFilter && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Radius Filter</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRadiusControls(!showRadiusControls)}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </Button>
          </div>
          
          {showRadiusControls && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search Radius: {radius} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5km</span>
                  <span>200km</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600">
                <p><strong>Hospitals found:</strong> {hospitalsInRadius.length}</p>
                <p><strong>Total hospitals:</strong> {hospitalsWithCoords.length}</p>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>💡 Click anywhere on the map to set the search center</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200"
        style={{ minHeight: '400px' }}
      />
      
      {/* Selected Hospital Info */}
      {selectedHospital && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedHospital.name}
                  </h3>
                  <Badge variant={
                    selectedHospital.type === 'PUBLIC' ? 'info' : 
                    selectedHospital.type === 'PRIVATE' ? 'secondary' : 
                    'warning'
                  }>
                    {selectedHospital.type === 'PUBLIC' ? 'Public' : 
                     selectedHospital.type === 'PRIVATE' ? 'Private' : 
                     'Clinic'}
                  </Badge>
                  {selectedHospital.verified && (
                    <Badge variant="success">Verified</Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span>{selectedHospital.address}, {selectedHospital.city}, {selectedHospital.province}</span>
                  </div>
                  
                  {selectedHospital.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      <span>{selectedHospital.phone}</span>
                    </div>
                  )}
                  
                  {selectedHospital.website && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-4 h-4 mr-2" />
                      <a 
                        href={selectedHospital.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={() => window.open(`/hospital/${selectedHospital.id}`, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
                  >
                    🏥 View Full Details
                  </Button>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedHospital(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Legend */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Hospital Types</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
            <span className="font-medium text-gray-700">Public Hospitals</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
            <span className="font-medium text-gray-700">Private Hospitals</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
            <span className="font-medium text-gray-700">Clinics & Practices</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex justify-between">
            <span><strong>Showing:</strong> {hospitalsInRadius.length} hospitals</span>
            <span><strong>Total:</strong> {hospitalsWithCoords.length} hospitals</span>
          </div>
          <p className="mt-1">💡 Click markers for details • Click map to set search center</p>
        </div>
      </div>
    </div>
  );
}

export default function MapComponent(props: MapComponentProps) {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render}>
      <GoogleMapComponent {...props} />
    </Wrapper>
  );
}
