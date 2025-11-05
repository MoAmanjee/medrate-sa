export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN';
  verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_VERIFIED';
  profile?: DoctorProfile | HospitalProfile | AdminProfile;
}

export interface DoctorProfile {
  id: string;
  hpcsaNumber: string;
  specialization: string;
  experience: number;
  practiceAddress: string;
  practiceCity: string;
  practiceProvince: string;
  practicePostalCode?: string;
  consultationFee: number;
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
}

export interface HospitalProfile {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  isPublic: boolean;
  averageRating: number;
  totalReviews: number;
}

export interface AdminProfile {
  id: string;
  level: number;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  location: {
    address: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  rating: number;
  totalReviews: number;
  consultationFee: number;
  isAvailable: boolean;
  verificationStatus: string;
  phone?: string;
  distance?: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  rating: number;
  totalReviews: number;
  isPublic: boolean;
  phone?: string;
  email?: string;
  website?: string;
  verificationStatus: string;
  doctorCount: number;
  distance?: number;
}

export interface Booking {
  id: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    phone?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  consultationFee: number;
  platformFee: number;
  totalAmount: number;
  patientNotes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    name: string;
    verificationStatus: string;
  };
}

export interface SearchFilters {
  query?: string;
  type?: 'doctor' | 'hospital' | 'all';
  specialization?: string;
  province?: string;
  city?: string;
  isPublic?: boolean;
  verified?: boolean;
  radius?: number;
  latitude?: number;
  longitude?: number;
  sortBy?: 'rating' | 'distance' | 'name' | 'price';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResults {
  results: (Doctor | Hospital)[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: SearchFilters;
}

export interface VerificationApplication {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  role: 'DOCTOR' | 'HOSPITAL' | 'PATIENT';
  documents?: any;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
  };
}
