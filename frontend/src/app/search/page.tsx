'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, VerificationBadge, RatingBadge } from '@/components/ui/Badge';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  type: 'doctor' | 'hospital';
  name: string;
  specialization?: string;
  location: {
    city: string;
    province: string;
  };
  rating: number;
  totalReviews: number;
  verificationStatus: string;
  distance?: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'doctor' | 'hospital'>('all');
  const [radius, setRadius] = useState(50);
  const [specialization, setSpecialization] = useState('');
  const [province, setProvince] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - Updated with comprehensive hospital data
  const mockResults: SearchResult[] = [
    // Doctors
    {
      id: '1',
      type: 'doctor',
      name: 'Dr. John Smith',
      specialization: 'General Practice',
      location: { city: 'Johannesburg', province: 'Gauteng' },
      rating: 4.8,
      totalReviews: 25,
      verificationStatus: 'APPROVED',
      distance: 2.5
    },
    {
      id: '3',
      type: 'doctor',
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      location: { city: 'Cape Town', province: 'Western Cape' },
      rating: 4.9,
      totalReviews: 32,
      verificationStatus: 'APPROVED',
      distance: 8.1
    },
    {
      id: '4',
      type: 'doctor',
      name: 'Dr. Mike Wilson',
      specialization: 'Dermatology',
      location: { city: 'Durban', province: 'KwaZulu-Natal' },
      rating: 4.7,
      totalReviews: 15,
      verificationStatus: 'PENDING',
      distance: 8.5
    },
    
    // Public Hospitals
    {
      id: 'h1',
      type: 'hospital',
      name: 'Charlotte Maxeke Johannesburg Academic Hospital',
      specialization: 'Academic Hospital',
      location: { city: 'Johannesburg', province: 'Gauteng' },
      rating: 4.2,
      totalReviews: 45,
      verificationStatus: 'APPROVED',
      distance: 3.1
    },
    {
      id: 'h2',
      type: 'hospital',
      name: 'Chris Hani Baragwanath Hospital',
      specialization: 'Academic Hospital',
      location: { city: 'Soweto', province: 'Gauteng' },
      rating: 4.0,
      totalReviews: 38,
      verificationStatus: 'APPROVED',
      distance: 4.2
    },
    {
      id: 'h3',
      type: 'hospital',
      name: 'Groote Schuur Hospital',
      specialization: 'Academic Hospital',
      location: { city: 'Cape Town', province: 'Western Cape' },
      rating: 4.3,
      totalReviews: 52,
      verificationStatus: 'APPROVED',
      distance: 6.8
    },
    
    // Private Hospitals
    {
      id: 'h4',
      type: 'hospital',
      name: 'Netcare Milpark Hospital',
      specialization: 'Private Multi-Specialty Hospital',
      location: { city: 'Johannesburg', province: 'Gauteng' },
      rating: 4.6,
      totalReviews: 28,
      verificationStatus: 'APPROVED',
      distance: 1.8
    },
    {
      id: 'h5',
      type: 'hospital',
      name: 'Life Healthcare Sandton',
      specialization: 'Private Multi-Specialty Hospital',
      location: { city: 'Sandton', province: 'Gauteng' },
      rating: 4.7,
      totalReviews: 35,
      verificationStatus: 'APPROVED',
      distance: 2.1
    },
    {
      id: 'h6',
      type: 'hospital',
      name: 'Netcare Christiaan Barnard Memorial Hospital',
      specialization: 'Private Multi-Specialty Hospital',
      location: { city: 'Cape Town', province: 'Western Cape' },
      rating: 4.8,
      totalReviews: 31,
      verificationStatus: 'APPROVED',
      distance: 5.5
    },
    
    // Medical Clinics
    {
      id: 'h7',
      type: 'hospital',
      name: 'Sandton Medical Centre',
      specialization: 'Private Medical Clinic',
      location: { city: 'Sandton', province: 'Gauteng' },
      rating: 4.3,
      totalReviews: 18,
      verificationStatus: 'APPROVED',
      distance: 2.3
    },
    {
      id: 'h8',
      type: 'hospital',
      name: 'Cape Town Medical Centre',
      specialization: 'Private Medical Clinic',
      location: { city: 'Cape Town', province: 'Western Cape' },
      rating: 4.2,
      totalReviews: 15,
      verificationStatus: 'APPROVED',
      distance: 6.2
    }
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Healthcare Providers</h1>
            
            {/* Search Form */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctors, hospitals, or specializations..."
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All</option>
                    <option value="doctor">Doctors</option>
                    <option value="hospital">Hospitals</option>
                  </select>
                  <Button onClick={handleSearch} disabled={isLoading}>
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Advanced Filters:</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Specialization Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Specializations</option>
                      <option value="General Practice">General Practice</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="Urology">Urology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="ENT">ENT</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Anesthesiology">Anesthesiology</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                    </select>
                  </div>

                  {/* Province Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Provinces</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="North West">North West</option>
                    </select>
                  </div>

                  {/* Hospital Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type</label>
                    <select
                      value={hospitalType}
                      onChange={(e) => setHospitalType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Types</option>
                      <option value="PUBLIC">Public Hospitals</option>
                      <option value="PRIVATE">Private Hospitals</option>
                      <option value="CLINIC">Medical Clinics</option>
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>

                  {/* Radius Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="400"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{radius}km</span>
                    </div>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="verified" 
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <label htmlFor="verified" className="text-sm text-gray-600">Verified professionals only</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="available" 
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <label htmlFor="available" className="text-sm text-gray-600">Available for booking</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {results.length} results found
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Map View</Button>
                  <Button variant="outline" size="sm">List View</Button>
                </div>
              </div>

              <div className="grid gap-4">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            {result.type === 'doctor' ? (
                              <UserIcon className="w-6 h-6 text-primary-500" />
                            ) : (
                              <BuildingOfficeIcon className="w-6 h-6 text-primary-500" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {result.name}
                              </h3>
                              <VerificationBadge 
                                status={result.verificationStatus as any} 
                                role={result.type === 'doctor' ? 'DOCTOR' : 'HOSPITAL'}
                              />
                            </div>
                            
                            {result.specialization && (
                              <p className="text-primary-600 font-medium mb-1">
                                {result.specialization}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span>{result.location.city}, {result.location.province}</span>
                              </div>
                              {result.distance && (
                                <span>{result.distance}km away</span>
                              )}
                            </div>
                            
                            <div className="mt-2">
                              <RatingBadge 
                                rating={result.rating} 
                                totalReviews={result.totalReviews}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" asChild>
                            <a href={`/${result.type}/${result.id}`}>
                              View Profile
                            </a>
                          </Button>
                          {result.type === 'doctor' && (
                            <Button variant="outline" size="sm">
                              Book Appointment
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-700">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
