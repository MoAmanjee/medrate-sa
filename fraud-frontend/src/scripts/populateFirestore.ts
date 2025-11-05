import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample doctors data
const sampleDoctors = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    role: 'doctor',
    specialty: 'Cardiology',
    bio: 'Dr. John Smith is a board-certified cardiologist with over 15 years of experience in treating heart conditions. He specializes in interventional cardiology and preventive care.',
    fee: 150,
    rating: 4.8,
    phone: '+1-555-0101',
    address: '123 Medical Center Dr, New York, NY 10001',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '123 Medical Center Dr, New York, NY 10001'
    },
    availability: {
      Monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Friday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Saturday: ['09:00', '10:00', '11:00'],
      Sunday: []
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    role: 'doctor',
    specialty: 'Dermatology',
    bio: 'Dr. Sarah Johnson is a renowned dermatologist specializing in cosmetic dermatology and skin cancer treatment. She has published numerous research papers in dermatology journals.',
    fee: 120,
    rating: 4.9,
    phone: '+1-555-0102',
    address: '456 Health Plaza, New York, NY 10002',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: '456 Health Plaza, New York, NY 10002'
    },
    availability: {
      Monday: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
      Tuesday: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
      Wednesday: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
      Thursday: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
      Friday: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
      Saturday: ['10:00', '11:00', '12:00'],
      Sunday: []
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    role: 'doctor',
    specialty: 'General Practice',
    bio: 'Dr. Michael Brown is a family medicine physician with extensive experience in primary care. He provides comprehensive healthcare services for patients of all ages.',
    fee: 100,
    rating: 4.7,
    phone: '+1-555-0103',
    address: '789 Wellness Ave, New York, NY 10003',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '789 Wellness Ave, New York, NY 10003'
    },
    availability: {
      Monday: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      Tuesday: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      Wednesday: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      Thursday: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      Friday: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      Saturday: ['08:00', '09:00', '10:00', '11:00'],
      Sunday: []
    }
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    role: 'doctor',
    specialty: 'Pediatrics',
    bio: 'Dr. Emily Davis is a pediatrician dedicated to providing excellent healthcare for children from infancy through adolescence. She has special expertise in child development and behavioral health.',
    fee: 110,
    rating: 4.8,
    phone: '+1-555-0104',
    address: '321 Children Hospital Blvd, New York, NY 10004',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: '321 Children Hospital Blvd, New York, NY 10004'
    },
    availability: {
      Monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Friday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      Saturday: ['09:00', '10:00', '11:00'],
      Sunday: []
    }
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@example.com',
    role: 'doctor',
    specialty: 'Orthopedics',
    bio: 'Dr. David Wilson is an orthopedic surgeon specializing in sports medicine and joint replacement. He has treated professional athletes and weekend warriors alike.',
    fee: 200,
    rating: 4.9,
    phone: '+1-555-0105',
    address: '654 Sports Medicine Center, New York, NY 10005',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '654 Sports Medicine Center, New York, NY 10005'
    },
    availability: {
      Monday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      Tuesday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      Wednesday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      Thursday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      Friday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      Saturday: ['08:00', '09:00', '10:00'],
      Sunday: []
    }
  }
];

// Sample patients data
const samplePatients = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    role: 'patient',
    phone: '+1-555-0201',
    address: '100 Patient St, New York, NY 10010'
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@example.com',
    role: 'patient',
    phone: '+1-555-0202',
    address: '200 Health Ave, New York, NY 10011'
  },
  {
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol.williams@example.com',
    role: 'patient',
    phone: '+1-555-0203',
    address: '300 Wellness Blvd, New York, NY 10012'
  }
];

// Sample reviews data
const sampleReviews = [
  {
    doctorId: '', // Will be set after doctors are created
    userId: '', // Will be set after patients are created
    userName: 'Alice Johnson',
    rating: 5,
    comment: 'Dr. Smith was excellent! He took the time to explain everything clearly and made me feel comfortable throughout the appointment.',
    appointmentId: 'sample-appointment-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    doctorId: '', // Will be set after doctors are created
    userId: '', // Will be set after patients are created
    userName: 'Bob Smith',
    rating: 4,
    comment: 'Great doctor, very professional and knowledgeable. The appointment was on time and the staff was friendly.',
    appointmentId: 'sample-appointment-2',
    createdAt: new Date('2024-01-20'),
  },
  {
    doctorId: '', // Will be set after doctors are created
    userId: '', // Will be set after patients are created
    userName: 'Carol Williams',
    rating: 5,
    comment: 'Dr. Johnson is amazing! She really cares about her patients and provides excellent care. Highly recommended!',
    appointmentId: 'sample-appointment-3',
    createdAt: new Date('2024-01-25'),
  },
];

async function populateFirestore() {
  try {
    console.log('Starting to populate Firestore with sample data...');

    const doctorIds: string[] = [];
    const patientIds: string[] = [];

    // Add doctors to users collection
    for (const doctor of sampleDoctors) {
      const docRef = await addDoc(collection(db, 'users'), doctor);
      doctorIds.push(docRef.id);
      console.log(`Added doctor: ${doctor.firstName} ${doctor.lastName} with ID: ${docRef.id}`);
    }

    // Add patients to users collection
    for (const patient of samplePatients) {
      const docRef = await addDoc(collection(db, 'users'), patient);
      patientIds.push(docRef.id);
      console.log(`Added patient: ${patient.firstName} ${patient.lastName} with ID: ${docRef.id}`);
    }

    // Add sample reviews
    for (let i = 0; i < Math.min(sampleReviews.length, doctorIds.length); i++) {
      const review = {
        ...sampleReviews[i],
        doctorId: doctorIds[i],
        userId: patientIds[i % patientIds.length],
      };
      await addDoc(collection(db, 'reviews'), review);
      console.log(`Added review for doctor ${doctorIds[i]}`);
    }

    console.log('Sample data population completed successfully!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

// Run the population function
populateFirestore();
