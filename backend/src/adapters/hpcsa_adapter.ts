/**
 * HPCSA (Health Professions Council of South Africa) Adapter
 * Mock and real implementations for doctor credential verification
 */

interface HPCSAVerificationResult {
  verified: boolean;
  status: 'auto_verified' | 'manual_review' | 'auto_failed';
  hpcsa_number: string;
  name_match?: boolean;
  registration_status?: string;
  registration_date?: string;
  expiry_date?: string;
  specialization?: string;
  verified_at?: string;
  error?: string;
  message: string;
}

export class HPCSAAdapter {
  private apiUrl: string;
  private apiKey: string | undefined;
  private mockMode: boolean;

  constructor() {
    this.apiUrl = process.env.HPCSA_API_URL || 'https://api.hpcsa.co.za/v1';
    this.apiKey = process.env.HPCSA_API_KEY;
    this.mockMode = process.env.HPCSA_MOCK_MODE?.toLowerCase() === 'true';
  }

  /**
   * Verify doctor credentials with HPCSA
   */
  async verifyDoctor(
    hpcsaNumber: string,
    fullName: string
  ): Promise<HPCSAVerificationResult> {
    if (this.mockMode) {
      return this.mockVerify(hpcsaNumber, fullName);
    } else {
      return this.realVerify(hpcsaNumber, fullName);
    }
  }

  /**
   * Mock HPCSA verification for development/testing
   * 
   * Mock logic:
   * - If HPCSA number starts with "MP" and has 8 chars -> verified
   * - If HPCSA number starts with "DT" and has 8 chars -> verified
   * - Otherwise -> manual review required
   */
  private mockVerify(
    hpcsaNumber: string,
    fullName: string
  ): HPCSAVerificationResult {
    const cleanedNumber = hpcsaNumber.trim().toUpperCase();

    // Mock verification logic
    if (cleanedNumber.startsWith('MP') && cleanedNumber.length === 8) {
      // Medical Practitioner - verified
      return {
        verified: true,
        status: 'auto_verified',
        hpcsa_number: cleanedNumber,
        name_match: true,
        registration_status: 'active',
        registration_date: '2010-01-15',
        expiry_date: '2025-12-31',
        specialization: 'Medical Practitioner',
        verified_at: new Date().toISOString(),
        message: 'HPCSA verification successful'
      };
    } else if (cleanedNumber.startsWith('DT') && cleanedNumber.length === 8) {
      // Dentist - verified
      return {
        verified: true,
        status: 'auto_verified',
        hpcsa_number: cleanedNumber,
        name_match: true,
        registration_status: 'active',
        registration_date: '2015-03-20',
        expiry_date: '2025-12-31',
        specialization: 'Dentist',
        verified_at: new Date().toISOString(),
        message: 'HPCSA verification successful'
      };
    } else {
      // Requires manual review
      return {
        verified: false,
        status: 'manual_review',
        hpcsa_number: cleanedNumber,
        name_match: undefined,
        registration_status: 'unknown',
        error: 'HPCSA number format not recognized',
        message: 'Manual review required'
      };
    }
  }

  /**
   * Real HPCSA API verification
   * 
   * Note: This is a placeholder. Replace with actual HPCSA API integration
   * when available.
   */
  private async realVerify(
    hpcsaNumber: string,
    fullName: string
  ): Promise<HPCSAVerificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hpcsa_number: hpcsaNumber,
          full_name: fullName
        })
      });

      if (!response.ok) {
        throw new Error(`HPCSA API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        verified: data.verified || false,
        status: data.verified ? 'auto_verified' : 'manual_review',
        hpcsa_number: hpcsaNumber,
        name_match: data.name_match || false,
        registration_status: data.status || 'unknown',
        registration_date: data.registration_date,
        expiry_date: data.expiry_date,
        specialization: data.specialization,
        verified_at: new Date().toISOString(),
        message: data.message || 'HPCSA verification completed'
      };
    } catch (error) {
      // On API failure, require manual review
      return {
        verified: false,
        status: 'manual_review',
        hpcsa_number: hpcsaNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'HPCSA API unavailable, manual review required'
      };
    }
  }
}

// Export singleton instance
export const hpcsaAdapter = new HPCSAAdapter();

