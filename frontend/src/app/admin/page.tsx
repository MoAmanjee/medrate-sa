'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalHospitals: number;
  totalBookings: number;
  pendingVerifications: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'revenue'>('overview');

  // Mock data
  const stats: DashboardStats = {
    totalUsers: 1250,
    totalDoctors: 45,
    totalHospitals: 12,
    totalBookings: 320,
    pendingVerifications: 8,
    totalRevenue: 125000
  };

  const recentBookings = [
    {
      id: '1',
      doctor: 'Dr. John Smith',
      patient: 'Jane Doe',
      date: '2024-10-15',
      amount: 495,
      status: 'COMPLETED'
    },
    {
      id: '2',
      doctor: 'Dr. Sarah Johnson',
      patient: 'Mike Wilson',
      date: '2024-10-14',
      amount: 715,
      status: 'CONFIRMED'
    },
    {
      id: '3',
      doctor: 'Dr. Michael Brown',
      patient: 'Lisa Davis',
      date: '2024-10-13',
      amount: 605,
      status: 'COMPLETED'
    }
  ];

  const pendingVerifications = [
    {
      id: '1',
      name: 'Dr. Alex Thompson',
      type: 'DOCTOR',
      email: 'alex.thompson@email.com',
      submittedAt: '2024-10-12'
    },
    {
      id: '2',
      name: 'Sunrise Medical Center',
      type: 'HOSPITAL',
      email: 'admin@sunrise.co.za',
      submittedAt: '2024-10-11'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: 'success',
      CONFIRMED: 'info',
      PENDING: 'warning',
      CANCELLED: 'danger'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'verifications', label: 'Verifications' },
                { id: 'users', label: 'Users' },
                { id: 'revenue', label: 'Revenue' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-primary-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-secondary-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Doctors</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-accent-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Hospitals</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalHospitals}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">R{stats.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{booking.doctor}</p>
                            <p className="text-sm text-gray-600">Patient: {booking.patient}</p>
                            <p className="text-sm text-gray-500">{booking.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">R{booking.amount}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pending Verifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingVerifications.map((verification) => (
                        <div key={verification.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{verification.name}</p>
                            <p className="text-sm text-gray-600">{verification.email}</p>
                            <p className="text-sm text-gray-500">Submitted: {verification.submittedAt}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingVerifications.map((verification) => (
                      <div key={verification.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{verification.name}</p>
                            <p className="text-sm text-gray-600">{verification.email}</p>
                            <Badge variant="warning">{verification.type}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">User management features will be implemented here.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Revenue analytics and reporting features will be implemented here.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
