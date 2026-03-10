import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { predictionsApi } from '../services/api';

interface PredictionFormProps {
  onSubmit?: (result: any) => void;
  isLoading?: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.Partner) newErrors.Partner = 'Partner status is required';
    if (!formData.Dependents) newErrors.Dependents = 'Dependents status is required';

    // Validate numeric fields
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
    // Clear error for this field when user starts typing
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
    setResult(null);

    try {
      // Convert string values to correct types
      const payload = {
        gender: formData.gender,
        SeniorCitizen: parseInt(formData.SeniorCitizen),
        Partner: formData.Partner,
        Dependents: formData.Dependents,
        tenure: parseInt(formData.tenure),
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
      const result = response.data; // Extract data from axios response
      setResult(result);
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

  const handleReset = () => {
    setFormData({
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
    setErrors({});
    setSubmitError(null);
    setResult(null);
  };

  const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

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

  if (result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Prediction Result</h3>
        <div className="space-y-2 mb-4">
          <p className="text-green-700">
            <span className="font-semibold">Churn Probability:</span> {(result.prediction.churnProbability * 100).toFixed(2)}%
          </p>
          <p className="text-green-700">
            <span className="font-semibold">Risk Level:</span> {result.prediction.riskLevel}
          </p>
          <p className="text-green-700">
            <span className="font-semibold">Priority:</span> {result.prediction.priority}
          </p>
          <p className="text-green-700">
            <span className="font-semibold">Recommendation:</span> {result.prediction.recommendation}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
        >
          Make Another Prediction
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Churn Prediction</h2>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      {/* Demographics Section */}
      <FormSection title="Demographics">
        <FormField
          label="Gender"
          name="gender"
          options={['Male', 'Female']}
          value={formData.gender}
          onChange={handleInputChange}
          error={errors.gender}
        />
        <FormField
          label="Senior Citizen"
          name="SeniorCitizen"
          options={['0 - No', '1 - Yes']}
          value={formData.SeniorCitizen}
          onChange={handleInputChange}
        />
        <FormField
          label="Partner"
          name="Partner"
          options={['Yes', 'No']}
          value={formData.Partner}
          onChange={handleInputChange}
          error={errors.Partner}
        />
        <FormField
          label="Dependents"
          name="Dependents"
          options={['Yes', 'No']}
          value={formData.Dependents}
          onChange={handleInputChange}
          error={errors.Dependents}
        />
      </FormSection>

      {/* Account Section */}
      <FormSection title="Account Information">
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
      </FormSection>

      {/* Phone Services Section */}
      <FormSection title="Phone Services">
        <FormField
          label="Phone Service"
          name="PhoneService"
          options={['Yes', 'No']}
          value={formData.PhoneService}
          onChange={handleInputChange}
        />
        <FormField
          label="Multiple Lines"
          name="MultipleLines"
          options={['Yes', 'No', 'No phone service']}
          value={formData.MultipleLines}
          onChange={handleInputChange}
        />
      </FormSection>

      {/* Internet Services Section */}
      <FormSection title="Internet Services">
        <FormField
          label="Internet Service"
          name="InternetService"
          options={['DSL', 'Fiber optic', 'No']}
          value={formData.InternetService}
          onChange={handleInputChange}
        />
        <FormField
          label="Online Security"
          name="OnlineSecurity"
          options={['Yes', 'No', 'No internet service']}
          value={formData.OnlineSecurity}
          onChange={handleInputChange}
        />
        <FormField
          label="Online Backup"
          name="OnlineBackup"
          options={['Yes', 'No', 'No internet service']}
          value={formData.OnlineBackup}
          onChange={handleInputChange}
        />
        <FormField
          label="Device Protection"
          name="DeviceProtection"
          options={['Yes', 'No', 'No internet service']}
          value={formData.DeviceProtection}
          onChange={handleInputChange}
        />
        <FormField
          label="Tech Support"
          name="TechSupport"
          options={['Yes', 'No', 'No internet service']}
          value={formData.TechSupport}
          onChange={handleInputChange}
        />
        <FormField
          label="Streaming TV"
          name="StreamingTV"
          options={['Yes', 'No', 'No internet service']}
          value={formData.StreamingTV}
          onChange={handleInputChange}
        />
        <FormField
          label="Streaming Movies"
          name="StreamingMovies"
          options={['Yes', 'No', 'No internet service']}
          value={formData.StreamingMovies}
          onChange={handleInputChange}
        />
      </FormSection>

      {/* Billing Section */}
      <FormSection title="Billing">
        <FormField
          label="Contract"
          name="Contract"
          options={['Month-to-month', 'One year', 'Two year']}
          value={formData.Contract}
          onChange={handleInputChange}
        />
        <FormField
          label="Paperless Billing"
          name="PaperlessBilling"
          options={['Yes', 'No']}
          value={formData.PaperlessBilling}
          onChange={handleInputChange}
        />
        <FormField
          label="Payment Method"
          name="PaymentMethod"
          options={[
            'Electronic check',
            'Mailed check',
            'Bank transfer (automatic)',
            'Credit card (automatic)',
          ]}
          value={formData.PaymentMethod}
          onChange={handleInputChange}
        />
      </FormSection>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          type="submit"
          disabled={submitLoading}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition flex items-center justify-center gap-2"
        >
          {submitLoading && <Loader className="w-5 h-5 animate-spin" />}
          {submitLoading ? 'Making Prediction...' : 'Get Prediction'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition"
        >
          Reset Form
        </button>
      </div>
    </form>
  );
};

export default PredictionForm;
