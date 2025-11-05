import React from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../types';
import { Star, MapPin, DollarSign } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-primary-600 font-medium">{doctor.specialty}</p>
          </div>
          <div className="flex items-center space-x-1">
            {renderStars(doctor.rating || 0)}
            <span className="text-sm text-gray-600 ml-1">
              ({doctor.rating?.toFixed(1) || '0.0'})
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {doctor.bio || 'Experienced healthcare professional dedicated to providing quality care.'}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{doctor.location?.address || 'Location not specified'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="text-sm">${doctor.fee || 0} per consultation</span>
          </div>
        </div>

        <Link
          to={`/doctor/${doctor.id}`}
          className="block w-full bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
        >
          View Profile & Book
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
