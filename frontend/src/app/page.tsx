import Layout from '@/components/layout/Layout';
import DocBotSection from '@/components/docbot/DocBotSection';
import DocBotButton from '@/components/docbot/DocBotButton';

export default function HomePage() {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Discovery-inspired Hero Section */}
        <section className="relative overflow-hidden gradient-discovery-hero">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center text-white">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
                  <span className="text-4xl">🏥</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
                  Find Trusted Healthcare in
                  <span className="block text-yellow-300">South Africa</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
                  Connect with verified doctors and hospitals. Book appointments, 
                  read reviews, and make informed healthcare decisions with confidence.
                </p>
                
                {/* Modern Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search doctors, hospitals, or specialties..."
                      className="w-full pl-14 pr-6 py-4 text-lg bg-white/90 backdrop-blur-sm border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/40 transition-all duration-300 placeholder-gray-500"
                    />
                    <button className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105">
                      Search
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a
                    href="/search"
                    className="btn-discovery px-8 py-4 text-lg font-semibold"
                  >
                    🔍 Find Doctors & Hospitals
                  </a>
                  <a
                    href="/auth/register"
                    className="btn-discovery-outline px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-blue-600"
                  >
                    👨‍⚕️ Join as Healthcare Provider
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DocBot Section */}
        <DocBotSection />

        {/* Modern Features Section */}
        <section className="py-24 bg-white relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Why Choose MedRate SA?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  We're committed to making healthcare accessible, transparent, and trustworthy across South Africa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center group animate-fade-in-up">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-blue-500/20 rounded-2xl mx-auto blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Professionals</h3>
                <p className="text-gray-600 leading-relaxed">
                  All doctors and hospitals are thoroughly verified with proper credentials and documentation.
                </p>
              </div>

              <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-green-500/20 rounded-2xl mx-auto blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Booking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Book appointments directly through our platform with secure payment processing.
                </p>
              </div>

              <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-orange-500/20 rounded-2xl mx-auto blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real Reviews</h3>
                <p className="text-gray-600 leading-relaxed">
                  Read authentic reviews from patients to make informed healthcare decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Stats Section */}
        <section className="py-24 gradient-discovery-primary relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Trusted by South Africans
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Join thousands of patients and healthcare providers who trust MedRate SA
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
              <div className="group animate-fade-in-up">
                <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  1,342+
                </div>
                <div className="text-lg font-semibold text-white/90">Verified Hospitals</div>
              </div>
              <div className="group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  500+
                </div>
                <div className="text-lg font-semibold text-white/90">Verified Doctors</div>
              </div>
              <div className="group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  10,000+
                </div>
                <div className="text-lg font-semibold text-white/90">Successful Bookings</div>
              </div>
              <div className="group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  50,000+
                </div>
                <div className="text-lg font-semibold text-white/90">Patient Reviews</div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern CTA Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/5 rounded-full translate-y-40 -translate-x-40"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Find Your Healthcare Provider?
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of South Africans who trust MedRate SA for their healthcare needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href="/search"
                  className="btn-discovery px-8 py-4 text-lg font-semibold"
                >
                  🔍 Start Your Search
                </a>
                <a
                  href="/hospitals"
                  className="btn-discovery-outline px-8 py-4 text-lg font-semibold"
                >
                  🏥 Browse Hospitals
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Floating DocBot Button */}
      <DocBotButton variant="floating" />
    </Layout>
  );
}