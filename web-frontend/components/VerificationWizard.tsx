'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface VerificationWizardProps {
  onComplete: () => void
}

export default function VerificationWizard({ onComplete }: VerificationWizardProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    displayName: '',
    specialization: '',
    phone: '',
    email: '',
    
    // Step 2: HPCSA
    hpcsaNumber: '',
    
    // Step 3: Documents
    hpcsaCertificate: null as File | null,
    governmentId: null as File | null,
    proofOfPractice: null as File | null,
    
    // Step 4: Billing
    billingAddress: '',
    paymentMethod: 'paystack'
  })

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Upload documents first
      const documents: Record<string, string> = {}
      
      // Upload logic would go here
      // For now, just submit the form
      
      const response = await fetch('/api/doctors/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          documents
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Verification request submitted!')
        onComplete()
      } else {
        toast.error(data.error?.message || 'Submission failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                i + 1 < step
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : i + 1 === step
                  ? 'border-primary-600 text-primary-600'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {i + 1 < step ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              {i < totalSteps - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  i + 1 < step ? 'bg-primary-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 text-center">
          Step {step} of {totalSteps}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Cardiologist"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="+27123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="doctor@example.com"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: HPCSA Number */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">HPCSA Registration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HPCSA Number
              </label>
              <input
                type="text"
                value={formData.hpcsaNumber}
                onChange={(e) => setFormData({ ...formData, hpcsaNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="MP123456"
                maxLength={8}
              />
              <p className="mt-2 text-sm text-gray-500">
                Format: 2 letters + 6 digits (e.g., MP123456, DT123456)
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
            <div className="space-y-4">
              <DocumentUpload
                label="HPCSA Certificate"
                description="Upload your HPCSA registration certificate (PDF or image)"
                file={formData.hpcsaCertificate}
                onChange={(file) => setFormData({ ...formData, hpcsaCertificate: file })}
                required
              />
              <DocumentUpload
                label="Government ID"
                description="Upload your SA ID book or passport"
                file={formData.governmentId}
                onChange={(file) => setFormData({ ...formData, governmentId: file })}
                required
              />
              <DocumentUpload
                label="Proof of Practice"
                description="Clinic letterhead, payment stub, or practice certificate"
                file={formData.proofOfPractice}
                onChange={(file) => setFormData({ ...formData, proofOfPractice: file })}
                required
              />
            </div>
          </motion.div>
        )}

        {/* Step 4: Billing */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Billing Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Address
                </label>
                <textarea
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="paystack">Paystack</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < totalSteps ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700"
          >
            Submit Verification
          </button>
        )}
      </div>
    </div>
  )
}

function DocumentUpload({ 
  label, 
  description, 
  file, 
  onChange, 
  required 
}: { 
  label: string
  description: string
  file: File | null
  onChange: (file: File | null) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-700">{file.name}</span>
            <button
              onClick={() => onChange(null)}
              className="text-red-500 hover:text-red-700"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id={`upload-${label}`}
            />
            <label
              htmlFor={`upload-${label}`}
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700"
            >
              Choose File
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

