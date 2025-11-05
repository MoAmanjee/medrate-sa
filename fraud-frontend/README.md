# Doctor Finder & Appointment Booking Web App

A full-stack web application built with React, TypeScript, Tailwind CSS, Firebase, and Google Maps API for finding doctors and booking appointments.

## Features

✅ **Authentication System**
- Firebase Authentication (Email/Password)
- User registration and login
- Protected routes for authenticated users
- Role-based access (Patient/Doctor)

✅ **Doctor Search & Filtering**
- Search doctors by name and specialty
- Filter by specialty, location radius, and rating
- Real-time search results

✅ **Doctor Profile Pages**
- Detailed doctor information
- Available time slots
- Location on map
- Book appointment functionality

✅ **Appointment Booking**
- Time slot selection
- Appointment confirmation
- Real-time availability updates
- Prevention of double booking

✅ **My Appointments**
- View upcoming and past appointments
- Cancel or reschedule appointments
- Real-time updates

✅ **Doctor Dashboard**
- View and manage appointments
- Update appointment status
- Set availability schedule
- Appointment statistics

✅ **Google Maps Integration**
- Doctor location display
- Interactive map with markers
- Location-based filtering

✅ **Responsive Design**
- Mobile-friendly interface
- Loading states and error handling
- Form validation with React Hook Form and Yup
- Toast notifications

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Maps**: Google Maps JavaScript API
- **Forms**: React Hook Form with Yup validation
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Google Maps API key

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings

### 3. Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Create an API key
4. Restrict the API key to your domain (recommended)

### 4. Installation

```bash
# Clone the repository
cd fraud-frontend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Edit .env.local with your Firebase and Google Maps configuration
```

### 5. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 6. Populate Sample Data (Optional)

To add sample doctors and patients to your Firestore:

```bash
# Run the sample data script
npm run populate-data
```

### 7. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── DoctorCard.tsx
│   ├── SearchFilters.tsx
│   ├── MapView.tsx
│   ├── BookingModal.tsx
│   ├── AvailabilityModal.tsx
│   └── LoadingSpinner.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── firebase/           # Firebase configuration
│   └── config.ts
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── DoctorProfile.tsx
│   ├── MyAppointments.tsx
│   └── DoctorDashboard.tsx
├── scripts/            # Utility scripts
│   └── populateFirestore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Firestore Collections

### Users Collection
```typescript
{
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor';
  phone?: string;
  address?: string;
  specialty?: string; // For doctors
  bio?: string; // For doctors
  fee?: number; // For doctors
  rating?: number; // For doctors
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  availability?: {
    [day: string]: string[]; // Time slots for each day
  };
}
```

### Appointments Collection
```typescript
{
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
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Authentication
- Secure user registration and login
- Role-based access control
- Protected routes for authenticated users
- User profile management

### Doctor Search
- Real-time search by name and specialty
- Advanced filtering options
- Location-based search with radius
- Rating and fee filters

### Appointment Management
- Real-time availability checking
- Time slot booking
- Appointment status updates
- Cancellation and rescheduling

### Doctor Dashboard
- Appointment management interface
- Availability scheduling
- Patient information display
- Statistics and analytics

### Maps Integration
- Interactive map display
- Doctor location markers
- Location-based filtering
- Responsive map design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
