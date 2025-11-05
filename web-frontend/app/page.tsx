"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    medicalAid: false,
    verified: true,
    rating: 0,
    telehealth: false,
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
    if (filters.medicalAid) {
      params.append("medicalAid", "true");
    }
    if (filters.verified) {
      params.append("verified", "true");
    }
    if (filters.rating > 0) {
      params.append("rating", filters.rating.toString());
    }
    if (filters.telehealth) {
      params.append("telehealth", "true");
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const quickFilters = [
    { label: "General Practitioner", value: "GP", icon: "👨‍⚕️" },
    { label: "Cardiologist", value: "Cardiologist", icon: "❤️" },
    { label: "Dentist", value: "Dentist", icon: "🦷" },
    { label: "Pediatrician", value: "Pediatrician", icon: "👶" },
    { label: "Gynecologist", value: "Gynecologist", icon: "👩" },
    { label: "Dermatologist", value: "Dermatologist", icon: "🧴" },
  ];

  const locations = [
    "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Search Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Find Verified Doctors & Hospitals in
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">South Africa</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Search by name, specialization, or location. All doctors and hospitals are verified and reviewed by real patients.
          </p>
          
          {/* Quick Navigation */}
          <div className="flex justify-center gap-4 mb-8">
            <Link
              href="/search"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Find Doctors
            </Link>
            <Link
              href="/hospitals"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Find Hospitals
            </Link>
          </div>

          {/* Main Search Bar */}
          <div className="max-w-5xl mx-auto">
            <div className="relative flex flex-col sm:flex-row items-center bg-white rounded-2xl shadow-2xl p-3 border-2 border-blue-200 focus-within:border-blue-500 transition-all duration-300 hover:shadow-3xl">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for a doctor, specialization, or location..."
                className="flex-1 w-full pl-14 pr-4 py-5 text-lg border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 mt-3 sm:mt-0 sm:ml-3"
              >
                Search
              </button>
            </div>

            {/* Quick Filter Pills */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4 font-medium">Popular Searches:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilters({ ...filters, specialization: filter.value });
                      setSearchQuery(filter.value);
                      // Navigate directly to search with filter
                      router.push(`/search?specialization=${filter.value}&q=${filter.value}`);
                    }}
                    className="px-5 py-2.5 bg-white rounded-full border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-100"
                  >
                    <span className="text-lg">{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="max-w-5xl mx-auto mb-12">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowFilters(!showFilters);
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mx-auto transition-colors group cursor-pointer"
            type="button"
          >
            <svg className={`h-5 w-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{showFilters ? "Hide" : "Show"} Advanced Filters</span>
          </button>

          {showFilters && (
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-8 border border-gray-200 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Specialization
                  </label>
                  <select
                    value={filters.specialization}
                    onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="">All Specializations</option>
                    <option value="GP">General Practitioner</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Neurologist">Neurologist</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="0">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Verified Doctors Only</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.medicalAid}
                      onChange={(e) => setFilters({ ...filters, medicalAid: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Accepts Medical Aid</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.telehealth}
                      onChange={(e) => setFilters({ ...filters, telehealth: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Telehealth Available</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-100"
              >
                Apply Filters & Search
              </button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Doctors</h3>
            <p className="text-gray-600 leading-relaxed">
              All doctors are verified through HPCSA and manual verification processes. Trust and safety guaranteed.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Patient Reviews</h3>
            <p className="text-gray-600 leading-relaxed">
              Read honest reviews from verified patients who have visited these doctors. Real experiences, real insights.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy Booking</h3>
            <p className="text-gray-600 leading-relaxed">
              Book appointments directly online or call the clinic. Simple, convenient, and instant confirmation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">RateTheDoctor</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Find verified doctors in South Africa. Read reviews, book appointments, and get the care you need.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">For Patients</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/search" className="hover:text-white transition-colors">Find Doctors</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/dashboard/patient" className="hover:text-white transition-colors">My Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">For Doctors</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/join" className="hover:text-white transition-colors">Join as Doctor</Link></li>
                <li><Link href="/dashboard/doctor" className="hover:text-white transition-colors">Doctor Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2024 RateTheDoctor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
