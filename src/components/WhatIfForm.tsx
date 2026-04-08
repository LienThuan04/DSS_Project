import React, { useState } from 'react';
import { ArrowRight, Wand2 } from 'lucide-react';

interface WhatIfFormProps {
  onSubmit: (request: any) => void;
  isLoading: boolean;
  error: string | null;
  customers?: any[];
}

const WhatIfForm: React.FC<WhatIfFormProps> = ({
  onSubmit,
  isLoading,
  error,
  customers = [],
}) => {
  const [step, setStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSelectCustomer = () => {
    if (!selectedCustomerId) {
      setFormError('Please select a customer.');
      return;
    }

    setFormError(null);
    setStep(2);
  };

  const handleChangeInput = (field: string, value: any) => {
    setChanges((prev) => {
      const next = { ...prev };

      if (value === '' || Number.isNaN(value)) {
        delete next[field];
      } else {
        next[field] = value;
      }

      return next;
    });
  };

  const handleSubmit = () => {
    if (Object.keys(changes).length === 0) {
      setFormError('Please provide at least one change to compare.');
      return;
    }

    setFormError(null);
    onSubmit({
      customerId: selectedCustomerId,
      changes,
      scenarioName: scenarioName || 'Scenario variation',
    });
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
      <div className="space-y-5">
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
              <Wand2 size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Step 1</p>
              <p className="text-sm text-slate-500">Choose the baseline customer.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Base customer</label>
          <select
            value={selectedCustomerId}
            onChange={(event) => setSelectedCustomerId(event.target.value)}
            className="input"
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customerID} | ${customer.MonthlyCharges?.toFixed(2) || 'N/A'} / mo
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">{customers.length} customers available</p>
        </div>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <button onClick={handleSelectCustomer} disabled={isLoading} className="btn-primary w-full gap-2">
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">Step 2</p>
        <p className="mt-1 text-sm text-slate-500">
          Change one or more attributes and compare against the selected baseline.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Scenario name</label>
        <input
          type="text"
          value={scenarioName}
          onChange={(event) => setScenarioName(event.target.value)}
          placeholder="Example: Upgrade to annual contract"
          className="input"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tenure (months)</label>
          <input
            type="number"
            value={changes.tenure ?? ''}
            onChange={(event) =>
              handleChangeInput(
                'tenure',
                event.target.value === '' ? '' : parseInt(event.target.value, 10)
              )
            }
            placeholder="24"
            className="input"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Monthly charges</label>
          <input
            type="number"
            step="0.01"
            value={changes.MonthlyCharges ?? ''}
            onChange={(event) =>
              handleChangeInput(
                'MonthlyCharges',
                event.target.value === '' ? '' : parseFloat(event.target.value)
              )
            }
            placeholder="85.50"
            className="input"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Contract</label>
          <select
            value={changes.Contract ?? ''}
            onChange={(event) => handleChangeInput('Contract', event.target.value)}
            className="input"
          >
            <option value="">No change</option>
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One year</option>
            <option value="Two year">Two year</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Internet service</label>
          <select
            value={changes.InternetService ?? ''}
            onChange={(event) => handleChangeInput('InternetService', event.target.value)}
            className="input"
          >
            <option value="">No change</option>
            <option value="DSL">DSL</option>
            <option value="Fiber optic">Fiber optic</option>
            <option value="No">No internet service</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Payment method</label>
          <select
            value={changes.PaymentMethod ?? ''}
            onChange={(event) => handleChangeInput('PaymentMethod', event.target.value)}
            className="input"
          >
            <option value="">No change</option>
            <option value="Electronic check">Electronic check</option>
            <option value="Mailed check">Mailed check</option>
            <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
            <option value="Credit card (automatic)">Credit card (automatic)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Online security</label>
          <select
            value={changes.OnlineSecurity ?? ''}
            onChange={(event) => handleChangeInput('OnlineSecurity', event.target.value)}
            className="input"
          >
            <option value="">No change</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">
          Pending changes ({Object.keys(changes).length})
        </p>
        {Object.keys(changes).length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No modifications added yet.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(changes).map(([key, value]) => (
              <span key={key} className="badge badge-neutral">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>

      {formError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleReset} disabled={isLoading} className="btn-outline flex-1">
          Reset
        </button>
        <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1">
          {isLoading ? 'Comparing...' : 'Compare scenario'}
        </button>
      </div>
    </div>
  );
};

export default WhatIfForm;
