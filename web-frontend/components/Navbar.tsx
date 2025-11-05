"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [showJoinDropdown, setShowJoinDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowJoinDropdown(false);
      }
    };

    if (showJoinDropdown) {
      // Add event listener after a short delay to avoid immediate closing
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showJoinDropdown]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200" style={{ position: 'relative', zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-600">RateTheDoctor</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="text-gray-700 hover:text-blue-600 font-medium">Find Doctors</Link>
            <Link href="/hospitals" className="text-gray-700 hover:text-blue-600 font-medium">Find Hospitals</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</Link>
            
            {/* Want to Join Dropdown */}
            <div className="relative" style={{ position: 'relative' }}>
              <button
                ref={buttonRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Want to Join clicked, current state:", showJoinDropdown);
                  setShowJoinDropdown(!showJoinDropdown);
                }}
                onMouseEnter={() => {
                  console.log("Mouse entered button");
                  setShowJoinDropdown(true);
                }}
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer"
                type="button"
                style={{ background: 'transparent', border: 'none', padding: '4px 8px' }}
              >
                Want to Join
                <svg 
                  className={`h-4 w-4 transition-transform duration-200 ${showJoinDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showJoinDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border-2 border-gray-300 py-2"
                  style={{ 
                    zIndex: 10000,
                    position: 'absolute',
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1,
                  }}
                  onMouseEnter={() => {
                    console.log("Mouse entered dropdown");
                    setShowJoinDropdown(true);
                  }}
                  onMouseLeave={() => {
                    console.log("Mouse left dropdown");
                    // Don't close immediately, let user move mouse
                    setTimeout(() => setShowJoinDropdown(false), 300);
                  }}
                >
                  <Link
                    href="/join?role=doctor"
                    className="block px-6 py-4 hover:bg-blue-50 active:bg-blue-100 flex items-center gap-3 transition-colors cursor-pointer"
                    onClick={(e) => {
                      console.log("Doctor option clicked");
                      e.stopPropagation();
                      setShowJoinDropdown(false);
                    }}
                  >
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm">Join as a Doctor</div>
                      <div className="text-xs text-gray-500">For individual practitioners</div>
                    </div>
                  </Link>
                  
                  <div className="border-t border-gray-200 my-1"></div>
                  
                  <Link
                    href="/join?role=hospital_admin"
                    className="block px-6 py-4 hover:bg-green-50 active:bg-green-100 flex items-center gap-3 transition-colors cursor-pointer"
                    onClick={(e) => {
                      console.log("Hospital option clicked");
                      e.stopPropagation();
                      setShowJoinDropdown(false);
                    }}
                  >
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-10m-2 0H3m2 0v-6h14v6M9 7h6m-6 4h6m-2-4v4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm">Join as a Hospital / Business</div>
                      <div className="text-xs text-gray-500">For hospitals, clinics & businesses</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700">
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
