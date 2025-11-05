"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    specialization: searchParams.get("specialization") || "",
    location: searchParams.get("location") || "",
    rating: searchParams.get("rating") || "0",
    verified: searchParams.get("verified") === "true",
    medicalAid: searchParams.get("medicalAid") === "true",
    telehealth: searchParams.get("telehealth") === "true",
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append("q", searchQuery.trim());
    }
    if (filters.specialization) {
      params.append("specialization", filters.specialization);
    }
    if (filters.location) {
      params.append("location", filters.location);
    }
    if (filters.rating !== "0") {
      params.append("rating", filters.rating);
    }
    if (filters.verified) {
      params.append("verified", "true");
    }
    if (filters.medicalAid) {
      params.append("medicalAid", "true");
    }
    if (filters.telehealth) {
      params.append("telehealth", "true");
    }
    
    // Reload page with new params
    router.push(`/search?${params.toString()}`);
    window.location.reload();
  };

  // Mock data - replace with API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockDoctors = [
        {
          id: "1",
          name: "Dr. Sarah Johnson",
          specialization: "General Practitioner",
          location: "Johannesburg, Sandton",
          rating: 4.8,
          totalReviews: 127,
          verified: true,
          promoted: true,
          medicalAid: true,
          telehealth: true,
          phone: "+27112345678",
          distance: "2.3 km",
        },
        {
          id: "2",
          name: "Dr. Michael Chen",
          specialization: "Cardiologist",
          location: "Cape Town, Sea Point",
          rating: 4.9,
          totalReviews: 89,
          verified: true,
          promoted: false,
          medicalAid: true,
          telehealth: false,
          phone: "+27213456789",
          distance: "5.1 km",
        },
        {
          id: "3",
          name: "Dr. Priya Patel",
          specialization: "Pediatrician",
          location: "Durban, Umhlanga",
          rating: 4.7,
          totalReviews: 156,
          verified: true,
          promoted: false,
          medicalAid: true,
          telehealth: true,
          phone: "+27314567890",
          distance: "1.8 km",
        },
      ];

      // Filter based on search params
      let filtered = mockDoctors;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(d => 
          d.name.toLowerCase().includes(query) ||
          d.specialization.toLowerCase().includes(query) ||
          d.location.toLowerCase().includes(query)
        );
      }

      if (filters.specialization) {
        filtered = filtered.filter(d => d.specialization.includes(filters.specialization));
      }

      if (filters.location) {
        filtered = filtered.filter(d => d.location.includes(filters.location));
      }

      if (filters.rating !== "0") {
        filtered = filtered.filter(d => d.rating >= parseFloat(filters.rating));
      }

      if (filters.verified) {
        filtered = filtered.filter(d => d.verified);
      }

      if (filters.medicalAid) {
        filtered = filtered.filter(d => d.medicalAid);
      }

      if (filters.telehealth) {
        filtered = filtered.filter(d => d.telehealth);
      }

      // Sort: promoted first, then by rating
      const sorted = filtered.sort((a, b) => {
        if (a.promoted && !b.promoted) return -1;
        if (!a.promoted && b.promoted) return 1;
        return b.rating - a.rating;
      });

      setDoctors(sorted);
      setLoading(false);
    }, 500);
  }, [searchParams]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleBook = (doctorId: string) => {
    router.push(`/doctor/${doctorId}?action=book`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-4 bg-white rounded-2xl shadow-lg p-3 border-2 border-gray-200 focus-within:border-blue-500 transition-all">
            <svg className="h-6 w-6 text-gray-400 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for a doctor, specialization, or location..."
              className="flex-1 px-4 py-4 text-lg border-0 focus:outline-none focus:ring-0"
            />
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Specialization
                  </label>
                  <select
                    value={filters.specialization}
                    onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">All</option>
                    <option value="GP">General Practitioner</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Pediatrician">Pediatrician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">All Locations</option>
                    <option value="Johannesburg">Johannesburg</option>
                    <option value="Cape Town">Cape Town</option>
                    <option value="Durban">Durban</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="0">Any</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Verified Only</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.medicalAid}
                      onChange={(e) => setFilters({ ...filters, medicalAid: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Accepts Medical Aid</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.telehealth}
                      onChange={(e) => setFilters({ ...filters, telehealth: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Telehealth</span>
                  </label>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 mt-4"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Doctor List */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-semibold text-lg mb-2">No doctors found</p>
                <p className="text-gray-500 mb-6">Try adjusting your search criteria</p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Back to Search
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-gray-600 font-medium">
                    Found <span className="font-bold text-gray-900">{doctors.length}</span> doctor{doctors.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">{doctor.name}</h3>
                          {doctor.verified && (
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Verified Doctor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                          {doctor.promoted && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                              ⭐ PROMOTED
                            </span>
                          )}
                        </div>

                        <p className="text-lg text-gray-600 font-medium mb-3">{doctor.specialization}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">{doctor.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold">{doctor.rating}</span>
                            <span className="text-gray-500">({doctor.totalReviews} reviews)</span>
                          </div>
                          <span className="text-gray-500">• {doctor.distance}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {doctor.medicalAid && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                              ✓ Medical Aid
                            </span>
                          )}
                          {doctor.telehealth && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                              📱 Telehealth
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCall(doctor.phone);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-semibold text-gray-700 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-100"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleBook(doctor.id);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Book Appointment
                          </button>
                          <Link
                            href={`/doctor/${doctor.id}`}
                            className="ml-auto px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-semibold shadow-sm hover:shadow-md"
                          >
                            View Profile →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
