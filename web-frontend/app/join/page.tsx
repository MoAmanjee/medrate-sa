"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<"doctor" | "hospital">("doctor");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Get role from URL params
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "hospital_admin" || roleParam === "hospital") {
      setSelectedRole("hospital");
    } else {
      setSelectedRole("doctor");
    }
  }, [searchParams]);

  const doctorPlans = [
    {
      id: "free",
      name: "Free",
      price: "R0",
      period: "month",
      description: "Basic listing for verified doctors",
      features: [
        "Verified doctor profile",
        "Basic listing in search results",
        "Patient reviews",
        "Booking requests",
      ],
      popular: false,
    },
    {
      id: "standard",
      name: "Standard",
      price: "R299",
      period: "month",
      description: "Enhanced visibility and features",
      features: [
        "Everything in Free",
        "Enhanced profile with photos",
        "Priority in search results",
        "Analytics dashboard",
        "Email support",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "R799",
      period: "month",
      description: "Maximum visibility and promotion",
      features: [
        "Everything in Standard",
        "Featured/Promoted listing (appears first)",
        "Telehealth integration",
        "Advanced analytics",
        "Priority support",
        "Marketing tools",
      ],
      popular: false,
      promoted: true,
    },
  ];

  const hospitalPlans = [
    {
      id: "free",
      name: "Free",
      price: "R0",
      period: "month",
      description: "Basic listing for verified hospitals/businesses",
      features: [
        "Verified hospital/business profile",
        "Basic listing in search results",
        "Patient reviews",
        "Booking inquiries",
      ],
      popular: false,
    },
    {
      id: "standard",
      name: "Standard",
      price: "R1,999",
      period: "month",
      description: "Perfect for small clinics and low-income businesses",
      features: [
        "Everything in Free",
        "Enhanced profile with photos",
        "Priority in search results",
        "Analytics dashboard",
        "Booking management",
        "Email support",
        "Basic promotion tools",
      ],
      popular: true,
      badge: "Low Income",
    },
    {
      id: "premium",
      name: "Premium",
      price: "R9,999",
      period: "month",
      description: "For high-end hospitals like Netcare, Mediclinic, Life Healthcare",
      features: [
        "Everything in Standard",
        "Featured/Promoted listing (appears first)",
        "Advanced analytics & insights",
        "Multiple location support",
        "Priority support (24/7)",
        "Advanced marketing tools",
        "Promotion management",
        "API integration",
        "Custom branding",
        "White-label options",
      ],
      popular: false,
      promoted: true,
      badge: "Enterprise",
    },
  ];

  const plans = selectedRole === "doctor" ? doctorPlans : hospitalPlans;

  const handleJoin = (planId: string) => {
    if (!planId) {
      console.error("No plan ID provided");
      return;
    }
    // Navigate to registration with plan and selected role
    const roleParam = selectedRole === "doctor" ? "doctor" : "hospital_admin";
    const url = `/register?plan=${planId}&role=${roleParam}`;
    console.log("Navigating to:", url);
    // Use window.location for reliable navigation
    window.location.href = url;
  };

  const handleGetStartedFree = () => {
    const roleParam = selectedRole === "doctor" ? "doctor" : "hospital_admin";
    const url = `/register?plan=free&role=${roleParam}`;
    console.log("Navigating to:", url);
    // Use window.location for reliable navigation
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Join RateTheDoctor as {selectedRole === "doctor" ? "a Doctor" : "a Hospital / Business"}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            {selectedRole === "doctor" 
              ? "Get more patients, manage your reputation, and grow your practice. Choose a plan that works for you."
              : "Get more visibility, manage your reputation, and grow your hospital or business. Plans designed for businesses of all sizes."}
          </p>
          
          {/* Role Switch Notice */}
          <div className="max-w-md mx-auto mb-8">
            <p className="text-sm text-gray-500 mb-2">Want to join as {selectedRole === "doctor" ? "a Hospital/Business" : "a Doctor"}?</p>
            <Link
              href={selectedRole === "doctor" ? "/join?role=hospital_admin" : "/join?role=doctor"}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Switch to {selectedRole === "doctor" ? "Hospital/Business Plans" : "Doctor Plans"}
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">More Patients</h3>
            <p className="text-gray-600 leading-relaxed">
              Get discovered by patients actively searching for your specialization.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Build Reputation</h3>
            <p className="text-gray-600 leading-relaxed">
              Collect verified patient reviews to build trust and credibility.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Manage bookings, reviews, and your profile all in one place.
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            {selectedRole === "doctor" 
              ? "All plans include verified doctor status. Upgrade anytime."
              : "All plans include verified hospital/business status. Upgrade anytime."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 ${
                  plan.popular
                    ? "border-blue-500 scale-105"
                    : plan.promoted
                    ? "border-yellow-400"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.promoted && (
                  <div className="absolute -top-5 right-5">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      PROMOTED
                    </span>
                  </div>
                )}
                {(plan as any).badge && (
                  <div className="absolute -top-5 left-5">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                      (plan as any).badge === "Enterprise" 
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    }`}>
                      {(plan as any).badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 text-lg">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 font-medium">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.id}&role=${selectedRole === "doctor" ? "doctor" : "hospital_admin"}`}
                  className={`block w-full py-4 rounded-xl font-bold text-lg text-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                      : plan.promoted
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.id === "free" ? "Get Started Free" : "Choose Plan"}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-16 border border-gray-200">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                num: "1", 
                title: "Sign Up", 
                desc: selectedRole === "doctor" 
                  ? "Create your account and verify your HPCSA credentials"
                  : "Create your account and verify your business credentials"
              },
              { 
                num: "2", 
                title: "Complete Profile", 
                desc: selectedRole === "doctor"
                  ? "Add your specialization, location, and practice details"
                  : "Add your business type, location, and services offered"
              },
              { num: "3", title: "Choose Plan", desc: "Select Free, Standard, or Premium based on your needs" },
              { 
                num: "4", 
                title: selectedRole === "doctor" ? "Get Patients" : "Get Customers", 
                desc: selectedRole === "doctor"
                  ? "Start receiving booking requests and reviews"
                  : "Start receiving inquiries, bookings, and reviews"
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-blue-600">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-10 shadow-lg border border-gray-200">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-10">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "What does 'Promoted Listing' mean?",
                a: "Premium plan doctors appear first in search results, giving you maximum visibility when patients search for your specialization."
              },
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time from your doctor dashboard."
              },
              {
                q: "Is the Free plan really free?",
                a: "Yes, the Free plan includes basic listing and verification. You only pay if you want enhanced features and promotion."
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-sm text-gray-400">
          © 2024 RateTheDoctor. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
