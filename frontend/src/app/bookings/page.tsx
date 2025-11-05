'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  doctor: {
    name: string;
    specialization: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  consultationFee: number;
  platformFee: number;
  totalAmount: number;
  createdAt: string;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Mock data
  const bookings: Booking[] = [
    {
      id: '1',
      doctor: {
        name: 'Dr. John Smith',
        specialization: 'General Practice'
      },
      appointmentDate: '2024-10-15',
      appointmentTime: '10:00',
      status: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
      consultationFee: 450,
      platformFee: 45,
      totalAmount: 495,
      createdAt: '2024-10-10'
    },
    {
      id: '2',
      doctor: {
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiology'
      },
      appointmentDate: '2024-10-20',
      appointmentTime: '14:30',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      consultationFee: 650,
      platformFee: 65,
      totalAmount: 715,
      createdAt: '2024-10-12'
    },
    {
      id: '3',
      doctor: {
        name: 'Dr. Michael Brown',
        specialization: 'Dermatology'
      },
      appointmentDate: '2024-10-05',
      appointmentTime: '09:00',
      status: 'COMPLETED',
      paymentStatus: 'COMPLETED',
      consultationFee: 550,
      platformFee: 55,
      totalAmount: 605,
      createdAt: '2024-10-01'
    }
  ];

  const upcomingBookings = bookings.filter(b => 
    b.status === 'PENDING' || b.status === 'CONFIRMED'
  );
  
  const pastBookings = bookings.filter(b => 
    b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'warning',
      CONFIRMED: 'success',
      COMPLETED: 'info',
      CANCELLED: 'danger'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'danger',
      REFUNDED: 'info'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Past ({pastBookings.length})
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'upcoming' ? (
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-primary-500" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.doctor.name}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            
                            <p className="text-primary-600 font-medium mb-2">
                              {booking.doctor.specialization}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>{formatDate(booking.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{booking.appointmentTime}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <CreditCardIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Payment:</span>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                              <span className="text-gray-600">
                                Total: <span className="font-semibold text-gray-900">R{booking.totalAmount}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button size="sm">
                            View Details
                          </Button>
                          {booking.status === 'PENDING' && (
                            <Button variant="outline" size="sm">
                              Cancel Booking
                            </Button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-4">You don't have any upcoming appointments.</p>
                  <Button>Book an Appointment</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-500" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.doctor.name}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            
                            <p className="text-primary-600 font-medium mb-2">
                              {booking.doctor.specialization}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>{formatDate(booking.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{booking.appointmentTime}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <CreditCardIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Payment:</span>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                              <span className="text-gray-600">
                                Total: <span className="font-semibold text-gray-900">R{booking.totalAmount}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button size="sm">
                            View Details
                          </Button>
                          {booking.status === 'COMPLETED' && (
                            <Button variant="outline" size="sm">
                              Leave Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No past bookings</h3>
                  <p className="text-gray-600">You haven't completed any appointments yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
