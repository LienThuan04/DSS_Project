import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { predictionsApi } from '../services/api';
import PredictionResultCard from './PredictionResultCard';

interface PredictionFormProps {
  onSubmit?: (result: any) => void;
  isLoading?: boolean;
}

type Option = {
  label: string;
  value: string;
};

const yesNoOptions: Option[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const seniorOptions: Option[] = [
  { label: 'No', value: '0' },
  { label: 'Yes', value: '1' },
];

const internetOptions: Option[] = [
  { label: 'DSL', value: 'DSL' },
  { label: 'Fiber optic', value: 'Fiber optic' },
  { label: 'No internet service', value: 'No' },
];

const serviceOptions: Option[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
  { label: 'No internet service', value: 'No internet service' },
];

const paymentOptions: Option[] = [
  { label: 'Electronic check', value: 'Electronic check' },
  { label: 'Mailed check', value: 'Mailed check' },
  { label: 'Bank transfer (automatic)', value: 'Bank transfer (automatic)' },
  { label: 'Credit card (automatic)', value: 'Credit card (automatic)' },
];

const multipleLineOptions: Option[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
  { label: 'No phone service', value: 'No phone service' },
];

const getInitialFormData = () => ({
  gender: 'Male',
  SeniorCitizen: '0',
  Partner: 'No',
  Dependents: 'No',
  tenure: '12',
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'DSL',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: '65',
  TotalCharges: '780',
});

const sectionClasses = 'rounded-2xl border bg-slate-50 p-5';

const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.gender) nextErrors.gender = 'Gender is required';
    if (!formData.Partner) nextErrors.Partner = 'Partner status is required';
    if (!formData.Dependents) nextErrors.Dependents = 'Dependents status is required';

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
    setResult(null);

    try {
      const payload = {
        gender: formData.gender,
        SeniorCitizen: parseInt(formData.SeniorCitizen, 10),
        Partner: formData.Partner,
        Dependents: formData.Dependents,
        tenure: parseInt(formData.tenure, 10),
        PhoneService: formData.PhoneService,
        MultipleLines: formData.MultipleLines,
        InternetService: formData.InternetService,
        OnlineSecurity: formData.OnlineSecurity,
        OnlineBackup: formData.OnlineBackup,
        DeviceProtection: formData.DeviceProtection,
        TechSupport: formData.TechSupport,
        StreamingTV: formData.StreamingTV,
        StreamingMovies: formData.StreamingMovies,
        Contract: formData.Contract,
        PaperlessBilling: formData.PaperlessBilling,
        PaymentMethod: formData.PaymentMethod,
        MonthlyCharges: parseFloat(formData.MonthlyCharges),
        TotalCharges: parseFloat(formData.TotalCharges),
      };

      const response = await predictionsApi.predictRaw(payload);
      const predictionResult = response.data.prediction || response.data.data || response.data;

      setResult(predictionResult);

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

  const handleReset = () => {
    setFormData(getInitialFormData());
    setErrors({});
    setSubmitError(null);
    setResult(null);
  };

  const FormField: React.FC<{
    label: string;
    name: string;
    type?: string;
    value: string;
    options?: Option[];
    error?: string;
  }> = ({ label, name, type = 'text', value, options, error }) => (
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

  if (result && !onSubmit) {
    return <PredictionResultCard prediction={result} onClose={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5" size={18} />
            <p className="text-sm">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={sectionClasses}>
          <h3 className="text-base font-semibold text-slate-900">Customer profile</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField
              label="Gender"
              name="gender"
              value={formData.gender}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
              ]}
              error={errors.gender}
            />
            <FormField
              label="Senior citizen"
              name="SeniorCitizen"
              value={formData.SeniorCitizen}
              options={seniorOptions}
            />
            <FormField
              label="Partner"
              name="Partner"
              value={formData.Partner}
              options={yesNoOptions}
              error={errors.Partner}
            />
            <FormField
              label="Dependents"
              name="Dependents"
              value={formData.Dependents}
              options={yesNoOptions}
              error={errors.Dependents}
            />
          </div>
        </section>

        <section className={sectionClasses}>
          <h3 className="text-base font-semibold text-slate-900">Billing</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
              options={[
                { label: 'Month-to-month', value: 'Month-to-month' },
                { label: 'One year', value: 'One year' },
                { label: 'Two year', value: 'Two year' },
              ]}
            />
            <FormField
              label="Paperless billing"
              name="PaperlessBilling"
              value={formData.PaperlessBilling}
              options={yesNoOptions}
            />
            <FormField
              label="Payment method"
              name="PaymentMethod"
              value={formData.PaymentMethod}
              options={paymentOptions}
            />
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={sectionClasses}>
          <h3 className="text-base font-semibold text-slate-900">Phone services</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField
              label="Phone service"
              name="PhoneService"
              value={formData.PhoneService}
              options={yesNoOptions}
            />
            <FormField
              label="Multiple lines"
              name="MultipleLines"
              value={formData.MultipleLines}
              options={multipleLineOptions}
            />
          </div>
        </section>

        <section className={sectionClasses}>
          <h3 className="text-base font-semibold text-slate-900">Internet plan</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField
              label="Internet service"
              name="InternetService"
              value={formData.InternetService}
              options={internetOptions}
            />
            <FormField
              label="Online security"
              name="OnlineSecurity"
              value={formData.OnlineSecurity}
              options={serviceOptions}
            />
            <FormField
              label="Online backup"
              name="OnlineBackup"
              value={formData.OnlineBackup}
              options={serviceOptions}
            />
            <FormField
              label="Device protection"
              name="DeviceProtection"
              value={formData.DeviceProtection}
              options={serviceOptions}
            />
            <FormField
              label="Tech support"
              name="TechSupport"
              value={formData.TechSupport}
              options={serviceOptions}
            />
            <FormField
              label="Streaming TV"
              name="StreamingTV"
              value={formData.StreamingTV}
              options={serviceOptions}
            />
            <FormField
              label="Streaming movies"
              name="StreamingMovies"
              value={formData.StreamingMovies}
              options={serviceOptions}
            />
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={submitLoading} className="btn-primary flex-1 gap-2">
          {submitLoading && <Loader className="animate-spin" size={16} />}
          {submitLoading ? 'Generating prediction...' : 'Generate prediction'}
        </button>
        <button type="button" onClick={handleReset} className="btn-outline flex-1">
          Reset form
        </button>
      </div>
    </form>
  );
};

export default PredictionForm;
