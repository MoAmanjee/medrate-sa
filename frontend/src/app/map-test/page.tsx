'use client';

import React, { useState, useEffect } from 'react';
import MapComponent from '@/components/map/GoogleMapComponent';

interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
}

export default function MapTestPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🌐 Fetching all hospitals for map test...');
        const response = await fetch('http://localhost:5001/api/hospitals?limit=2000');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Fetched ${data.data.hospitals.length} hospitals`);
          console.log(`📍 Hospitals with coordinates: ${data.data.hospitals.filter((h: Hospital) => h.latitude && h.longitude).length}`);
          setHospitals(data.data.hospitals);
        } else {
          throw new Error(data.message || 'API returned error');
        }
      } catch (error) {
        console.error('❌ Error fetching hospitals:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const hospitalsWithCoords = hospitals.filter(h => h.latitude && h.longitude);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Hospitals...</h2>
          <p className="text-gray-600">Fetching all hospital data from API</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hospitals</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🗺️ Hospital Map Test
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{hospitals.length}</div>
              <div className="text-sm text-gray-600">Total Hospitals</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{hospitalsWithCoords.length}</div>
              <div className="text-sm text-gray-600">With Coordinates</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {hospitals.filter(h => h.type === 'PUBLIC').length}
              </div>
              <div className="text-sm text-gray-600">Public Hospitals</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {hospitals.filter(h => h.type === 'PRIVATE').length}
              </div>
              <div className="text-sm text-gray-600">Private Hospitals</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Interactive Map with All Hospitals
          </h2>
          <MapComponent 
            hospitals={hospitalsWithCoords}
            className="h-[600px]"
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Hospitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitalsWithCoords.slice(0, 6).map((hospital) => (
              <div key={hospital.id} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900">{hospital.name}</h4>
                <p className="text-sm text-gray-600">{hospital.city}, {hospital.province}</p>
                <p className="text-xs text-gray-500">
                  📍 {hospital.latitude?.toFixed(4)}, {hospital.longitude?.toFixed(4)}
                </p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  hospital.type === 'PUBLIC' ? 'bg-blue-100 text-blue-800' :
                  hospital.type === 'PRIVATE' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {hospital.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
