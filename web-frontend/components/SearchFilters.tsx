'use client'

import { useState } from 'react'

interface SearchFiltersProps {
  filters: {
    specialization: string
    city: string
    minRating: number
    acceptsMedicalAid: boolean
    radius: number
  }
  onFiltersChange: (filters: any) => void
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const specializations = [
    'General Practitioner',
    'Cardiologist',
    'Dentist',
    'Dermatologist',
    'Gynaecologist',
    'Paediatrician',
    'Neurologist',
    'ENT Specialist'
  ]

  const cities = [
    'Johannesburg',
    'Cape Town',
    'Durban',
    'Pretoria',
    'Port Elizabeth',
    'Bloemfontein'
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
      
      <div className="space-y-6">
        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <select
            value={filters.specialization}
            onChange={(e) => onFiltersChange({ ...filters, specialization: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating: {filters.minRating.toFixed(1)} ⭐
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating}
            onChange={(e) => onFiltersChange({ ...filters, minRating: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Medical Aid */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.acceptsMedicalAid}
              onChange={(e) => onFiltersChange({ ...filters, acceptsMedicalAid: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Accepts Medical Aid</span>
          </label>
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius: {filters.radius} km
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={filters.radius}
            onChange={(e) => onFiltersChange({ ...filters, radius: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Reset */}
        <button
          onClick={() => onFiltersChange({
            specialization: '',
            city: '',
            minRating: 0,
            acceptsMedicalAid: false,
            radius: 10
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}

