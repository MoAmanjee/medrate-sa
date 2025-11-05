'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, VerificationBadge, RatingBadge } from '@/components/ui/Badge';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  StarIcon,
  ShareIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  LinkedinIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from 'lucide-react';

interface HospitalProfile {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
    verificationStatus: string;
  };
  name: string;
  bio?: string;
  logo?: string;
  classification?: string;
  type: string; // PUBLIC, PRIVATE, CLINIC
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  departments?: string;
  services?: string;
  products?: string;
  socialLinks?: string;
  isPublic: boolean;
  verified: boolean;
  autoPopulated: boolean;
  dataSource?: string;
  averageRating: number;
  totalReviews: number;
  doctors: Array<{
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
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      verificationStatus: string;
    };
  }>;
}

export default function HospitalProfilePage() {
  const params = useParams();
  const hospitalId = params.id as string;
  
  const [hospital, setHospital] = useState<HospitalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'reviews'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  // Fetch hospital data from API
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5001/api/hospitals/${hospitalId}`);
        
        if (!response.ok) {
          throw new Error('Hospital not found');
        }
        
        const data = await response.json();
        if (data.success) {
          setHospital(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch hospital');
        }
      } catch (error) {
        console.error('Error fetching hospital:', error);
        setHospital(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (hospitalId) {
      fetchHospital();
    }
  }, [hospitalId]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const parseJsonField = (field?: string) => {
    if (!field) return [];
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!hospital) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hospital not found</h3>
            <p className="text-gray-600">The hospital you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const departments = parseJsonField(hospital.departments);
  const services = parseJsonField(hospital.services);
  const products = parseJsonField(hospital.products);
  const socialLinks = parseJsonField(hospital.socialLinks);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-accent-50 to-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Hospital Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-accent-100 rounded-full flex items-center justify-center overflow-hidden">
                  {hospital.logo ? (
                    <img
                      src={hospital.logo}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BuildingOfficeIcon className="w-16 h-16 text-accent-500" />
                  )}
                </div>
              </div>

              {/* Hospital Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {hospital.name}
                  </h1>
                  <VerificationBadge 
                    status={hospital.verified ? 'APPROVED' : 'NOT_VERIFIED'} 
                    role="HOSPITAL"
                  />
                  {hospital.autoPopulated && (
                    <Badge variant="info" className="text-xs">
                      Auto-verified
                    </Badge>
                  )}
                </div>

                {hospital.classification && (
                  <p className="text-xl text-accent-600 font-medium mb-2">
                    {hospital.classification}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{hospital.city}, {hospital.province}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{hospital.doctors.length} doctors</span>
                  </div>
                  <Badge variant={
                    hospital.type === 'PUBLIC' ? 'info' : 
                    hospital.type === 'PRIVATE' ? 'secondary' : 
                    'warning'
                  }>
                    {hospital.type === 'PUBLIC' ? 'Public Hospital' : 
                     hospital.type === 'PRIVATE' ? 'Private Hospital' : 
                     'Medical Clinic'}
                  </Badge>
                </div>

                <RatingBadge 
                  rating={hospital.averageRating} 
                  totalReviews={hospital.totalReviews}
                  size="lg"
                />

                {hospital.bio && (
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {hospital.bio}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Button size="lg" className="w-full">
                  <CalendarDaysIcon className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <ShareIcon className="w-5 h-5 mr-2" />
                  Share Profile
                </Button>
                <Button variant="ghost" size="lg" className="w-full">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Save to Favorites
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'doctors', label: 'Doctors' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <>
                  {/* Departments */}
                  {departments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center">
                            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                            Departments
                          </span>
                          <button
                            onClick={() => toggleSection('departments')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedSections.has('departments') ? (
                              <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5" />
                            )}
                          </button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.has('departments') && (
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {departments.map((department: string, index: number) => (
                              <div key={index} className="flex items-center text-gray-600">
                                <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                                {department}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Services */}
                  {services.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Services Offered
                          </span>
                          <button
                            onClick={() => toggleSection('services')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedSections.has('services') ? (
                              <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5" />
                            )}
                          </button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.has('services') && (
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {services.map((service: string, index: number) => (
                              <div key={index} className="flex items-center text-gray-600">
                                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                                {service}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Products */}
                  {products.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center">
                            <StarIcon className="w-5 h-5 mr-2" />
                            Products & Programs
                          </span>
                          <button
                            onClick={() => toggleSection('products')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedSections.has('products') ? (
                              <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5" />
                            )}
                          </button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.has('products') && (
                        <CardContent>
                          <div className="space-y-3">
                            {products.map((product: string, index: number) => (
                              <div key={index} className="flex items-center text-gray-600">
                                <div className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></div>
                                {product}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'doctors' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserGroupIcon className="w-5 h-5 mr-2" />
                      Doctors at {hospital.name} ({hospital.doctors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hospital.doctors.map((doctorAffiliation) => (
                        <div key={doctorAffiliation.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <UserGroupIcon className="w-6 h-6 text-primary-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    Dr. {doctorAffiliation.doctor.user.firstName} {doctorAffiliation.doctor.user.lastName}
                                  </h4>
                                  <VerificationBadge 
                                    status={doctorAffiliation.doctor.user.verificationStatus as any} 
                                    role="DOCTOR"
                                  />
                                </div>
                                <p className="text-primary-600 font-medium mb-2">
                                  {doctorAffiliation.doctor.specialization}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <span>{doctorAffiliation.doctor.experience} years experience</span>
                                  <span>R{doctorAffiliation.doctor.consultationFee} consultation</span>
                                </div>
                                <RatingBadge 
                                  rating={doctorAffiliation.doctor.averageRating} 
                                  totalReviews={doctorAffiliation.doctor.totalReviews}
                                  size="sm"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button size="sm">
                                View Profile
                              </Button>
                              {doctorAffiliation.doctor.isAvailable && (
                                <Button variant="outline" size="sm">
                                  <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                  Book Appointment
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'reviews' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <StarIcon className="w-5 h-5 mr-2" />
                      Patient Reviews ({hospital.totalReviews})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {hospital.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserGroupIcon className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">
                                    {review.user.firstName} {review.user.lastName}
                                  </h4>
                                  <VerificationBadge 
                                    status={review.user.verificationStatus as any} 
                                    role="PATIENT"
                                  />
                                </div>
                                <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{hospital.address}</p>
                      <p className="text-sm text-gray-600">
                        {hospital.city}, {hospital.province} {hospital.postalCode}
                      </p>
                    </div>
                  </div>

                  {hospital.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${hospital.phone}`} className="text-sm text-gray-600 hover:text-primary-600">
                        {hospital.phone}
                      </a>
                    </div>
                  )}

                  {hospital.email && (
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${hospital.email}`} className="text-sm text-gray-600 hover:text-primary-600">
                        {hospital.email}
                      </a>
                    </div>
                  )}

                  {hospital.website && (
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                      <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary-600">
                        Visit Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              {socialLinks && Object.keys(socialLinks).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Follow {hospital.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-3">
                      {socialLinks.linkedin && (
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                          <LinkedinIcon className="w-6 h-6" />
                        </a>
                      )}
                      {socialLinks.facebook && (
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                          <FacebookIcon className="w-6 h-6" />
                        </a>
                      )}
                      {socialLinks.instagram && (
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600">
                          <InstagramIcon className="w-6 h-6" />
                        </a>
                      )}
                      {socialLinks.youtube && (
                        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600">
                          <YoutubeIcon className="w-6 h-6" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPinIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Interactive Map</p>
                      <p className="text-xs">Location: {hospital.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
