'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ChartBarIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  limits: {
    profileViews?: number;
    analyticsAccess?: boolean;
    telemedicineEnabled?: boolean;
    featuredListing?: boolean;
    prioritySupport?: boolean;
    maxEmployees?: number;
  };
}

interface SubscriptionManagerProps {
  entityId: string;
  entityType: 'DOCTOR' | 'HOSPITAL';
  currentPlan?: string;
  onPlanChange?: (planId: string) => void;
}

export default function SubscriptionManager({ 
  entityId, 
  entityType, 
  currentPlan = 'FREE',
  onPlanChange 
}: SubscriptionManagerProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [entityType]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`/api/subscriptions/plans?type=${entityType}`);
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setIsUpgrading(true);
    try {
      // In a real implementation, this would integrate with payment gateway
      const response = await fetch(`/api/subscriptions/${entityType.toLowerCase()}/${entityId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod: 'STRIPE', // Placeholder
          paymentId: 'payment_' + Date.now(), // Placeholder
          billingCycle
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onPlanChange?.(selectedPlan);
        alert('Subscription upgraded successfully!');
      } else {
        alert('Failed to upgrade subscription: ' + data.message);
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to upgrade subscription');
    } finally {
      setIsUpgrading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <ShieldCheckIcon className="w-6 h-6 text-gray-500" />;
      case 'pro':
        return <StarIcon className="w-6 h-6 text-blue-500" />;
      case 'premium':
        return <StarIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return <ShieldCheckIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'border-gray-200 bg-gray-50';
      case 'pro':
        return 'border-blue-200 bg-blue-50';
      case 'premium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatPrice = (price: number, currency: string, cycle: string) => {
    if (price === 0) return 'Free';
    
    const formattedPrice = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price);
    
    return `${formattedPrice}/${cycle.toLowerCase()}`;
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('analytics') || feature.includes('Analytics')) {
      return <ChartBarIcon className="w-4 h-4 text-green-500" />;
    }
    if (feature.includes('video') || feature.includes('Video') || feature.includes('telemedicine')) {
      return <VideoCameraIcon className="w-4 h-4 text-blue-500" />;
    }
    if (feature.includes('verification') || feature.includes('Verification')) {
      return <ShieldCheckIcon className="w-4 h-4 text-purple-500" />;
    }
    return <CheckIcon className="w-4 h-4 text-green-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'YEARLY'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-green-600">(20% off)</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name.toUpperCase() === currentPlan;
          const isSelected = selectedPlan === plan.id;
          const isUpgrade = plan.price > 0 && !isCurrentPlan;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary-500 shadow-lg' 
                  : 'hover:shadow-md'
              } ${getPlanColor(plan.name)}`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="success" className="px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(plan.price, plan.currency, billingCycle)}
                  </div>
                  
                  {billingCycle === 'YEARLY' && plan.price > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(plan.price * 12, plan.currency, 'MONTHLY')}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Button */}
      {selectedPlan && selectedPlan !== currentPlan.toLowerCase() && (
        <div className="text-center">
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            size="lg"
            className="px-8"
          >
            {isUpgrading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Upgrade Now'
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-2">
            Secure payment processing via Stripe
          </p>
        </div>
      )}

      {/* Plan Comparison */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Plan Comparison
        </h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Features
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Profile Views</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-sm text-gray-700">
                    {plan.limits.profileViews === -1 ? 'Unlimited' : plan.limits.profileViews || 'Limited'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Analytics Dashboard</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-sm text-gray-700">
                    {plan.limits.analyticsAccess ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Telemedicine</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-sm text-gray-700">
                    {plan.limits.telemedicineEnabled ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Featured Listing</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-sm text-gray-700">
                    {plan.limits.featuredListing ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Priority Support</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-sm text-gray-700">
                    {plan.limits.prioritySupport ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

