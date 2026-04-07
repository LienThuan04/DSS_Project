import React, { useState, useEffect } from 'react';
import WhatIfForm from '../components/WhatIfForm';
import ScenarioComparison from '../components/ScenarioComparison';
import { predictionsApi } from '../services/api';

interface ComparisonResult {
  scenarioName?: string;
  base: {
    churnProbability: number;
    riskLevel: string;
    recommendation: string;
    priority: string;
  };
  scenario: {
    churnProbability: number;
    riskLevel: string;
    recommendation: string;
    priority: string;
  };
  delta: {
    probabilityDelta: number;
    probabilityDeltaPercent: number;
    riskLevelChanged: boolean;
    recommendationChanged: boolean;
    priorityChanged: boolean;
    summary: string;
  };
}

interface Customer {
  id: string;
  customerID: string;
  tenure: number;
  MonthlyCharges: number;
  Contract: string;
  InternetService: string;
  PaymentMethod: string;
}

const WhatIfSimulationPage: React.FC = () => {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await predictionsApi.getCustomers();
        console.log('[WhatIf] Raw API response structure:', response);
        
        // Extract data from axios response
        const responseData = response.data || response;
        console.log('[WhatIf] Extracted responseData:', responseData);
        
        const customerList = Array.isArray(responseData) ? responseData : responseData?.data || [];
        console.log('[WhatIf] Loaded customers:', customerList.length);
        if (customerList.length > 0) {
          console.log('[WhatIf] First customer (raw):', customerList[0]);
          console.log('[WhatIf] First customer keys:', Object.keys(customerList[0]));
          console.log('[WhatIf] First customer._id:', customerList[0]._id);
          console.log('[WhatIf] First customer.id:', customerList[0].id);
        }
        
        // Map MongoDB _id to id field - _id should be present in MongoDB docs
        const customersWithId = customerList.map((c: any, idx: number) => {
          const mappedCustomer = {
            ...c,
            id: c._id || c.id // Use _id if available, fallback to id
          };
          if (idx === 0) {
            console.log('[WhatIf] First customer (after mapping):', mappedCustomer);
            console.log('[WhatIf] First customer.id (after mapping):', mappedCustomer.id);
          }
          return mappedCustomer;
        });
        
        console.log('[WhatIf] Customers with mapped ID:', customersWithId.length);
        if (customersWithId.length > 0) {
          console.log('[WhatIf] First customer (final):', customersWithId[0]);
        }
        setCustomers(customersWithId.slice(0, 100)); // Limit to 100 for dropdown
      } catch (err) {
        console.error('[WhatIf] Failed to load customers:', err);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  const handleWhatIfSubmit = async (request: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[WhatIf] Submitting request:', request);

      const response = await predictionsApi.whatIf(request);
      
      // Extract data from axios response
      const responseData = response.data || response;
      console.log('[WhatIf] Got response:', responseData);
      
      if (responseData.success && responseData.comparison) {
        setComparison(responseData.comparison);
      } else {
        setError('Failed to generate comparison');
      }
    } catch (err: any) {
      console.error('[WhatIf] Error:', err);
      setError(err?.response?.data?.message || err?.message || 'An error occurred while comparing scenarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setComparison(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">What-If Simulation</h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore how changes to customer attributes affect churn risk and recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="rounded-lg bg-white shadow">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">Configuration</h2>
                </div>
                <div className="p-6">
                  {loadingCustomers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin inline-block">
                        <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Loading customers...</p>
                    </div>
                  ) : (
                    <WhatIfForm
                      onSubmit={handleWhatIfSubmit}
                      isLoading={isLoading}
                      error={error}
                      customers={customers}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!comparison ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No Comparison Yet</h3>
                <p className="text-gray-600">
                  Fill in the configuration form to create and compare scenarios
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ScenarioComparison
                  base={comparison.base}
                  scenario={comparison.scenario}
                  delta={comparison.delta}
                  scenarioName={comparison.scenarioName}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Reset & Try Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulationPage;
