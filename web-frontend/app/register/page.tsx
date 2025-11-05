"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  const role = searchParams.get("role") || "patient";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Form, 2: Phone Verification
  const [otp, setOtp] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Generate OTP when phone is submitted
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Form submitted!", formData);
    
    setLoading(true);
    setError("");

    // Validate all fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    // Validate phone number (South African format) - more lenient
    const cleanedPhone = formData.phone.replace(/\s/g, "").replace(/-/g, "");
    const phoneRegex = /^(\+27|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      setError("Please enter a valid South African phone number (e.g., +27 82 123 4567 or 082 123 4567)");
      setLoading(false);
      return;
    }

    // Mock OTP generation - replace with actual SMS service
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(mockOtp);
    console.log("✅ OTP sent to", formData.phone, ":", mockOtp); // For testing
    alert(`For testing: Your verification code is ${mockOtp}. Check the console for details.`);
    
    // In production, send SMS via Twilio
    setTimeout(() => {
      setStep(2);
      setLoading(false);
      console.log("✅ Moved to step 2 - Verification");
    }, 500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (otp !== verificationCode) {
      setError("Invalid verification code. Please try again.");
      setLoading(false);
      return;
    }

    // OTP verified - complete registration
    if (formData.email && formData.password) {
      localStorage.setItem("user", JSON.stringify({ 
        email: formData.email, 
        name: formData.fullName,
        phone: formData.phone,
        role: role,
        plan: plan,
        verified: true
      }));
      
      if (role === "doctor") {
        router.push("/dashboard/doctor");
      } else {
        router.push("/dashboard/patient");
      }
    } else {
      setError("Please fill in all fields");
    }
    setLoading(false);
  };

  const handleResendOtp = () => {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(mockOtp);
    console.log("New OTP:", mockOtp); // For testing
    setError("");
    alert("New verification code sent to your phone");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center items-center space-x-3 mb-8">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RateTheDoctor</h2>
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? (role === "doctor" ? "Join as a Doctor" : "Create your account") : "Verify Phone Number"}
          </h2>
          {plan !== "free" && step === 1 && (
            <p className="mt-2 text-center text-sm text-blue-600 font-semibold">
              Selected Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </p>
          )}
          {step === 2 && (
            <p className="mt-2 text-center text-sm text-gray-600">
              We sent a verification code to {formData.phone}
            </p>
          )}
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+27 82 123 4567 or 082 123 4567"
                />
                <p className="mt-1 text-xs text-gray-500">Required for account verification</p>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Create a password (min. 8 characters)"
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                Passwords do not match
              </div>
            )}

            <div>
              <button
                type="submit"
                onClick={(e) => {
                  console.log("Continue button clicked");
                  // Let the form submit handler take over
                }}
                disabled={
                  loading || 
                  !formData.fullName || 
                  !formData.email || 
                  !formData.phone || 
                  !formData.password || 
                  !formData.confirmPassword ||
                  formData.password !== formData.confirmPassword ||
                  formData.password.length < 8
                }
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Sending verification code..." : "Continue to Verification"}
              </button>
              {(!formData.password || formData.password.length < 8) && (
                <p className="mt-2 text-xs text-gray-500 text-center">Password must be at least 8 characters</p>
              )}
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-2 text-xs text-red-500 text-center">Passwords do not match</p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>For testing:</strong> Check the browser console for the OTP code. In production, you'll receive it via SMS.
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="appearance-none relative block w-full px-4 py-6 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg text-center font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the 6-digit code sent to {formData.phone}
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Resend verification code
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Back to registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
