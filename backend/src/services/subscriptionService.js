import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SUBSCRIPTION_PLANS = {
  // Doctor Plans
  DOCTOR_FREE: {
    id: 'doctor_free',
    name: 'Free',
    price: 0,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Basic profile listing',
      'Up to 5 photos',
      'Basic contact information',
      'Standard verification'
    ],
    limits: {
      profileViews: 100,
      analyticsAccess: false,
      telemedicineEnabled: false,
      featuredListing: false,
      prioritySupport: false
    }
  },
  DOCTOR_PRO: {
    id: 'doctor_pro',
    name: 'Pro',
    price: 299,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Enhanced profile with video',
      'Unlimited photos',
      'Analytics dashboard',
      'Telemedicine enabled',
      'Priority verification',
      'Featured in search results'
    ],
    limits: {
      profileViews: -1, // unlimited
      analyticsAccess: true,
      telemedicineEnabled: true,
      featuredListing: true,
      prioritySupport: true
    }
  },
  DOCTOR_PREMIUM: {
    id: 'doctor_premium',
    name: 'Premium',
    price: 599,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Everything in Pro',
      'Premium analytics',
      'Advanced telemedicine features',
      'Top placement in search',
      'Dedicated support',
      'Custom branding'
    ],
    limits: {
      profileViews: -1,
      analyticsAccess: true,
      telemedicineEnabled: true,
      featuredListing: true,
      prioritySupport: true
    }
  },

  // Hospital Plans
  HOSPITAL_FREE: {
    id: 'hospital_free',
    name: 'Free',
    price: 0,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Basic hospital listing',
      'Basic department information',
      'Standard verification',
      'Basic contact details'
    ],
    limits: {
      profileViews: 200,
      analyticsAccess: false,
      featuredListing: false,
      prioritySupport: false
    }
  },
  HOSPITAL_PRO: {
    id: 'hospital_pro',
    name: 'Pro',
    price: 799,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Enhanced hospital profile',
      'Detailed department pages',
      'Analytics dashboard',
      'Featured doctors section',
      'Priority verification',
      'Featured in search results'
    ],
    limits: {
      profileViews: -1,
      analyticsAccess: true,
      featuredListing: true,
      prioritySupport: true
    }
  },
  HOSPITAL_PREMIUM: {
    id: 'hospital_premium',
    name: 'Premium',
    price: 1499,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Everything in Pro',
      'Premium analytics',
      'Advanced department management',
      'Top placement in search',
      'Dedicated support',
      'Custom branding',
      'Corporate partnerships'
    ],
    limits: {
      profileViews: -1,
      analyticsAccess: true,
      featuredListing: true,
      prioritySupport: true
    }
  },

  // Company Plans
  COMPANY_BASIC: {
    id: 'company_basic',
    name: 'Basic',
    price: 1999,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Up to 100 employees',
      'Basic doctor directory',
      'Standard booking system',
      'Basic usage analytics'
    ],
    limits: {
      maxEmployees: 100,
      analyticsAccess: false,
      prioritySupport: false
    }
  },
  COMPANY_PREMIUM: {
    id: 'company_premium',
    name: 'Premium',
    price: 3999,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Up to 500 employees',
      'Enhanced doctor directory',
      'Priority booking system',
      'Advanced analytics',
      'Priority support'
    ],
    limits: {
      maxEmployees: 500,
      analyticsAccess: true,
      prioritySupport: true
    }
  },
  COMPANY_ENTERPRISE: {
    id: 'company_enterprise',
    name: 'Enterprise',
    price: 7999,
    currency: 'ZAR',
    billingCycle: 'MONTHLY',
    features: [
      'Unlimited employees',
      'Custom integrations',
      'Advanced analytics',
      'Dedicated support',
      'Custom branding',
      'API access'
    ],
    limits: {
      maxEmployees: -1,
      analyticsAccess: true,
      prioritySupport: true
    }
  }
};

class SubscriptionService {
  /**
   * Get subscription plan by ID
   */
  getPlanById(planId) {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    return plan || null;
  }

  /**
   * Get all available plans for a specific type
   */
  getPlansByType(type) {
    const prefix = type.toLowerCase();
    return Object.values(SUBSCRIPTION_PLANS).filter(plan => 
      plan.id.startsWith(prefix)
    );
  }

