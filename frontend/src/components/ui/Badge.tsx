import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-secondary-100 text-secondary-800',
      warning: 'bg-accent-100 text-accent-800',
      danger: 'bg-alert-100 text-alert-800',
      info: 'bg-primary-100 text-primary-800',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2.5 py-1.5 text-sm',
      lg: 'px-3 py-2 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

interface VerificationBadgeProps {
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_VERIFIED';
  role: 'DOCTOR' | 'HOSPITAL' | 'PATIENT';
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, role, className }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: '✓',
          text: role === 'DOCTOR' ? 'Verified Doctor' : role === 'HOSPITAL' ? 'Verified Hospital' : 'Verified Patient',
          variant: 'success' as const,
          tooltip: 'This account has been verified by our team'
        };
      case 'PENDING':
        return {
          icon: '⏳',
          text: 'Verification Pending',
          variant: 'warning' as const,
          tooltip: 'Verification is under review'
        };
      case 'REJECTED':
        return {
          icon: '✗',
          text: 'Verification Rejected',
          variant: 'danger' as const,
          tooltip: 'Verification was rejected'
        };
      default:
        return {
          icon: '?',
          text: 'Not Verified',
          variant: 'default' as const,
          tooltip: 'This account is not verified'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors',
        {
          'bg-secondary-100 text-secondary-800': config.variant === 'success',
          'bg-accent-100 text-accent-800': config.variant === 'warning',
          'bg-alert-100 text-alert-800': config.variant === 'danger',
          'bg-gray-100 text-gray-800': config.variant === 'default',
        },
        className
      )}
      title={config.tooltip}
    >
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </div>
  );
};

interface RatingBadgeProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showReviews?: boolean;
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  totalReviews, 
  size = 'md', 
  showReviews = true 
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const starSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn('inline-flex items-center gap-1', sizeClasses[size])}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              starSize[size],
              star <= rating ? 'text-accent-500' : 'text-gray-300'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
      {showReviews && totalReviews && (
        <span className="text-gray-500">({totalReviews})</span>
      )}
    </div>
  );
};

export { Badge, VerificationBadge, RatingBadge };
