'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPinIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import '@/styles/map.css';

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
}

export default function MapComponent({ 
  hospitals, 
  center = { lat: -28.4793, lng: 24.6727 }, // Center of South Africa
  zoom = 6,
  onHospitalClick,
  className = ''
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markerClusterRef = useRef<any>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Memoize hospitals with coordinates to prevent unnecessary re-renders
  const hospitalsWithCoords = useMemo(() => 
    hospitals.filter(h => h.latitude && h.longitude), 
    [hospitals]
  );

  // Initialize map only once
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || isInitializing || mapInstanceRef.current) return;

    setIsInitializing(true);
    setMapError(null);

    try {
      // Dynamically import Leaflet
      const L = await import('leaflet');
      
      // Fix for default markers in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map
      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true // Use canvas for better performance
      }).setView([center.lat, center.lng], zoom);

      mapInstanceRef.current = map;

      // Add tile layer with error handling
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      });

      tileLayer.addTo(map);

      // Add error handling for tile loading
      tileLayer.on('tileerror', () => {
        console.warn('Tile loading error - using fallback');
      });

      setIsMapLoaded(true);
      setIsInitializing(false);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to load map. Please refresh the page.');
      setIsInitializing(false);
    }
  }, [center.lat, center.lng, zoom, isInitializing]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
        markerClusterRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, [initializeMap]);

  // Add markers with clustering for performance
  const addMarkers = useCallback(async () => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    console.log(`🗺️ Adding markers for ${hospitalsWithCoords.length} hospitals with coordinates`);
    
    if (hospitalsWithCoords.length === 0) {
      console.warn('⚠️ No hospitals with coordinates found');
      return;
    }

    try {
      const L = await import('leaflet');
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Clear existing cluster
      if (markerClusterRef.current) {
        mapInstanceRef.current.removeLayer(markerClusterRef.current);
        markerClusterRef.current = null;
      }

      // Import marker clustering
      const { MarkerClusterGroup } = await import('leaflet.markercluster');
      
      // Create marker cluster group for better performance
      const markerClusterGroup = new MarkerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 15,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let className = 'marker-cluster marker-cluster-';
          
          if (count < 10) {
            className += 'small';
          } else if (count < 100) {
            className += 'medium';
          } else {
            className += 'large';
          }
          
          return L.divIcon({
            html: '<div><span>' + count + '</span></div>',
            className: className,
            iconSize: L.point(40, 40)
          });
        }
      });

      // Add markers to cluster group
      hospitalsWithCoords.forEach(hospital => {
        if (hospital.latitude && hospital.longitude) {
          const marker = L.marker([hospital.latitude, hospital.longitude], {
            title: hospital.name
          });

          // Create popup content
          const popupContent = `
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
                  <a href="/hospital/${hospital.id}" class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                    View Details →
                  </a>
                </div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
          });

          // Add click handler
          marker.on('click', () => {
            setSelectedHospital(hospital);
            if (onHospitalClick) {
              onHospitalClick(hospital);
            }
          });

          markerClusterGroup.addLayer(marker);
          markersRef.current.push(marker);
        }
      });

      // Add cluster group to map
      mapInstanceRef.current.addLayer(markerClusterGroup);
      markerClusterRef.current = markerClusterGroup;

      console.log(`✅ Successfully added ${markersRef.current.length} hospital markers to map`);

      // Fit map to show all markers with padding
      if (markersRef.current.length > 0) {
        const bounds = markerClusterGroup.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
          console.log('🗺️ Map bounds adjusted to show all hospitals');
        }
      }

    } catch (error) {
      console.error('Error adding markers:', error);
      setMapError('Failed to load hospital markers');
    }
  }, [hospitalsWithCoords, isMapLoaded, onHospitalClick]);

  // Add markers when data changes
  useEffect(() => {
    if (isMapLoaded) {
      addMarkers();
    }
  }, [addMarkers, isMapLoaded]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (mapError) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2">{mapError}</p>
            <button 
              onClick={() => {
                setMapError(null);
                setIsMapLoaded(false);
                initializeMap();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200"
        style={{ minHeight: '400px' }}
      />
      
      {/* Loading overlay */}
      {(!isMapLoaded || isInitializing) && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
            <p className="text-xs text-gray-500 mt-1">
              {hospitalsWithCoords.length} hospitals found
            </p>
          </div>
        </div>
      )}

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
                  <a 
                    href={`/hospital/${selectedHospital.id}`}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    View Full Details
                  </a>
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
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Public Hospitals</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Private Hospitals</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Clinics & Practices</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Showing {hospitalsWithCoords.length} hospitals • Click markers for details
        </div>
      </div>
    </div>
  );
}