"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RateTheDoctor</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Find Doctors</Link>
              <Link href="/hospitals" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Find Hospitals</Link>
              <Link href="/about" className="text-blue-600 font-semibold">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Contact</Link>
              <Link href="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">About RateTheDoctor</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted platform for finding verified doctors and hospitals in South Africa
          </p>
        </div>

        <div className="space-y-12">
          {/* Mission */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              RateTheDoctor is dedicated to making healthcare accessible and transparent in South Africa. 
              We connect patients with verified medical professionals and hospitals, ensuring trust, 
              quality, and convenience in every healthcare interaction.
            </p>
          </section>

          {/* What We Do */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Professionals</h3>
                  <p className="text-gray-600">
                    All doctors are verified through HPCSA, and hospitals through proper licensing. 
                    We ensure only legitimate medical professionals are listed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Reviews</h3>
                  <p className="text-gray-600">
                    Only verified patients who have attended appointments can leave reviews, 
                    ensuring authentic and helpful feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Booking</h3>
                  <p className="text-gray-600">
                    Book appointments directly through our platform with calendar integration 
                    and instant confirmations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-10m-2 0H3m2 0v-6h14v6M9 7h6m-6 4h6m-2-4v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hospitals & Clinics</h3>
                  <p className="text-gray-600">
                    Find verified hospitals and medical facilities with detailed information 
                    about services and departments.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Founder */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Founder</h2>
            <div className="flex items-start space-x-6">
              <div className="h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-white">MA</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mohammed Amanjeee</h3>
                <p className="text-blue-600 font-semibold mb-4">Founder & CEO</p>
                <p className="text-gray-600 leading-relaxed">
                  Mohammed holds an Honours degree in Computer Science and has extensive experience 
                  in web and mobile development. With a passion for healthcare technology and 
                  improving access to medical services in South Africa, he founded RateTheDoctor 
                  to bridge the gap between patients and healthcare providers.
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <svg className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Trust & Transparency</h4>
                  <p className="text-gray-600">We verify all medical professionals and ensure honest reviews from real patients.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <svg className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Privacy & Security</h4>
                  <p className="text-gray-600">POPIA-compliant data handling with encryption and strict privacy controls.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <svg className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Accessibility</h4>
                  <p className="text-gray-600">Making quality healthcare accessible to all South Africans through technology.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Join Us Today</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Whether you're a patient looking for care or a medical professional wanting to reach more patients, 
              we're here to help.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/search"
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
              >
                Find a Doctor
              </Link>
              <Link
                href="/join"
                className="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg"
              >
                Join as Professional
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

