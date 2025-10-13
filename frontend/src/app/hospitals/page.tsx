'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, VerificationBadge, RatingBadge } from '@/components/ui/Badge';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  PhoneIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface Hospital {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  type: string;
  classification?: string;
  averageRating: number;
  totalReviews: number;
  verified: boolean;
  autoPopulated: boolean;
  latitude?: number;
  longitude?: number;
  doctors?: Array<{
    id: string;
    doctor: {
      id: string;
      user: {
        firstName: string;
        lastName: string;
        verificationStatus: string;
      };
      specialization: string;
      experience: number;
      averageRating: number;
      totalReviews: number;
      consultationFee: number;
      isAvailable: boolean;
    };
  }>;
}

export default function HospitalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [province, setProvince] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const provinces = [
    'Gauteng',
    'Western Cape',
    'KwaZulu-Natal',
    'Eastern Cape',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West'
  ];

  // Fetch hospitals from API
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5001/api/hospitals?limit=2000');
        
        if (!response.ok) {
          throw new Error('Failed to fetch hospitals');
        }
        
        const data = await response.json();
        if (data.success) {
          setHospitals(data.data.hospitals);
        } else {
          throw new Error(data.message || 'Failed to fetch hospitals');
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setHospitals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince = !province || hospital.province === province;
    const matchesType = !hospitalType || 
                       (hospitalType === 'public' && hospital.type === 'PUBLIC') ||
                       (hospitalType === 'private' && hospital.type === 'PRIVATE') ||
                       (hospitalType === 'clinic' && hospital.type === 'CLINIC');
    
    return matchesSearch && matchesProvince && matchesType;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Modern Hero Header */}
        <div className="relative overflow-hidden gradient-hero text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <span className="text-4xl">🏥</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Hospitals in South Africa
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                Discover <span className="font-bold text-yellow-300">{hospitals.length}</span> hospitals, clinics, and healthcare facilities across South Africa. 
                Find the care you need with our comprehensive directory.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-sm font-medium">📍 All Provinces</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-sm font-medium">🏥 Verified Facilities</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-sm font-medium">⭐ Patient Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Search Section */}
        <div className="relative -mt-16 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 Find Your Perfect Hospital</h2>
                <p className="text-gray-600">Search by location, type, or specialty to find the care you need</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    🔍 Search Hospitals
                  </label>
                  <div className="relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, city, or province..."
                      className="w-full bg-gray-50 border-2 border-gray-200 focus:border-indigo-500 focus:bg-white transition-all duration-300 pl-4 pr-4 py-3 rounded-xl"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    📍 Province
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-all duration-300"
                  >
                    <option value="">All Provinces</option>
                    {provinces.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    🏥 Hospital Type
                  </label>
                  <select
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-all duration-300"
                  >
                    <option value="">All Types</option>
                    <option value="PUBLIC">Public Hospitals</option>
                    <option value="PRIVATE">Private Hospitals</option>
                    <option value="CLINIC">Clinics & Practices</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospitals Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="loading-spinner-discovery mb-4"></div>
              <p className="text-lg text-gray-600 font-medium">Loading hospitals...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    📊 {filteredHospitals.length} Hospitals Found
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Showing results for your search criteria
                  </p>
                </div>
                <div className="flex items-center space-x-4 animate-slide-in-right">
                  <Button variant="outline" size="sm" className="bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 px-6 py-2 rounded-xl">
                    ⭐ Sort by Rating
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 px-6 py-2 rounded-xl">
                    📍 Sort by Distance
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHospitals.map((hospital, index) => (
                  <Card key={hospital.id} className="card-discovery group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardContent className="p-8">
                      <div className="text-center">
                        {/* Modern Hospital Icon */}
                        <div className="relative mb-6">
                          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                            hospital.type === 'PUBLIC' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            hospital.type === 'PRIVATE' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            'bg-gradient-to-br from-orange-500 to-orange-600'
                          }`}>
                            <BuildingOfficeIcon className="w-10 h-10 text-white" />
                          </div>
                          <div className={`absolute inset-0 w-20 h-20 rounded-2xl mx-auto blur-xl group-hover:blur-2xl transition-all duration-300 ${
                            hospital.type === 'PUBLIC' ? 'bg-blue-500/20' :
                            hospital.type === 'PRIVATE' ? 'bg-green-500/20' :
                            'bg-orange-500/20'
                          }`}></div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 text-center">
                              {hospital.name}
                            </h3>
                            {hospital.verified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Verified
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-center space-x-1 text-sm text-gray-700 mb-3">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="font-medium">{hospital.city}, {hospital.province}</span>
                          </div>
                          
                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <RatingBadge 
                              rating={hospital.averageRating} 
                              totalReviews={hospital.totalReviews}
                              size="sm"
                            />
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              hospital.type === 'PUBLIC' ? 'bg-blue-100 text-blue-800' :
                              hospital.type === 'PRIVATE' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {hospital.type === 'PUBLIC' ? '🏥 Public' :
                               hospital.type === 'PRIVATE' ? '🏢 Private' :
                               '🏪 Clinic'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Hospital Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-center">
                              <div className="text-gray-600 font-medium">👨‍⚕️ Doctors</div>
                              <div className="text-lg font-bold text-gray-900">
                                {hospital.doctors?.length || 0}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600 font-medium">⭐ Rating</div>
                              <div className="text-lg font-bold text-gray-900">
                                {hospital.averageRating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                          
                          {hospital.phone && (
                            <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                              <div className="text-gray-600 text-sm font-medium mb-1">📞 Contact</div>
                              <div className="text-gray-900 font-semibold">
                                {hospital.phone}
                              </div>
                            </div>
                          )}
                        </div>
                        
                            <div className="space-y-3">
                              <button 
                                className="btn-discovery w-full py-3 text-base font-semibold" 
                                onClick={() => window.open(`/hospital/${hospital.id}`, '_blank')}
                              >
                                🏥 View Hospital Details
                              </button>
                              <button 
                                className="btn-discovery-outline w-full py-3 text-base font-semibold"
                                onClick={() => window.location.href = `/hospital/${hospital.id}?tab=doctors`}
                              >
                                👨‍⚕️ View Doctors
                              </button>
                              {hospital.website && (
                                <button 
                                  className="btn-discovery-secondary w-full py-3 text-base font-semibold"
                                  onClick={() => window.open(hospital.website, '_blank')}
                                >
                                  🌐 Visit Website
                                </button>
                              )}
                            </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

              {filteredHospitals.length === 0 && (
                <div className="text-center py-20 animate-fade-in">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No hospitals found</h3>
                  <p className="text-gray-600 text-lg mb-6">Try adjusting your search criteria or browse all hospitals.</p>
                  <button 
                    className="btn-discovery px-6 py-3"
                    onClick={() => {
                      setSearchQuery('');
                      setProvince('');
                      setHospitalType('');
                    }}
                  >
                    🔄 Clear Filters
                  </button>
                </div>
              )}
        </div>
      </div>
    </Layout>
  );
}
