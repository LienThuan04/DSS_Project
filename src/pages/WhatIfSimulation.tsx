import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader, TrendingUp } from 'lucide-react';
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

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await predictionsApi.getCustomers();
        const responseData = response.data || response;
        const customerList = Array.isArray(responseData) ? responseData : responseData?.data || [];

        const customersWithId = customerList.map((customer: any) => ({
          ...customer,
          id: customer._id || customer.id,
        }));

        setCustomers(customersWithId.slice(0, 100));
      } catch {
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

      const response = await predictionsApi.whatIf(request);
      const responseData = response.data || response;

      if (responseData.success && responseData.comparison) {
        setComparison(responseData.comparison);
      } else {
        setError('Failed to generate comparison');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'An error occurred while comparing scenarios'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setComparison(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <p className="page-kicker">Simulation</p>
          <h1 className="page-title">What-if retention scenarios</h1>
          <p className="page-description">
            Select a base customer, modify contract or service attributes and compare how risk,
            priority and recommendation shift before making an intervention.
          </p>
        </div>
      </section>

      {error && (
        <div className="section-card p-4">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5" size={18} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="section-card p-6">
          <div className="mb-5">
            <p className="page-kicker">Configuration</p>
            <h2 className="text-xl font-semibold text-slate-900">Scenario builder</h2>
          </div>

          {loadingCustomers ? (
            <div className="empty-state min-h-[360px]">
              <Loader className="mb-4 animate-spin text-slate-900" size={24} />
              <p className="text-sm text-slate-500">Loading customers...</p>
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

        <div className="space-y-4">
          {!comparison ? (
            <div className="empty-state min-h-[520px]">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-white text-slate-900">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No comparison yet</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Choose a customer and adjust one or more attributes to see how the simulated
                scenario changes churn probability and recommended action.
              </p>
            </div>
          ) : (
            <>
              <ScenarioComparison
                base={comparison.base}
                scenario={comparison.scenario}
                delta={comparison.delta}
                scenarioName={comparison.scenarioName}
              />
              <button onClick={handleReset} className="btn-outline w-full">
                Reset comparison
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default WhatIfSimulationPage;
