import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { predictionsApi } from '../services/api';

interface SimplePredictionFormProps {
  onSubmit?: (result: any) => void;
}

const SimplePredictionForm: React.FC<SimplePredictionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    tenure: '12',
    MonthlyCharges: '65',
    TotalCharges: '780',
    Contract: 'Month-to-month',
    InternetService: 'DSL',
    SeniorCitizen: '0',
    Partner: 'No',
    PhoneService: 'Yes',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const tenure = parseInt(formData.tenure);
    if (isNaN(tenure) || tenure < 0 || tenure > 72) {
      newErrors.tenure = 'Tenure must be between 0 and 72 months';
    }

    const monthlyCharges = parseFloat(formData.MonthlyCharges);
    if (isNaN(monthlyCharges) || monthlyCharges < 0) {
      newErrors.MonthlyCharges = 'Monthly charges must be a positive number';
    }

    const totalCharges = parseFloat(formData.TotalCharges);
    if (isNaN(totalCharges) || totalCharges < 0) {
      newErrors.TotalCharges = 'Total charges must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Use default values for other fields not in simple form
      const payload = {
        gender: 'Male',
        SeniorCitizen: parseInt(formData.SeniorCitizen),
        Partner: formData.Partner,
        Dependents: 'No',
        tenure: parseInt(formData.tenure),
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
      const result = response.data.prediction || response.data.data || response.data;
      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to make prediction';
      setSubmitError(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const FormField: React.FC<{
    label: string;
    name: string;
    type?: string;
    value: string;
    options?: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    error?: string;
    required?: boolean;
  }> = ({ label, name, type = 'text', value, options, onChange, error, required = true }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        >
          {options.map((opt, idx) => (
            <option key={`${opt}-${idx}`} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
      )}
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Quick Prediction</h2>
      <p className="text-sm text-gray-600 mb-6">Enter key information to predict churn risk</p>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField
          label="Tenure (months)"
          name="tenure"
          type="number"
          value={formData.tenure}
          onChange={handleInputChange}
          error={errors.tenure}
        />
        <FormField
          label="Monthly Charges ($)"
          name="MonthlyCharges"
          type="number"
          value={formData.MonthlyCharges}
          onChange={handleInputChange}
          error={errors.MonthlyCharges}
        />
        <FormField
          label="Total Charges ($)"
          name="TotalCharges"
          type="number"
          value={formData.TotalCharges}
          onChange={handleInputChange}
          error={errors.TotalCharges}
        />
        <FormField
          label="Contract Type"
          name="Contract"
          options={['Month-to-month', 'One year', 'Two year']}
          value={formData.Contract}
          onChange={handleInputChange}
        />
        <FormField
          label="Internet Service"
          name="InternetService"
          options={['DSL', 'Fiber optic', 'No']}
          value={formData.InternetService}
          onChange={handleInputChange}
        />
        <FormField
          label="Senior Citizen"
          name="SeniorCitizen"
          options={['0 - No', '1 - Yes']}
          value={formData.SeniorCitizen}
          onChange={handleInputChange}
        />
        <FormField
          label="Has Partner"
          name="Partner"
          options={['Yes', 'No']}
          value={formData.Partner}
          onChange={handleInputChange}
        />
        <FormField
          label="Phone Service"
          name="PhoneService"
          options={['Yes', 'No']}
          value={formData.PhoneService}
          onChange={handleInputChange}
        />
      </div>

      <button
        type="submit"
        disabled={submitLoading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md transition flex items-center justify-center gap-2"
      >
        {submitLoading && <span className="animate-spin">⏳</span>}
        {submitLoading ? 'Predicting...' : 'Predict Churn Risk'}
      </button>
    </form>
  );
};

export default SimplePredictionForm;
