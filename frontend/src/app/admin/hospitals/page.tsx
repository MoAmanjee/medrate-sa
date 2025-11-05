'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ImportStats {
  totalHospitals: number;
  byType: Array<{ type: string; count: number }>;
  byProvince: Array<{ province: string; count: number }>;
  byDataSource: Array<{ source: string; count: number }>;
  withCoordinates: number;
  lastUpdated: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    totalFetched: number;
    totalProcessed: number;
    totalInserted: number;
    totalUpdated: number;
    totalSkipped: number;
  };
  error?: string;
}

export default function HospitalAdminPage() {
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [lastImportTime, setLastImportTime] = useState<string | null>(null);

  // Fetch import statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/hospital-import/import-statistics');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Import all healthcare facilities
  const importAllFacilities = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const response = await fetch('/api/hospital-import/import-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        setLastImportTime(new Date().toLocaleString());
        // Refresh stats after successful import
        await fetchStats();
      }
    } catch (error) {
      console.error('Error importing facilities:', error);
      setImportResult({
        success: false,
        message: 'Failed to import facilities',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Import by type
  const importByType = async (amenityType: string) => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const response = await fetch(`/api/hospital-import/import-by-type/${amenityType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        setLastImportTime(new Date().toLocaleString());
        await fetchStats();
      }
    } catch (error) {
      console.error('Error importing by type:', error);
      setImportResult({
        success: false,
        message: `Failed to import ${amenityType} facilities`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Cleanup duplicates
  const cleanupDuplicates = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const response = await fetch('/api/hospital-import/cleanup-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      setImportResult({
        success: false,
        message: 'Failed to cleanup duplicates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hospital Data Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Import and manage healthcare facilities from OpenStreetMap
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ClockIcon className="w-4 h-4" />
                <span>Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.totalHospitals || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Facilities</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.withCoordinates || 0}
                    </div>
                    <div className="text-sm text-gray-600">With Coordinates</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.byProvince.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Provinces Covered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowPathIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.byDataSource.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Data Sources</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Full Import */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Full Data Import
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import all healthcare facilities (hospitals, clinics, doctors, pharmacies) from OpenStreetMap.
                  This may take several minutes.
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={importAllFacilities}
                    disabled={isImporting}
                    className="w-full"
                  >
                    {isImporting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Import All Facilities
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-500">
                    Last import: {lastImportTime || 'Never'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selective Import */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selective Import
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import specific types of healthcare facilities to avoid rate limiting.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => importByType('hospital')}
                    disabled={isImporting}
                    size="sm"
                  >
                    Hospitals
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => importByType('clinic')}
                    disabled={isImporting}
                    size="sm"
                  >
                    Clinics
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => importByType('doctors')}
                    disabled={isImporting}
                    size="sm"
                  >
                    Doctors
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => importByType('pharmacy')}
                    disabled={isImporting}
                    size="sm"
                  >
                    Pharmacies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Result */}
          {importResult && (
            <Card className={`mb-8 ${importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {importResult.success ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {importResult.success ? 'Import Successful' : 'Import Failed'}
                    </h3>
                    <div className={`mt-1 text-sm ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      <p>{importResult.message}</p>
                      {importResult.data && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                          <div>Fetched: {importResult.data.totalFetched}</div>
                          <div>Processed: {importResult.data.totalProcessed}</div>
                          <div>Inserted: {importResult.data.totalInserted}</div>
                          <div>Updated: {importResult.data.totalUpdated}</div>
                          <div>Skipped: {importResult.data.totalSkipped}</div>
                        </div>
                      )}
                      {importResult.error && (
                        <p className="mt-1 font-mono text-xs">{importResult.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By Type */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Facilities by Type
                </h3>
                <div className="space-y-3">
                  {stats?.byType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant={
                          item.type === 'PUBLIC' ? 'info' : 
                          item.type === 'PRIVATE' ? 'secondary' : 
                          'warning'
                        }>
                          {item.type}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Province */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Facilities by Province
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {stats?.byProvince.map((item) => (
                    <div key={item.province} className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {item.province}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Management Actions */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Management
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={cleanupDuplicates}
                  disabled={isImporting}
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Cleanup Duplicates
                </Button>
                
                <Button
                  variant="outline"
                  onClick={fetchStats}
                  disabled={isLoading}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

