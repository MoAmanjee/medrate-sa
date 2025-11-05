import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Doctor, Appointment } from '../types';
import toast from 'react-hot-toast';
import { Star, MapPin, DollarSign, ArrowLeft, Phone, Mail } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import Reviews from '../components/Reviews';

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (id) {
      fetchDoctor();
      fetchAppointments();
    }
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const doctorDoc = await getDoc(doc(db, 'users', id!));
      if (doctorDoc.exists()) {
        setDoctor({ id: doctorDoc.id, ...doctorDoc.data() } as Doctor);
      } else {
        toast.error('Doctor not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Error loading doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!id) return;
    
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', id)
      );
      const querySnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getAvailableTimeSlots = () => {
    if (!doctor) return [];
    
    const today = new Date();
    const slots: Array<{ date: string; time: string; displayDate: string }> = [];
    
    // Generate time slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (doctor.availability && doctor.availability[dayName]) {
        doctor.availability[dayName].forEach(time => {
          const slotDate = new Date(date);
          const [hours, minutes] = time.split(':').map(Number);
          slotDate.setHours(hours, minutes, 0, 0);
          
          // Check if this slot is already booked
          const isBooked = appointments.some(apt => 
            apt.date === slotDate.toISOString().split('T')[0] && 
            apt.time === time &&
            apt.status !== 'cancelled'
          );
          
          if (!isBooked) {
            slots.push({
              date: slotDate.toISOString().split('T')[0],
              time,
              displayDate: slotDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })
            });
          }
        });
      }
    }
    
    return slots.slice(0, 20); // Limit to 20 slots for better UX
  };

  const handleBookAppointment = async (selectedSlot: { date: string; time: string }) => {
    if (!user || !doctor) return;

    try {
      const appointmentData = {
        doctorId: doctor.id,
        userId: user.uid,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        patientName: `${userData?.firstName} ${userData?.lastName}`,
        date: selectedSlot.date,
        time: selectedSlot.time,
        status: 'pending',
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'appointments'), appointmentData);
      toast.success('Appointment booked successfully!');
      setShowBookingModal(false);
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Doctor not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Dr. {doctor.firstName} {doctor.lastName}
              </h1>
              <p className="text-primary-100 text-xl mb-4">{doctor.specialty}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(doctor.rating || 0)}
                  <span className="text-lg">({doctor.rating?.toFixed(1) || '0.0'})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-5 w-5" />
                  <span>${doctor.fee || 0} per consultation</span>
                </div>
              </div>
            </div>
            {user && userData?.role === 'patient' && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Book Appointment
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">About Dr. {doctor.lastName}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {doctor.bio || 'Experienced healthcare professional dedicated to providing quality care to patients.'}
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">{doctor.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{doctor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">{doctor.location?.address || 'Location not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Map */}
              {doctor.location && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map will be displayed here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Specialty</span>
                    <span className="font-medium">{doctor.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(doctor.rating || 0)}
                      <span className="text-sm">({doctor.rating?.toFixed(1) || '0.0'})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fee</span>
                    <span className="font-medium">${doctor.fee || 0}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
                <div className="space-y-2">
                  {getAvailableTimeSlots().slice(0, 5).map((slot, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{slot.displayDate}</span>
                      <span className="font-medium">{slot.time}</span>
                    </div>
                  ))}
                  {getAvailableTimeSlots().length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      +{getAvailableTimeSlots().length - 5} more slots available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <Reviews doctorId={doctor.id} />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          doctor={doctor}
          availableSlots={getAvailableTimeSlots()}
          onClose={() => setShowBookingModal(false)}
          onBook={handleBookAppointment}
        />
      )}
    </div>
  );
};

export default DoctorProfile;
