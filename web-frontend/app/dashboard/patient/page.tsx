"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100">
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
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  router.push("/");
                }}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome back, {user.name || user.email}!</h1>
          <p className="text-gray-600">Manage your appointments and reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <Link href="/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-block">
              View all →
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Reviews</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <Link href="/reviews" className="text-green-600 hover:text-green-700 text-sm font-medium mt-4 inline-block">
              View all →
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorites</h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <Link href="/favorites" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium mt-4 inline-block">
              View all →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/search"
              className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-500 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find a Doctor</h3>
              <p className="text-gray-600">Search for verified doctors in your area</p>
            </Link>
            <Link
              href="/search?type=hospital"
              className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-500 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find a Hospital</h3>
              <p className="text-gray-600">Search for hospitals and clinics</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
