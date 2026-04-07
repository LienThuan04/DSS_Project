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
      // Backend returns { success: true, prediction: {...} } structure
      const result = response.data.prediction || response.data.data || response.data;
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
    <div className="mb-8 pb-8 border-b border-slate-200/50">
      <h3 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
        <span className="inline-block w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
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
      <label className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
        {label} {required && <span className="text-purple-500">*</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`input ${error ? 'border-red-500 bg-red-50/80' : 'border-slate-300'}`}
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
          className={`input ${error ? 'border-red-500 bg-red-50/80' : 'border-slate-300'}`}
        />
      )}
      {error && <span className="text-red-600 text-xs mt-1.5 font-semibold">⚠️ {error}</span>}
    </div>
  );

  if (result) {
    return (
      <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-500">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h3 className="text-2xl font-black gradient-text">Prediction Result</h3>
        </div>
        <div className="space-y-4 mb-6 bg-white/50 rounded-xl p-4">
          <div className="flex justify-between items-center py-2 border-b border-emerald-200/50">
            <span className="font-semibold text-slate-700">📊 Churn Probability:</span>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{(result.prediction.churnProbability * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-emerald-200/50">
            <span className="font-semibold text-slate-700">🎯 Risk Level:</span>
            <span className="badge badge-green">{result.prediction.riskLevel}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-emerald-200/50">
            <span className="font-semibold text-slate-700">⚡ Priority:</span>
            <span className="font-bold text-purple-600">{result.prediction.priority}</span>
          </div>
          <div className="py-2">
            <span className="font-semibold text-slate-700 block mb-2">💡 Recommendation:</span>
            <p className="text-slate-700 bg-white/60 p-3 rounded-lg italic">{result.prediction.recommendation}</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="btn-success w-full"
        >
          🔄 Make Another Prediction
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-white/90 backdrop-blur">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">🤖</span>
        <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">Churn Prediction</h2>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 font-medium">{submitError}</p>
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
      <div className="flex gap-4 mt-8 flex-col sm:flex-row">
        <button
          type="submit"
          disabled={submitLoading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {submitLoading && <Loader className="w-5 h-5 animate-spin" />}
          {submitLoading ? '⏳ Making Prediction...' : '🚀 Get Prediction'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn-secondary flex-1"
        >
          🔄 Reset Form
        </button>
      </div>
    </form>
  );
};

export default PredictionForm;
