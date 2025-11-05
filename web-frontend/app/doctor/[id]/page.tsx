'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DoctorProfile from '@/components/DoctorProfile'
import Reviews from '@/components/Reviews'
import BookingModal from '@/components/BookingModal'
import { motion } from 'framer-motion'

export default function DoctorPage() {
  const params = useParams()
  const doctorId = params.id as string
  const [doctor, setDoctor] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    // Fetch doctor details
    fetch(`/api/doctors/${doctorId}`)
      .then(res => res.json())
      .then(data => setDoctor(data.data.doctor))
  }, [doctorId])

  if (!doctor) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DoctorProfile 
            doctor={doctor} 
            onBookClick={() => setShowBookingModal(true)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8"
        >
          <Reviews doctorId={doctorId} />
        </motion.div>

        {showBookingModal && (
          <BookingModal
            doctor={doctor}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </div>
    </div>
  )
}

