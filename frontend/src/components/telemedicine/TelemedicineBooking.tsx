'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  VideoCameraIcon,
  ClockIcon,
  UserIcon,
  CalendarDaysIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  telemedicineEnabled: boolean;
  telemedicineFee?: number;
  consultationFee: number;
  averageRating: number;
  totalReviews: number;
  profilePicture?: string;
}

interface TelemedicineBookingProps {
  doctor: Doctor;
  onBookingComplete?: (bookingId: string) => void;
}

export default function TelemedicineBooking({ doctor, onBookingComplete }: TelemedicineBookingProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Generate available time slots (simplified)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  useEffect(() => {
    if (selectedDate) {
      setIsLoadingSlots(true);
      // Simulate API call to get available slots
      setTimeout(() => {
        setAvailableSlots(timeSlots.filter(() => Math.random() > 0.3));
        setIsLoadingSlots(false);
      }, 1000);
    }
  }, [selectedDate]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    setIsBooking(true);
    try {
      const appointmentDate = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          appointmentDate: appointmentDate.toISOString(),
          appointmentTime: selectedTime,
          duration: 30,
          isTelemedicine: true,
          telemedicineFee: doctor.telemedicineFee || doctor.consultationFee,
          consultationFee: doctor.telemedicineFee || doctor.consultationFee,
          platformFee: 0.1, // 10% commission
          totalAmount: (doctor.telemedicineFee || doctor.consultationFee) * 1.1,
          patientNotes,
          paymentMethod: 'STRIPE' // Placeholder
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onBookingComplete?.(data.data.id);
        alert('Telemedicine appointment booked successfully!');
      } else {
        alert('Failed to book appointment: ' + data.message);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  };

  if (!doctor.telemedicineEnabled) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Telemedicine Not Available
          </h3>
          <p className="text-red-700">
            This doctor does not currently offer telemedicine consultations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Doctor Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {doctor.profilePicture ? (
                <img 
                  src={doctor.profilePicture} 
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-primary-600" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Dr. {doctor.name}
              </h3>
              <p className="text-gray-600 mb-2">{doctor.specialization}</p>
              
              <div className="flex items-center space-x-4 mb-3">
                <Badge variant="success" className="flex items-center space-x-1">
                  <VideoCameraIcon className="w-4 h-4" />
                  <span>Telemedicine Available</span>
                </Badge>
                
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <span>⭐ {doctor.averageRating.toFixed(1)}</span>
                  <span>({doctor.totalReviews} reviews)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>30 min consultation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-primary-600">
                    R{doctor.telemedicineFee || doctor.consultationFee}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Book Telemedicine Consultation
          </h3>
          
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                
                {isLoadingSlots ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                          selectedTime === slot
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                
                {availableSlots.length === 0 && !isLoadingSlots && (
                  <p className="text-sm text-gray-500 mt-2">
                    No available slots for this date. Please select another date.
                  </p>
                )}
              </div>
            )}

            {/* Patient Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Notes (Optional)
              </label>
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Describe your symptoms or reason for consultation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">30 minutes</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-medium">R{doctor.telemedicineFee || doctor.consultationFee}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (10%):</span>
                    <span className="font-medium">R{((doctor.telemedicineFee || doctor.consultationFee) * 0.1).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="font-bold text-primary-600">
                      R{((doctor.telemedicineFee || doctor.consultationFee) * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Book Button */}
            <Button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || isBooking}
              className="w-full"
              size="lg"
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <VideoCameraIcon className="w-5 h-5 mr-2" />
                  Book Telemedicine Consultation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Telemedicine Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <VideoCameraIcon className="w-5 h-5 mr-2" />
            About Telemedicine Consultations
          </h4>
          
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Secure video consultation from the comfort of your home</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Same quality of care as in-person consultations</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Prescriptions can be sent directly to your pharmacy</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Consultation recording available upon request</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Technical Requirements:</strong> Stable internet connection, 
              webcam, microphone, and a quiet, well-lit environment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

