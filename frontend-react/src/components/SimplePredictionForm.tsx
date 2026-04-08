import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { predictionsApi } from '../services/api';

interface SimplePredictionFormProps {
  onSubmit?: (result: any) => void;
}

type Option = {
  label: string;
  value: string;
};

const contractOptions: Option[] = [
  { label: 'Month-to-month', value: 'Month-to-month' },
  { label: 'One year', value: 'One year' },
  { label: 'Two year', value: 'Two year' },
];

const internetOptions: Option[] = [
  { label: 'DSL', value: 'DSL' },
  { label: 'Fiber optic', value: 'Fiber optic' },
  { label: 'No internet service', value: 'No' },
];

const yesNoOptions: Option[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const seniorOptions: Option[] = [
  { label: 'No', value: '0' },
  { label: 'Yes', value: '1' },
];

const getInitialFormData = () => ({
  tenure: '12',
  MonthlyCharges: '65',
  TotalCharges: '780',
  Contract: 'Month-to-month',
  InternetService: 'DSL',
  SeniorCitizen: '0',
  Partner: 'No',
  PhoneService: 'Yes',
});

const SimplePredictionForm: React.FC<SimplePredictionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    const tenure = parseInt(formData.tenure, 10);
    if (Number.isNaN(tenure) || tenure < 0 || tenure > 72) {
      nextErrors.tenure = 'Tenure must be between 0 and 72 months';
    }

    const monthlyCharges = parseFloat(formData.MonthlyCharges);
    if (Number.isNaN(monthlyCharges) || monthlyCharges < 0) {
      nextErrors.MonthlyCharges = 'Monthly charges must be a positive number';
    }

    const totalCharges = parseFloat(formData.TotalCharges);
    if (Number.isNaN(totalCharges) || totalCharges < 0) {
      nextErrors.TotalCharges = 'Total charges must be a positive number';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const payload = {
        gender: 'Male',
        SeniorCitizen: parseInt(formData.SeniorCitizen, 10),
        Partner: formData.Partner,
        Dependents: 'No',
        tenure: parseInt(formData.tenure, 10),
        PhoneService: formData.PhoneService,
        MultipleLines: 'No',
        InternetService: formData.InternetService,
        OnlineSecurity: 'No',
        OnlineBackup: 'No',
        DeviceProtection: 'No',
        TechSupport: 'No',
        StreamingTV: 'No',
        StreamingMovies: 'No',
        Contract: formData.Contract,
        PaperlessBilling: 'Yes',
        PaymentMethod: 'Electronic check',
        MonthlyCharges: parseFloat(formData.MonthlyCharges),
        TotalCharges: parseFloat(formData.TotalCharges),
      };

      const response = await predictionsApi.predictRaw(payload);
      const predictionResult = response.data.prediction || response.data.data || response.data;

      if (onSubmit) {
        onSubmit(predictionResult);
      }
    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message || error?.message || 'Failed to make prediction'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const FormField: React.FC<{
    label: string;
    name: string;
    value: string;
    type?: string;
    options?: Option[];
    error?: string;
  }> = ({ label, name, value, type = 'text', options, error }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={handleInputChange}
          className={`input ${error ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
        >
          {options.map((option) => (
            <option key={`${name}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          className={`input ${error ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border bg-slate-50 p-5">
        <p className="page-kicker">Quick Form</p>
        <h3 className="text-xl font-semibold text-slate-900">Minimal churn scoring</h3>
        <p className="mt-2 text-sm text-slate-500">
          Use the most impactful billing and contract fields for a faster score.
        </p>
      </div>

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5" size={18} />
            <p className="text-sm">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Tenure (months)"
          name="tenure"
          type="number"
          value={formData.tenure}
          error={errors.tenure}
        />
        <FormField
          label="Monthly charges"
          name="MonthlyCharges"
          type="number"
          value={formData.MonthlyCharges}
          error={errors.MonthlyCharges}
        />
        <FormField
          label="Total charges"
          name="TotalCharges"
          type="number"
          value={formData.TotalCharges}
          error={errors.TotalCharges}
        />
        <FormField
          label="Contract"
          name="Contract"
          value={formData.Contract}
          options={contractOptions}
        />
        <FormField
          label="Internet service"
          name="InternetService"
          value={formData.InternetService}
          options={internetOptions}
        />
        <FormField
          label="Senior citizen"
          name="SeniorCitizen"
          value={formData.SeniorCitizen}
          options={seniorOptions}
        />
        <FormField label="Partner" name="Partner" value={formData.Partner} options={yesNoOptions} />
        <FormField
          label="Phone service"
          name="PhoneService"
          value={formData.PhoneService}
          options={yesNoOptions}
        />
      </div>

      <button type="submit" disabled={submitLoading} className="btn-primary w-full gap-2">
        {submitLoading && <Loader className="animate-spin" size={16} />}
        {submitLoading ? 'Predicting...' : 'Predict churn risk'}
      </button>
    </form>
  );
};

export default SimplePredictionForm;
