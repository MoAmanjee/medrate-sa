'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, VerificationBadge, RatingBadge } from '@/components/ui/Badge';
import {
  UserIcon,
  MapPinIcon,
  CalendarDaysIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  location: {
    city: string;
    province: string;
  };
  rating: number;
  totalReviews: number;
  consultationFee: number;
  isAvailable: boolean;
  verificationStatus: string;
}

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [province, setProvince] = useState('');

  // Mock data
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. John Smith',
      specialization: 'General Practice',
      experience: 15,
      location: { city: 'Johannesburg', province: 'Gauteng' },
      rating: 4.8,
      totalReviews: 25,
      consultationFee: 450,
      isAvailable: true,
      verificationStatus: 'APPROVED'
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      experience: 12,
      location: { city: 'Cape Town', province: 'Western Cape' },
      rating: 4.9,
      totalReviews: 32,
      consultationFee: 650,
      isAvailable: true,
      verificationStatus: 'APPROVED'
    },
    {
      id: '3',
      name: 'Dr. Michael Brown',
      specialization: 'Dermatology',
      experience: 8,
      location: { city: 'Durban', province: 'KwaZulu-Natal' },
      rating: 4.7,
      totalReviews: 18,
      consultationFee: 550,
      isAvailable: false,
      verificationStatus: 'APPROVED'
    }
  ];

  const specializations = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Oncology',
    'Psychiatry'
  ];

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

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = !specialization || doctor.specialization === specialization;
    const matchesProvince = !province || doctor.location.province === province;
    
    return matchesSearch && matchesSpecialization && matchesProvince;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Verified Doctors</h1>
            
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctors by name or specialization..."
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Provinces</option>
                    {provinces.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredDoctors.length} verified doctors found
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Sort by Rating</Button>
              <Button variant="outline" size="sm">Sort by Distance</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-10 h-10 text-primary-500" />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doctor.name}
                        </h3>
                        <VerificationBadge 
                          status={doctor.verificationStatus as any} 
                          role="DOCTOR"
                        />
                      </div>
                      
                      <p className="text-primary-600 font-medium mb-2">
                        {doctor.specialization}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {doctor.experience} years experience
                      </p>
                      
                      <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{doctor.location.city}, {doctor.location.province}</span>
                      </div>
                      
                      <RatingBadge 
                        rating={doctor.rating} 
                        totalReviews={doctor.totalReviews}
                        size="sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Consultation Fee:</span>
                        <span className="font-semibold text-gray-900">
                          R{doctor.consultationFee}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Availability:</span>
                        <Badge variant={doctor.isAvailable ? 'success' : 'warning'}>
                          {doctor.isAvailable ? 'Available' : 'Busy'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button className="w-full" asChild>
                        <a href={`/doctor/${doctor.id}`}>
                          View Profile
                        </a>
                      </Button>
                      {doctor.isAvailable && (
                        <Button variant="outline" className="w-full">
                          <CalendarDaysIcon className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-700">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
