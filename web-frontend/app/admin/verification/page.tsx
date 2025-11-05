'use client'

import { useState, useEffect } from 'react'
import { ShieldCheckIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface VerificationRequest {
  id: string
  doctorId: string
  doctorName: string
  hpcsaNumber: string
  status: string
  aiRiskScore: number
  aiRiskLevel: string
  submittedAt: string
  documents: Record<string, string>
  hpcsaResult: {
    verified: boolean
    nameMatch: boolean
    registrationStatus: string
  }
  automatedChecks: {
    formatValid: boolean
    nameMatch: boolean
    duplicateCheck: boolean
  }
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'manual_review'>('all')

  useEffect(() => {
    fetch(`/api/admin/verification_requests?status=${filter === 'all' ? '' : filter}`)
      .then(res => res.json())
      .then(data => setRequests(data.data.verificationRequests || []))
  }, [filter])

  const handleApprove = async (requestId: string) => {
    const response = await fetch(`/api/admin/verification_requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Approved by admin' })
    })

    if (response.ok) {
      toast.success('Verification approved')
      setRequests(requests.filter(r => r.id !== requestId))
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    const response = await fetch(`/api/admin/verification_requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })

    if (response.ok) {
      toast.success('Verification rejected')
      setRequests(requests.filter(r => r.id !== requestId))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Verification Queue</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl font-medium ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-xl font-medium ${
              filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('manual_review')}
            className={`px-6 py-2 rounded-xl font-medium ${
              filter === 'manual_review' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Manual Review
          </button>
        </div>

        {/* Requests List */}
        <div className="grid md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{request.doctorName}</h3>
                  <p className="text-sm text-gray-600">HPCSA: {request.hpcsaNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.aiRiskLevel === 'high'
                    ? 'bg-red-100 text-red-800'
                    : request.aiRiskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  Risk: {request.aiRiskScore}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    request.automatedChecks.formatValid ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>Format: {request.automatedChecks.formatValid ? 'Valid' : 'Invalid'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    request.automatedChecks.nameMatch ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>Name Match: {request.automatedChecks.nameMatch ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    !request.automatedChecks.duplicateCheck ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>Duplicate: {request.automatedChecks.duplicateCheck ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApprove(request.id)
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const reason = prompt('Rejection reason:')
                    if (reason) handleReject(request.id, reason)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedRequest && (
          <VerificationDetailModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </div>
  )
}

function VerificationDetailModal({
  request,
  onClose,
  onApprove,
  onReject
}: {
  request: VerificationRequest
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Verification Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>

          {/* Doctor Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Doctor Information</h3>
            <p className="text-gray-700">{request.doctorName}</p>
            <p className="text-gray-700">HPCSA: {request.hpcsaNumber}</p>
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(request.documents).map(([type, url]) => (
                <a
                  key={type}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* HPCSA Results */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">HPCSA Verification</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p>Status: {request.hpcsaResult.registrationStatus}</p>
              <p>Name Match: {request.hpcsaResult.nameMatch ? 'Yes' : 'No'}</p>
              <p>Verified: {request.hpcsaResult.verified ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Risk Score */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">AI Risk Assessment</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    request.aiRiskLevel === 'high'
                      ? 'bg-red-500'
                      : request.aiRiskLevel === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${request.aiRiskScore}%` }}
                />
              </div>
              <span className="text-lg font-bold">{request.aiRiskScore}/100</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => onApprove(request.id)}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => {
                const reason = prompt('Rejection reason:')
                if (reason) onReject(request.id, reason)
              }}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