  /**
   * Create a new subscription for a doctor
   */
  async createDoctorSubscription(
    doctorId,
    planId,
    paymentMethod,
    paymentId,
    billingCycle = 'MONTHLY'
  ) {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Calculate amount (apply discount for yearly billing)
    let amount = plan.price;
    if (billingCycle === 'YEARLY') {
      amount = plan.price * 12 * 0.8; // 20% discount for yearly
    }

    const subscription = await prisma.doctorSubscription.create({
      data: {
        doctorId,
        plan: plan.name.toUpperCase(),
        startDate,
        endDate,
        amount,
        currency: plan.currency,
        paymentMethod,
        paymentId,
        billingCycle
      }
    });

    // Update doctor's subscription level
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        subscriptionLevel: plan.name.toUpperCase(),
        subscriptionExpiry: endDate,
        analyticsEnabled: plan.limits.analyticsAccess || false,
        telemedicineEnabled: plan.limits.telemedicineEnabled || false
      }
    });

    return subscription;
  }

  /**
   * Create a new subscription for a hospital
   */
  async createHospitalSubscription(
    hospitalId,
    planId,
    paymentMethod,
    paymentId,
    billingCycle = 'MONTHLY'
  ) {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Calculate amount (apply discount for yearly billing)
    let amount = plan.price;
    if (billingCycle === 'YEARLY') {
      amount = plan.price * 12 * 0.8; // 20% discount for yearly
    }

    const subscription = await prisma.hospitalSubscription.create({
      data: {
        hospitalId,
        plan: plan.name.toUpperCase(),
        startDate,
        endDate,
        amount,
        currency: plan.currency,
        paymentMethod,
        paymentId,
        billingCycle
      }
    });

    // Update hospital's subscription level
    await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        subscriptionLevel: plan.name.toUpperCase(),
        subscriptionExpiry: endDate,
        analyticsEnabled: plan.limits.analyticsAccess || false
      }
    });

    return subscription;
  }

  /**
   * Create a new company subscription
   */
  async createCompanySubscription(
    companyData,
    planId,
    paymentMethod,
    paymentId,
    billingCycle = 'MONTHLY'
  ) {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Calculate amount (apply discount for yearly billing)
    let amount = plan.price;
    if (billingCycle === 'YEARLY') {
      amount = plan.price * 12 * 0.8; // 20% discount for yearly
    }

    const company = await prisma.companyAccount.create({
      data: {
        ...companyData,
        plan: plan.name.toUpperCase(),
        startDate,
        endDate,
        amount,
        currency: plan.currency,
        paymentMethod,
        paymentId,
        billingCycle,
        maxEmployees: plan.limits.maxEmployees || 100,
        analyticsEnabled: plan.limits.analyticsAccess || false,
        prioritySupport: plan.limits.prioritySupport || false
      }
    });

    return company;
  }

  /**
   * Check if a doctor's subscription is active
   */
  async isDoctorSubscriptionActive(doctorId) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { subscriptionLevel: true, subscriptionExpiry: true }
    });

    if (!doctor || doctor.subscriptionLevel === 'FREE') {
      return false;
    }

    return doctor.subscriptionExpiry ? doctor.subscriptionExpiry > new Date() : false;
  }

  /**
   * Check if a hospital's subscription is active
   */
  async isHospitalSubscriptionActive(hospitalId) {
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { subscriptionLevel: true, subscriptionExpiry: true }
    });

    if (!hospital || hospital.subscriptionLevel === 'FREE') {
      return false;
    }

    return hospital.subscriptionExpiry ? hospital.subscriptionExpiry > new Date() : false;
  }

  /**
   * Get subscription details for a doctor
   */
  async getDoctorSubscription(doctorId) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return doctor;
  }

  /**
   * Get subscription details for a hospital
   */
  async getHospitalSubscription(hospitalId) {
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return hospital;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, type) {
    const updateData = {
      status: 'CANCELLED',
      updatedAt: new Date()
    };

    switch (type) {
      case 'DOCTOR':
        return await prisma.doctorSubscription.update({
          where: { id: subscriptionId },
          data: updateData
        });
      case 'HOSPITAL':
        return await prisma.hospitalSubscription.update({
          where: { id: subscriptionId },
          data: updateData
        });
      case 'COMPANY':
        return await prisma.companyAccount.update({
          where: { id: subscriptionId },
          data: updateData
        });
      default:
        throw new Error('Invalid subscription type');
    }
  }

  /**
   * Upgrade or downgrade a subscription
   */
  async changeSubscription(
    entityId,
    newPlanId,
    type,
    paymentMethod,
    paymentId,
    billingCycle = 'MONTHLY'
  ) {
    // Cancel current subscription
    const currentSubscription = await this.getCurrentSubscription(entityId, type);
    if (currentSubscription) {
      await this.cancelSubscription(currentSubscription.id, type);
    }

    // Create new subscription
    if (type === 'DOCTOR') {
      return await this.createDoctorSubscription(entityId, newPlanId, paymentMethod, paymentId, billingCycle);
    } else {
      return await this.createHospitalSubscription(entityId, newPlanId, paymentMethod, paymentId, billingCycle);
    }
  }

  /**
   * Get current active subscription
   */
  async getCurrentSubscription(entityId, type) {
    const whereClause = {
      status: 'ACTIVE',
      endDate: { gt: new Date() }
    };

    switch (type) {
      case 'DOCTOR':
        const doctorSub = await prisma.doctorSubscription.findFirst({
          where: { doctorId: entityId, ...whereClause },
          orderBy: { createdAt: 'desc' }
        });
        return doctorSub;
      case 'HOSPITAL':
        const hospitalSub = await prisma.hospitalSubscription.findFirst({
          where: { hospitalId: entityId, ...whereClause },
          orderBy: { createdAt: 'desc' }
        });
        return hospitalSub;
      default:
        return null;
    }
  }

  /**
   * Check subscription limits
   */
  async checkSubscriptionLimits(entityId, type, limitType) {
    const subscription = await this.getCurrentSubscription(entityId, type);
    if (!subscription) {
      return false; // No active subscription
    }

    const plan = this.getPlanById(`${type.toLowerCase()}_${subscription.plan.toLowerCase()}`);
    if (!plan) {
      return false;
    }

    // Check specific limits based on limitType
    switch (limitType) {
      case 'analytics':
        return plan.limits.analyticsAccess || false;
      case 'telemedicine':
        return plan.limits.telemedicineEnabled || false;
      case 'featured':
        return plan.limits.featuredListing || false;
      default:
        return false;
    }
  }
}

export default SubscriptionService;