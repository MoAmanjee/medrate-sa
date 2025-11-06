'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, VerificationBadge, RatingBadge } from '@/components/ui/Badge';
import MapComponent from '@/components/map/GoogleMapComponent';
import PerformanceMonitor from '@/components/map/PerformanceMonitor';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  PhoneIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
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

export default function HospitalsMapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [province, setProvince] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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
        console.log('🌐 Fetching all hospitals from API...');
        
        // Fetch all hospitals with a high limit
        const response = await fetch('http://localhost:5001/api/hospitals?limit=2000');
        
        if (!response.ok) {
          throw new Error('Failed to fetch hospitals');
        }
        
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Fetched ${data.data.hospitals.length} hospitals from API`);
          setHospitals(data.data.hospitals);
        } else {
          throw new Error(data.message || 'Failed to fetch hospitals');
        }
      } catch (error) {
        console.error('❌ Error fetching hospitals:', error);
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

  const hospitalsWithCoordinates = filteredHospitals.filter(h => h.latitude && h.longitude);

  // Pagination logic
  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHospitals = filteredHospitals.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, province, hospitalType]);

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Healthcare Facilities Map
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Discover hospitals, clinics, and healthcare facilities across South Africa
                </p>
              </div>
              
              <div className="mt-4 lg:mt-0 lg:ml-4">
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    onClick={() => setViewMode('map')}
                    size="sm"
                  >
                    Map View
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    size="sm"
                  >
                    List View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search hospitals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Provinces</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              
              <select
                value={hospitalType}
                onChange={(e) => setHospitalType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="public">Public Hospitals</option>
                <option value="private">Private Hospitals</option>
                <option value="clinic">Clinics</option>
              </select>
              
              <div className="flex items-center text-sm text-gray-600">
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                {filteredHospitals.length} facilities found
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {viewMode === 'map' ? (
                <div className="space-y-6">
                  {/* Map Component */}
              <MapComponent
                hospitals={hospitalsWithCoordinates}
                onHospitalClick={handleHospitalClick}
                className="w-full h-[600px]"
                showRadiusFilter={true}
              />
                  
                  {/* Performance Monitor */}
                  <PerformanceMonitor 
                    hospitalCount={hospitalsWithCoordinates.length}
                    className="text-center"
                  />
                  
                  {/* Debug Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">🔍 Debug Information</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div>Total hospitals fetched: {hospitals.length}</div>
                      <div>Hospitals with coordinates: {hospitalsWithCoordinates.length}</div>
                      <div>Filtered hospitals: {filteredHospitals.length}</div>
                      <div>Map markers should show: {hospitalsWithCoordinates.length} pins</div>
                    </div>
                  </div>
                  
                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {hospitalsWithCoordinates.length}
                        </div>
                        <div className="text-sm text-gray-600">With Coordinates</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {filteredHospitals.filter(h => h.type === 'PUBLIC').length}
                        </div>
                        <div className="text-sm text-gray-600">Public Hospitals</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {filteredHospitals.filter(h => h.type === 'PRIVATE').length}
                        </div>
                        <div className="text-sm text-gray-600">Private Hospitals</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {filteredHospitals.filter(h => h.type === 'CLINIC').length}
                        </div>
                        <div className="text-sm text-gray-600">Clinics</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="space-y-6">
                  {/* Results count */}
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredHospitals.length)} of {filteredHospitals.length} hospitals
                  </div>
                  
                  {/* Hospital cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedHospitals.map((hospital) => (
                    <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BuildingOfficeIcon className="w-10 h-10 text-accent-500" />
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {hospital.name}
                              </h3>
                              <VerificationBadge 
                                status={hospital.verified ? 'APPROVED' : 'NOT_VERIFIED'} 
                                role="HOSPITAL"
                              />
                            </div>
                            
                            <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-2">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{hospital.city}, {hospital.province}</span>
                            </div>
                            
                            <RatingBadge 
                              rating={hospital.averageRating} 
                              totalReviews={hospital.totalReviews}
                              size="sm"
                            />
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Type:</span>
                              <Badge variant={
                                hospital.type === 'PUBLIC' ? 'info' : 
                                hospital.type === 'PRIVATE' ? 'secondary' : 
                                'warning'
                              }>
                                {hospital.type === 'PUBLIC' ? 'Public' : 
                                 hospital.type === 'PRIVATE' ? 'Private' : 
                                 'Clinic'}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Doctors:</span>
                              <span className="font-semibold text-gray-900">
                                {hospital.doctors?.length || 0}
                              </span>
                            </div>
                            
                            {hospital.phone && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-semibold text-gray-900">
                                  {hospital.phone}
                                </span>
                              </div>
                            )}
                            
                            {hospital.latitude && hospital.longitude && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-semibold text-green-600">
                                  ✓ Mapped
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Button className="w-full" onClick={() => window.location.href = `/hospital/${hospital.id}`}>
                              View Hospital
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => window.location.href = `/hospital/${hospital.id}?tab=doctors`}>
                              <UserGroupIcon className="w-4 h-4 mr-2" />
                              View Doctors
                            </Button>
                            {hospital.website && (
                              <Button variant="ghost" className="w-full" onClick={() => window.open(hospital.website, '_blank')}>
                                <GlobeAltIcon className="w-4 h-4 mr-2" />
                                Visit Website
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
                      <div className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {filteredHospitals.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hospitals found</h3>
              <p className="text-gray-700">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

