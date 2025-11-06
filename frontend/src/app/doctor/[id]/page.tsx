'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, VerificationBadge, RatingBadge } from '@/components/ui/Badge';
import {
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import {
  LinkedinIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    verificationStatus: string;
  };
  title?: string;
  bio?: string;
  profilePicture?: string;
  specialization: string;
  experience: number;
  practiceAddress: string;
  practiceCity: string;
  practiceProvince: string;
  practicePostalCode?: string;
  education?: string;
  certifications?: string;
  awards?: string;
  memberships?: string;
  socialLinks?: string;
  services?: string;
  products?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  averageRating: number;
  totalReviews: number;
  consultationFee: number;
  isAvailable: boolean;
  availability?: string;
  hospitalAffiliations: Array<{
    id: string;
    hospital: {
      name: string;
      city: string;
      province: string;
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

export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = params.id as string;
  
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'booking'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  // Mock data for demonstration
  useEffect(() => {
    const mockDoctor: DoctorProfile = {
      id: doctorId,
      user: {
        firstName: 'John',
        lastName: 'Smith',
        verificationStatus: 'APPROVED'
      },
      title: 'Dr.',
      bio: 'Dr. John Smith is a highly experienced general practitioner with over 15 years of experience in providing comprehensive healthcare services. He specializes in preventive medicine, chronic disease management, and family healthcare.',
      profilePicture: '/api/placeholder/200/200',
      specialization: 'General Practice',
      experience: 15,
      practiceAddress: '123 Medical Centre, Sandton',
      practiceCity: 'Johannesburg',
      practiceProvince: 'Gauteng',
      practicePostalCode: '2196',
      education: JSON.stringify([
        { degree: 'MBChB', institution: 'University of Cape Town', year: '2008' },
        { degree: 'Diploma in Family Medicine', institution: 'College of Medicine of South Africa', year: '2012' }
      ]),
      certifications: JSON.stringify([
        'HPCSA Registration',
        'Advanced Life Support (ALS)',
        'Basic Life Support (BLS)'
      ]),
      awards: JSON.stringify([
        'Best General Practitioner 2023 - Medical Association of South Africa',
        'Excellence in Patient Care Award 2022'
      ]),
      memberships: JSON.stringify([
        'Medical Association of South Africa',
        'Royal College of General Practitioners',
        'South African Medical Association'
      ]),
      socialLinks: JSON.stringify({
        linkedin: 'https://linkedin.com/in/drjohnsmith',
        facebook: 'https://facebook.com/drjohnsmith',
        instagram: 'https://instagram.com/drjohnsmith',
        youtube: 'https://youtube.com/@drjohnsmith'
      }),
      services: JSON.stringify([
        'General Consultations',
        'Health Check-ups',
        'Chronic Disease Management',
        'Vaccinations',
        'Minor Procedures',
        'Telemedicine Consultations'
      ]),
      products: JSON.stringify([
        'Health Education Materials',
        'Preventive Care Guidelines',
        'Chronic Disease Management Plans'
      ]),
      contactEmail: 'dr.smith@medicalcentre.co.za',
      contactPhone: '+27 11 123 4567',
      website: 'https://drjohnsmith.co.za',
      averageRating: 4.8,
      totalReviews: 25,
      consultationFee: 450,
      isAvailable: true,
      availability: JSON.stringify({
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00']
      }),
      hospitalAffiliations: [
        {
          id: '1',
          hospital: {
            name: 'Sandton Medical Centre',
            city: 'Johannesburg',
            province: 'Gauteng'
          }
        }
      ],
      reviews: [
        {
          id: '1',
          rating: 5,
          comment: 'Dr. Smith is an excellent doctor. He took the time to listen to my concerns and provided clear explanations. Highly recommended!',
          createdAt: '2024-10-01',
          user: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            verificationStatus: 'APPROVED'
          }
        },
        {
          id: '2',
          rating: 4,
          comment: 'Professional and knowledgeable. The appointment was on time and the consultation was thorough.',
          createdAt: '2024-09-28',
          user: {
            firstName: 'Mike',
            lastName: 'Wilson',
            verificationStatus: 'NOT_VERIFIED'
          }
        }
      ]
    };

    setTimeout(() => {
      setDoctor(mockDoctor);
      setIsLoading(false);
    }, 1000);
  }, [doctorId]);

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

  if (!doctor) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Doctor not found</h3>
            <p className="text-gray-700">The doctor you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const education = parseJsonField(doctor.education);
  const certifications = parseJsonField(doctor.certifications);
  const awards = parseJsonField(doctor.awards);
  const memberships = parseJsonField(doctor.memberships);
  const socialLinks = parseJsonField(doctor.socialLinks);
  const services = parseJsonField(doctor.services);
  const products = parseJsonField(doctor.products);
  const availability = parseJsonField(doctor.availability);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  {doctor.profilePicture ? (
                    <img
                      src={doctor.profilePicture}
                      alt={`${doctor.user.firstName} ${doctor.user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-primary-500" />
                  )}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {doctor.title} {doctor.user.firstName} {doctor.user.lastName}
                  </h1>
                  <VerificationBadge 
                    status={doctor.user.verificationStatus as any} 
                    role="DOCTOR"
                  />
                </div>

                <p className="text-xl text-primary-600 font-medium mb-2">
                  {doctor.specialization}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{doctor.practiceCity}, {doctor.practiceProvince}</span>
                  </div>
                </div>

                <RatingBadge 
                  rating={doctor.averageRating} 
                  totalReviews={doctor.totalReviews}
                  size="lg"
                />

                {doctor.bio && (
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {doctor.bio}
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
                { id: 'reviews', label: 'Reviews' },
                { id: 'booking', label: 'Book Appointment' }
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
                  {/* Professional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <AcademicCapIcon className="w-5 h-5 mr-2" />
                          Professional Information
                        </span>
                        <button
                          onClick={() => toggleSection('professional')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedSections.has('professional') ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </button>
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.has('professional') && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Specialization</h4>
                            <p className="text-gray-600">{doctor.specialization}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                            <p className="text-gray-600">{doctor.experience} years</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Consultation Fee</h4>
                            <p className="text-gray-600">R{doctor.consultationFee}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                            <Badge variant={doctor.isAvailable ? 'success' : 'warning'}>
                              {doctor.isAvailable ? 'Available' : 'Busy'}
                            </Badge>
                          </div>
                        </div>

                        {/* Education */}
                        {education.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                            <div className="space-y-2">
                              {education.map((edu: any, index: number) => (
                                <div key={index} className="text-gray-600">
                                  <span className="font-medium">{edu.degree}</span> - {edu.institution} ({edu.year})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications */}
                        {certifications.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                            <div className="flex flex-wrap gap-2">
                              {certifications.map((cert: string, index: number) => (
                                <Badge key={index} variant="secondary">{cert}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Awards */}
                        {awards.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Awards</h4>
                            <div className="space-y-2">
                              {awards.map((award: string, index: number) => (
                                <div key={index} className="flex items-center text-gray-600">
                                  <TrophyIcon className="w-4 h-4 mr-2 text-accent-500" />
                                  {award}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Memberships */}
                        {memberships.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Professional Memberships</h4>
                            <div className="space-y-2">
                              {memberships.map((membership: string, index: number) => (
                                <div key={index} className="text-gray-600">{membership}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>

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

                  {/* Hospital Affiliations */}
                  {doctor.hospitalAffiliations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center">
                            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                            Hospital Affiliations
                          </span>
                          <button
                            onClick={() => toggleSection('hospitals')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedSections.has('hospitals') ? (
                              <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5" />
                            )}
                          </button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.has('hospitals') && (
                        <CardContent>
                          <div className="space-y-3">
                            {doctor.hospitalAffiliations.map((affiliation) => (
                              <div key={affiliation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <h4 className="font-medium text-gray-900">{affiliation.hospital.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {affiliation.hospital.city}, {affiliation.hospital.province}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline">
                                  View Hospital
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'reviews' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <StarIcon className="w-5 h-5 mr-2" />
                      Patient Reviews ({doctor.totalReviews})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {doctor.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-gray-500" />
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
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
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

              {activeTab === 'booking' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarDaysIcon className="w-5 h-5 mr-2" />
                      Book an Appointment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Consultation Fee</h4>
                        <p className="text-2xl font-bold text-primary-600">R{doctor.consultationFee}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Platform fee: R{(doctor.consultationFee * 0.1).toFixed(2)} (10%)
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Available Time Slots</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(availability).map(([day, slots]) => (
                            <div key={day} className="space-y-2">
                              <h5 className="font-medium text-gray-700 capitalize">{day}</h5>
                              <div className="space-y-1">
                                {(slots as string[]).map((slot, index) => (
                                  <button
                                    key={index}
                                    className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-primary-50 hover:border-primary-500 transition-colors"
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button size="lg" className="w-full">
                        <CalendarDaysIcon className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </Button>
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
                      <p className="text-sm text-gray-600">{doctor.practiceAddress}</p>
                      <p className="text-sm text-gray-600">
                        {doctor.practiceCity}, {doctor.practiceProvince} {doctor.practicePostalCode}
                      </p>
                    </div>
                  </div>

                  {doctor.contactPhone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${doctor.contactPhone}`} className="text-sm text-gray-600 hover:text-primary-600">
                        {doctor.contactPhone}
                      </a>
                    </div>
                  )}

                  {doctor.contactEmail && (
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${doctor.contactEmail}`} className="text-sm text-gray-600 hover:text-primary-600">
                        {doctor.contactEmail}
                      </a>
                    </div>
                  )}

                  {doctor.website && (
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                      <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary-600">
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
                    <CardTitle>Follow Dr. {doctor.user.lastName}</CardTitle>
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
                      <p className="text-xs">Location: {doctor.practiceAddress}</p>
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
