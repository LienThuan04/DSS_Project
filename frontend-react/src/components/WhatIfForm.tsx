import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Prediction } from '../types';

interface WhatIfFormProps {
  onSubmit: (request: any) => void;
  isLoading: boolean;
  error: string | null;
  customers?: any[];
}

const WhatIfForm: React.FC<WhatIfFormProps> = ({ onSubmit, isLoading, error, customers = [] }) => {
  const [step, setStep] = useState(1); // Step 1: Select customer, Step 2: Enter changes
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSelectCustomer = () => {
    if (!selectedCustomerId) {
      setFormError('Please select a customer');
      return;
    }
    setFormError(null);
    setStep(2);
  };

  const handleChangeInput = (field: string, value: any) => {
    setChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(changes).length === 0) {
      setFormError('Please enter at least one change');
      return;
    }

    const request = {
      customerId: selectedCustomerId,
      changes,
      scenarioName: scenarioName || 'Unnamed Scenario'
    };
    
    console.log('[WhatIfForm] Submitting with customerId:', selectedCustomerId);
    console.log('[WhatIfForm] Full request:', request);

    onSubmit(request);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCustomerId('');
    setScenarioName('');
    setChanges({});
    setFormError(null);
  };

  if (step === 1) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Step 1: Select Base Customer</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                console.log('[WhatIfForm] Customer selected:', e.target.value);
                setSelectedCustomerId(e.target.value);
              }}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select a customer --</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.customerID} - ${customer.MonthlyCharges?.toFixed(2) || 'N/A'}/mo
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <div className="rounded border border-red-300 bg-red-50 p-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <button
            onClick={handleSelectCustomer}
            disabled={isLoading}
            className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            Next Step →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Step 2: Modify Attributes</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Scenario Name (optional)</label>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="e.g., 'Upgrade to Annual Contract'"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Edit Customer Attributes</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {true && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Tenure (months)</label>
                <input
                  type="number"
                  value={changes.tenure || ''}
                  onChange={(e) => handleChangeInput('tenure', parseInt(e.target.value))}
                  placeholder="e.g., 24"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Charges ($)</label>
              <input
                type="number"
                step="0.01"
                value={changes.MonthlyCharges || ''}
                onChange={(e) => handleChangeInput('MonthlyCharges', parseFloat(e.target.value))}
                placeholder="e.g., 85.50"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contract</label>
              <select
                value={changes.Contract || ''}
                onChange={(e) => handleChangeInput('Contract', e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- No change --</option>
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Internet Service</label>
              <select
                value={changes.InternetService || ''}
                onChange={(e) => handleChangeInput('InternetService', e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- No change --</option>
                <option value="DSL">DSL</option>
                <option value="Fiber optic">Fiber optic</option>
                <option value="No">No internet service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                value={changes.PaymentMethod || ''}
                onChange={(e) => handleChangeInput('PaymentMethod', e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- No change --</option>
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer">Bank transfer</option>
                <option value="Credit card">Credit card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Online Security</label>
              <select
                value={changes.OnlineSecurity || ''}
                onChange={(e) => handleChangeInput('OnlineSecurity', e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- No change --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Changes to apply: {Object.keys(changes).length}</p>
          {Object.keys(changes).length > 0 && (
            <ul className="list-inside list-disc space-y-1">
              {Object.entries(changes).map(([key, value]) => (
                <li key={key}>{key}: {String(value)}</li>
              ))}
            </ul>
          )}
        </div>

        {formError && (
          <div className="rounded border border-red-300 bg-red-50 p-3">
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Comparing...' : 'Compare Scenarios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatIfForm;
