import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { collection, addDoc, updateDoc, doc, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Star, X } from 'lucide-react';

interface ReviewModalProps {
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const schema = yup.object({
  rating: yup.number().min(1, 'Please select a rating').max(5, 'Rating must be 5 or less').required('Rating is required'),
  comment: yup.string().min(10, 'Comment must be at least 10 characters').required('Comment is required'),
});

type FormData = yup.InferType<typeof schema>;

const ReviewModal: React.FC<ReviewModalProps> = ({
  doctorId,
  doctorName,
  appointmentId,
  onClose,
  onReviewSubmitted,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, userData } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const selectedRating = watch('rating') || 0;

  const handleRatingClick = (rating: number) => {
    setValue('rating', rating);
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !userData) return;

    setLoading(true);
    try {
      // Add review to reviews collection
      const reviewData = {
        doctorId,
        userId: user.uid,
        userName: `${userData.firstName} ${userData.lastName}`,
        rating: data.rating,
        comment: data.comment,
        appointmentId,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'reviews'), reviewData);

      // Update appointment status to completed
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'completed'
      });

      // Update doctor's average rating
      await updateDoctorRating(doctorId);

      toast.success('Review submitted successfully!');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorRating = async (doctorId: string) => {
    try {
      // Get all reviews for this doctor
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('doctorId', '==', doctorId)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      
      if (querySnapshot.empty) return;

      // Calculate average rating
      const reviews = querySnapshot.docs.map(doc => doc.data());
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Update doctor's rating
      await updateDoc(doc(db, 'users', doctorId), {
        rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
      });
    } catch (error) {
      console.error('Error updating doctor rating:', error);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={interactive ? () => handleRatingClick(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        className={`h-8 w-8 transition-colors ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        } ${
          i < (interactive ? hoveredRating || selectedRating : rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      >
        <Star className="h-full w-full" />
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Rate Your Experience
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How was your appointment with {doctorName}?
            </h3>
            <p className="text-gray-600 text-sm">
              Your feedback helps other patients make informed decisions.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating *
              </label>
              <div className="flex space-x-1">
                {renderStars(selectedRating, true)}
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                {...register('comment')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Share your experience with this doctor..."
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
