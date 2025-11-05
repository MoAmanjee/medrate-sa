import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Appointment } from '../types';
import toast from 'react-hot-toast';
import { Calendar, Clock, X, Star } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled'
      });
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'upcoming':
        return appointmentDate >= today && appointment.status !== 'cancelled';
      case 'past':
        return appointmentDate < today || appointment.status === 'completed';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your upcoming and past appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Appointments', count: appointments.length },
              { key: 'upcoming', label: 'Upcoming', count: appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return aptDate >= today && apt.status !== 'cancelled';
              }).length },
              { key: 'past', label: 'Past', count: appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return aptDate < today || apt.status === 'completed';
              }).length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === 'all' 
              ? 'No appointments found' 
              : `No ${filter} appointments found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {appointment.doctorName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                      <p className="text-gray-600 text-sm">{appointment.notes}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Booked on {appointment.createdAt instanceof Date ? appointment.createdAt.toLocaleDateString() : new Date(appointment.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                  {appointment.status === 'completed' && (
                    <button 
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowReviewModal(true);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Star className="h-4 w-4" />
                      <span>Review</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <ReviewModal
          doctorId={selectedAppointment.doctorId}
          doctorName={selectedAppointment.doctorName}
          appointmentId={selectedAppointment.id}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedAppointment(null);
          }}
          onReviewSubmitted={() => {
            fetchAppointments(); // Refresh appointments
          }}
        />
      )}
    </div>
  );
};

export default MyAppointments;
