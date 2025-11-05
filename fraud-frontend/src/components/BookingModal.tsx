import React, { useState } from 'react';
import { Doctor } from '../types';
import { X, Calendar, Clock } from 'lucide-react';

interface BookingModalProps {
  doctor: Doctor;
  availableSlots: Array<{
    date: string;
    time: string;
    displayDate: string;
  }>;
  onClose: () => void;
  onBook: (slot: { date: string; time: string }) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  availableSlots,
  onClose,
  onBook,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    setLoading(true);
    try {
      await onBook(selectedSlot);
    } finally {
      setLoading(false);
    }
  };

  // Group slots by date
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, typeof availableSlots>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Book Appointment with Dr. {doctor.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Doctor:</span>
                  <p className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Specialty:</span>
                  <p className="font-medium">{doctor.specialty}</p>
                </div>
                <div>
                  <span className="text-gray-600">Fee:</span>
                  <p className="font-medium">${doctor.fee || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium">{doctor.location?.address || 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>
            
            {Object.keys(groupedSlots).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No available time slots</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedSlots).map(([date, slots]) => (
                  <div key={date} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot({ date: slot.date, time: slot.time })}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedSlot && (
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-primary-900 mb-2">Selected Appointment</h4>
              <p className="text-primary-700">
                {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} at {selectedSlot.time}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={!selectedSlot || loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
