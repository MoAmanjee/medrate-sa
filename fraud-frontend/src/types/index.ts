export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor';
  phone?: string;
  address?: string;
  specialty?: string;
  bio?: string;
  fee?: number;
  rating?: number;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Doctor extends User {
  id: string;
  role: 'doctor';
  specialty: string;
  bio: string;
  fee: number;
  rating: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  availability: {
    [key: string]: string[]; // day of week -> array of time slots
  };
}

export interface Appointment {
  id: string;
  doctorId: string;
  userId: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  notes?: string;
}

export interface Review {
  id: string;
  doctorId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  appointmentId: string;
  createdAt: Date;
}

export interface SearchFilters {
  specialty?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number; // in kilometers
  };
  minRating?: number;
  maxFee?: number;
}
