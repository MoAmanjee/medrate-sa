import React, { useState } from 'react';
import { SearchFilters } from '../types';
import { Filter, X } from 'lucide-react';

interface SearchFiltersComponentProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const specialties = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
];

const SearchFiltersComponent: React.FC<SearchFiltersComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSpecialtyChange = (specialty: string) => {
    onFiltersChange({
      ...filters,
      specialty: specialty === filters.specialty ? undefined : specialty,
    });
  };

  const handleMinRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      minRating: rating === filters.minRating ? undefined : rating,
    });
  };

  const handleMaxFeeChange = (fee: number) => {
    onFiltersChange({
      ...filters,
      maxFee: fee === filters.maxFee ? undefined : fee,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear all</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {isOpen ? 'Hide' : 'Show'} filters
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Specialty Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Specialty</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtyChange(specialty)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.specialty === specialty
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
            <div className="flex space-x-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleMinRatingChange(rating)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.minRating === rating
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}
                >
                  {rating}+ Stars
                </button>
              ))}
            </div>
          </div>

          {/* Fee Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Maximum Fee</h4>
            <div className="flex space-x-2">
              {[50, 100, 150, 200].map((fee) => (
                <button
                  key={fee}
                  onClick={() => handleMaxFeeChange(fee)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.maxFee === fee
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}
                >
                  ${fee}+
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFiltersComponent;
