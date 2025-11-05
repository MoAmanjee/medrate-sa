"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function HospitalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id as string;
  
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setHospital({
        id: hospitalId,
        name: "Netcare Sandton Hospital",
        type: "Private Hospital",
        city: "Johannesburg",
        province: "Gauteng",
        address: "82 Rivonia Rd, Sandton, 2196",
        phone: "+27113010000",
        email: "info@sandton.netcare.co.za",
        website: "https://www.netcare.co.za",
        verified: true,
        claimed: true,
        rating: 4.7,
        totalReviews: 234,
        emergencyServices: true,
        departments: ["Emergency", "Cardiology", "Maternity", "Surgery", "ICU", "Radiology"],
        specialties: ["Cardiac Surgery", "Orthopedics", "Neurology", "Oncology"],
        isFeatured: true,
        promotionTier: "premium",
        featuredUntil: "2024-12-31",
      });
      setReviews([]);
      setLoading(false);
    }, 500);
  }, [hospitalId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hospital not found</h2>
          <Link href="/hospitals" className="text-blue-600 hover:text-blue-700">
            Back to Hospitals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RateTheDoctor</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Find Doctors</Link>
              <Link href="/hospitals" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Find Hospitals</Link>
              <Link href="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Banner */}
        {hospital.isFeatured && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-4 mb-6 text-center">
            <p className="text-gray-900 font-bold">
              ⭐ FEATURED HOSPITAL - {hospital.promotionTier.toUpperCase()} PLAN
            </p>
          </div>
        )}

        {/* Hospital Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-extrabold text-gray-900">{hospital.name}</h1>
                {hospital.verified && (
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Verified Hospital">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
              </div>
              
              <p className="text-xl text-gray-600 mb-4">{hospital.type}</p>
              
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xl font-bold">{hospital.rating}</span>
                  <span className="text-gray-500">({hospital.totalReviews} reviews)</span>
                </div>
                {hospital.emergencyServices && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                    🚨 Emergency Services
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </h3>
              <p className="text-gray-600">{hospital.address}</p>
              <p className="text-gray-600">{hospital.city}, {hospital.province}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact
              </h3>
              <p className="text-gray-600">{hospital.phone}</p>
              <p className="text-gray-600">{hospital.email}</p>
              {hospital.website && (
                <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                  Visit Website →
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.href = `tel:${hospital.phone}`}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-all shadow-sm hover:shadow-md"
            >
              📞 Call Hospital
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              📅 Book Appointment
            </button>
            <Link
              href="/hospitals"
              className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
            >
              ← Back to Search
            </Link>
          </div>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Departments</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.departments.map((dept: string, idx: number) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-semibold">
                  {dept}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((spec: string, idx: number) => (
                <span key={idx} className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-semibold">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to review this hospital.</p>
          ) : (
            <div className="space-y-4">
              {/* Reviews will be displayed here */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

