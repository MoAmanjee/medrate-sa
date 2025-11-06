'use client';

import React, { useState, useRef } from 'react';
import { CameraIcon, DocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import axios from 'axios';

interface IDVerificationProps {
  userId: string;
  onVerificationComplete: (token: string, user: any) => void;
  onCancel?: () => void;
}

export default function IDVerification({ userId, onVerificationComplete, onCancel }: IDVerificationProps) {
  const [idNumber, setIdNumber] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setIdDocument(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadDocument = async (): Promise<string | null> => {
    if (!idDocument) return null;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', idDocument);
      formData.append('type', 'id_document');

      // Convert file to base64 for now (simplified approach)
      // In production, you'd upload to S3 or Cloudinary
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // For now, return the data URL
          // In production, upload to storage and return URL
          resolve(reader.result as string);
        };
        reader.readAsDataURL(idDocument);
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setError('Failed to process document. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerify = async () => {
    if (!idNumber.trim()) {
      setError('Please enter your ID or passport number');
      return;
    }

    // Validate SA ID format (13 digits) or passport format
    const saIdPattern = /^\d{13}$/;
    const passportPattern = /^[A-Z0-9]{6,9}$/;
    
    if (!saIdPattern.test(idNumber) && !passportPattern.test(idNumber.toUpperCase())) {
      setError('Please enter a valid South African ID number (13 digits) or passport number');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Upload document if provided
      let documentUrl: string | null = null;
      if (idDocument) {
        documentUrl = await uploadDocument();
        if (!documentUrl) {
          setIsVerifying(false);
          return;
        }
      }

      // Verify ID
      const response = await axios.post('/api/auth/verify-id', {
        user_id: userId,
        id_number: idNumber.trim(),
        id_document_url: documentUrl,
      });

      // Handle response structure
      const data = response.data;
      if (data.access_token && data.user) {
        onVerificationComplete(data.access_token, data.user);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail?.error || 
                          error.response?.data?.detail || 
                          'Verification failed. Please check your ID number and try again.';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Identity Verification Required</CardTitle>
        <p className="text-sm text-gray-600 text-center mt-2">
          For your security, please verify your identity with a valid ID or passport
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <Input
            type="text"
            label="ID or Passport Number"
            value={idNumber}
            onChange={(e) => {
              setIdNumber(e.target.value);
              setError('');
            }}
            placeholder="Enter your SA ID number (13 digits) or passport number"
            required
            maxLength={20}
          />
          <p className="text-xs text-gray-500 mt-1">
            South African ID: 13 digits | Passport: 6-9 alphanumeric characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload ID Document (Optional but Recommended)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
            <div className="space-y-1 text-center">
              {preview ? (
                <div className="space-y-2">
                  <img
                    src={preview}
                    alt="ID preview"
                    className="mx-auto h-48 object-contain rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIdDocument(null);
                      setPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="id-document"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="id-document"
                        name="id-document"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Why we need this</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  We verify your identity to ensure account security and prevent fraud, 
                  similar to LinkedIn's verification process. Your information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isVerifying || isUploading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleVerify}
            className="flex-1"
            loading={isVerifying || isUploading}
            disabled={!idNumber.trim() || isVerifying || isUploading}
          >
            {isUploading ? 'Uploading...' : isVerifying ? 'Verifying...' : 'Verify Identity'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

