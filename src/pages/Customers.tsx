import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Loader, AlertCircle, Upload, Zap } from 'lucide-react';
import { customersApi, predictionsApi } from '../services/api';
import { Customer, Prediction } from '../types';
import PredictionModal from '../components/PredictionModal';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [churnFilter, setChurnFilter] = useState<string>('all'); // all, yes, no
  const [pageInput, setPageInput] = useState<string>('1');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'quick' | 'detailed'>('quick'); // Toggle between quick and detailed form
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<any>({
    customerID: '',
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

  // Prediction modal state
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictingCustomerId, setPredictingCustomerId] = useState<string | null>(null);
  const [predicatingCustomerName, setPredicatingCustomerName] = useState<string | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Common required field validations
    if (!formData.customerID || formData.customerID.trim() === '') {
      errors.customerID = 'Customer ID is required';
    }

    if (formMode === 'quick') {
      // Quick form validation - only essential fields
      if (!formData.gender) {
        errors.gender = 'Gender is required';
      }
      if (!formData.Partner) {
        errors.Partner = 'Partner status is required';
      }
      if (!formData.InternetService) {
        errors.InternetService = 'Internet Service is required';
      }

      const tenure = parseInt(formData.tenure);
      if (isNaN(tenure) || tenure < 0 || tenure > 72) {
        errors.tenure = 'Tenure must be between 0 and 72 months';
      }

      const monthlyCharges = parseFloat(formData.MonthlyCharges);
      if (isNaN(monthlyCharges) || monthlyCharges < 0) {
        errors.MonthlyCharges = 'Monthly Charges must be a positive number';
      }

      const totalCharges = parseFloat(formData.TotalCharges);
      if (isNaN(totalCharges) || totalCharges < 0) {
        errors.TotalCharges = 'Total Charges must be a positive number';
      }
    } else {
      // Detailed form validation - all fields
      if (!formData.gender) {
        errors.gender = 'Gender is required';
      }
      if (!formData.Partner) {
        errors.Partner = 'Partner status is required';
      }
      if (!formData.Dependents) {
        errors.Dependents = 'Dependents status is required';
      }
      if (!formData.InternetService) {
        errors.InternetService = 'Internet Service is required';
      }
      if (!formData.Contract) {
        errors.Contract = 'Contract type is required';
      }
      if (!formData.PaymentMethod) {
        errors.PaymentMethod = 'Payment Method is required';
      }

      const tenure = parseInt(formData.tenure);
      if (isNaN(tenure) || tenure < 0 || tenure > 72) {
        errors.tenure = 'Tenure must be between 0 and 72 months';
      }

      const monthlyCharges = parseFloat(formData.MonthlyCharges);
      if (isNaN(monthlyCharges) || monthlyCharges < 0) {
        errors.MonthlyCharges = 'Monthly Charges must be a positive number';
      }

      const totalCharges = parseFloat(formData.TotalCharges);
      if (isNaN(totalCharges) || totalCharges < 0) {
        errors.TotalCharges = 'Total Charges must be a positive number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customersApi.list(page, 20, search);
      let filteredData = res.data.data;
      
      // Apply churn filter
      if (churnFilter !== 'all') {
        filteredData = filteredData.filter((c: Customer) => {
          if (churnFilter === 'yes') return c.Churn === 'Yes';
          if (churnFilter === 'no') return c.Churn === 'No';
          return true;
        });
      }
      
      setCustomers(filteredData);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageInput(page.toString());
    fetchCustomers();
  }, [page, search, churnFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Convert string values to proper types
      const payload = {
        customerID: formData.customerID,
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

      await customersApi.create(payload);
      setFormData({
        customerID: '',
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
      setShowForm(false);
      setFormErrors({});
      setSuccess('Customer created successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchCustomers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create customer';
      setError(errorMsg);
      console.error('Create error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await customersApi.delete(id);
        fetchCustomers();
        setSuccess('Customer deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const handlePredict = async (customerId: string, customerName?: string) => {
    try {
      setPredictingCustomerId(customerId);
      setPredicatingCustomerName(customerName || null);
      setShowPredictionModal(true);
      setPredictionLoading(true);
      setPredictionError(null);
      setPrediction(null);

      const response = await predictionsApi.predictByCustomerId(customerId);
      // Backend returns { success: true, prediction: {...} } structure
      const predictionData = response.data.prediction || response.data.data || response.data;
      
      setPrediction({
        _id: predictionData._id,
        customerId: customerId,
        customerName: customerName,
        churnProbability: predictionData.churnProbability,
        riskLevel: predictionData.riskLevel,
        recommendation: predictionData.recommendation,
        priority: predictionData.priority,
        reasonCodes: predictionData.reasonCodes,
        topFactors: predictionData.topFactors,
        createdAt: predictionData.createdAt,
        inputData: predictionData.inputData,
        status: predictionData.status,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message ||
                          'Failed to get prediction';
      setPredictionError(errorMessage);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleClosePredictionModal = () => {
    setShowPredictionModal(false);
    setPredictingCustomerId(null);
    setPredicatingCustomerName(null);
    setPrediction(null);
    setPredictionError(null);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const response = await customersApi.importCsv(formData);

      setSuccess(`Imported ${response.data.imported} customers successfully!`);
      if (response.data.errors && response.data.errors.length > 0) {
        const errorDetails = response.data.errors.map((e: any) => `${e.customer}: ${e.error}`).join('; ');
        setError(`${response.data.errors.length} records had errors:\n${errorDetails}`);
      }
      setTimeout(() => setSuccess(null), 5000);
      fetchCustomers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload CSV';
      setError(errorMsg);
      console.error('CSV upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-gray-600">Manage and view customer data</p>
        </div>
        <div className="flex gap-3">
          <label className="btn-primary inline-flex cursor-pointer items-center gap-2">
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Import CSV'}
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="size-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">✓</div>
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="space-y-4">
          {/* Form Mode Toggle */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Customer</h2>
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setFormMode('quick');
                    setFormErrors({});
                  }}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    formMode === 'quick'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Quick Fill
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormMode('detailed');
                    setFormErrors({});
                  }}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    formMode === 'detailed'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-transparent text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {formMode === 'quick'
                ? '⚡ Quick mode - Fill only essential fields'
                : '📋 Detailed mode - Fill all fields for complete customer profile'}
            </p>
          </div>

          {/* Quick Form */}
          {formMode === 'quick' && (
            <form onSubmit={handleCreate} className="card space-y-4">
              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                <input
                  type="text"
                  placeholder="e.g., 7590-VHVEG"
                  required
                  className={`input ${formErrors.customerID ? 'border-red-500' : ''}`}
                  value={formData.customerID}
                  onChange={(e) => {
                    setFormData({ ...formData, customerID: e.target.value });
                    if (formErrors.customerID) setFormErrors({ ...formErrors, customerID: '' });
                  }}
                />
                {formErrors.customerID && <p className="mt-1 text-sm text-red-600">{formErrors.customerID}</p>}
              </div>

              {/* Quick - Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    className={`input ${formErrors.gender ? 'border-red-500' : ''}`}
                    value={formData.gender}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value });
                      if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {formErrors.gender && <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner *</label>
                  <select
                    className={`input ${formErrors.Partner ? 'border-red-500' : ''}`}
                    value={formData.Partner}
                    onChange={(e) => {
                      setFormData({ ...formData, Partner: e.target.value });
                      if (formErrors.Partner) setFormErrors({ ...formErrors, Partner: '' });
                    }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {formErrors.Partner && <p className="mt-1 text-sm text-red-600">{formErrors.Partner}</p>}
                </div>
              </div>

              {/* Quick - Row 2 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (months) *</label>
                  <input
                    type="number"
                    placeholder="0-72"
                    min="0"
                    max="72"
                    className={`input ${formErrors.tenure ? 'border-red-500' : ''}`}
                    value={formData.tenure}
                    onChange={(e) => {
                      setFormData({ ...formData, tenure: e.target.value });
                      if (formErrors.tenure) setFormErrors({ ...formErrors, tenure: '' });
                    }}
                  />
                  {formErrors.tenure && <p className="mt-1 text-sm text-red-600">{formErrors.tenure}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Charges ($) *</label>
                  <input
                    type="number"
                    placeholder="65.00"
                    min="0"
                    step="0.01"
                    className={`input ${formErrors.MonthlyCharges ? 'border-red-500' : ''}`}
                    value={formData.MonthlyCharges}
                    onChange={(e) => {
                      setFormData({ ...formData, MonthlyCharges: e.target.value });
                      if (formErrors.MonthlyCharges) setFormErrors({ ...formErrors, MonthlyCharges: '' });
                    }}
                  />
                  {formErrors.MonthlyCharges && <p className="mt-1 text-sm text-red-600">{formErrors.MonthlyCharges}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Charges ($) *</label>
                  <input
                    type="number"
                    placeholder="780.00"
                    min="0"
                    step="0.01"
                    className={`input ${formErrors.TotalCharges ? 'border-red-500' : ''}`}
                    value={formData.TotalCharges}
                    onChange={(e) => {
                      setFormData({ ...formData, TotalCharges: e.target.value });
                      if (formErrors.TotalCharges) setFormErrors({ ...formErrors, TotalCharges: '' });
                    }}
                  />
                  {formErrors.TotalCharges && <p className="mt-1 text-sm text-red-600">{formErrors.TotalCharges}</p>}
                </div>
              </div>

              {/* Quick - Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internet Service *</label>
                  <select
                    className={`input ${formErrors.InternetService ? 'border-red-500' : ''}`}
                    value={formData.InternetService}
                    onChange={(e) => {
                      setFormData({ ...formData, InternetService: e.target.value });
                      if (formErrors.InternetService) setFormErrors({ ...formErrors, InternetService: '' });
                    }}
                  >
                    <option value="DSL">DSL</option>
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="No">No</option>
                  </select>
                  {formErrors.InternetService && <p className="mt-1 text-sm text-red-600">{formErrors.InternetService}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senior Citizen</label>
                  <select
                    className="input"
                    value={formData.SeniorCitizen}
                    onChange={(e) => setFormData({ ...formData, SeniorCitizen: e.target.value })}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    '✓ Create Customer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormErrors({});
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Detailed Form */}
          {formMode === 'detailed' && (
            <form onSubmit={handleCreate} className="card space-y-6">
              <h3 className="text-lg font-semibold">Complete Customer Profile</h3>
              
              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                <input
                  type="text"
                  placeholder="e.g., 7590-VHVEG"
                  required
                  className={`input ${formErrors.customerID ? 'border-red-500' : ''}`}
                  value={formData.customerID}
                  onChange={(e) => {
                    setFormData({ ...formData, customerID: e.target.value });
                    if (formErrors.customerID) setFormErrors({ ...formErrors, customerID: '' });
                  }}
                />
                {formErrors.customerID && <p className="mt-1 text-sm text-red-600">{formErrors.customerID}</p>}
              </div>

              {/* Demographics - Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    className={`input ${formErrors.gender ? 'border-red-500' : ''}`}
                    value={formData.gender}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value });
                      if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {formErrors.gender && <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senior Citizen</label>
                  <select
                    className="input"
                    value={formData.SeniorCitizen}
                    onChange={(e) => setFormData({ ...formData, SeniorCitizen: e.target.value })}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>

              {/* Demographics - Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner *</label>
                  <select
                    className={`input ${formErrors.Partner ? 'border-red-500' : ''}`}
                    value={formData.Partner}
                    onChange={(e) => {
                      setFormData({ ...formData, Partner: e.target.value });
                      if (formErrors.Partner) setFormErrors({ ...formErrors, Partner: '' });
                    }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {formErrors.Partner && <p className="mt-1 text-sm text-red-600">{formErrors.Partner}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dependents *</label>
                  <select
                    className={`input ${formErrors.Dependents ? 'border-red-500' : ''}`}
                    value={formData.Dependents}
                    onChange={(e) => {
                      setFormData({ ...formData, Dependents: e.target.value });
                      if (formErrors.Dependents) setFormErrors({ ...formErrors, Dependents: '' });
                    }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {formErrors.Dependents && <p className="mt-1 text-sm text-red-600">{formErrors.Dependents}</p>}
                </div>
              </div>

              {/* Account Info - Row 1 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (months) *</label>
                  <input
                    type="number"
                    placeholder="0-72"
                    min="0"
                    max="72"
                    className={`input ${formErrors.tenure ? 'border-red-500' : ''}`}
                    value={formData.tenure}
                    onChange={(e) => {
                      setFormData({ ...formData, tenure: e.target.value });
                      if (formErrors.tenure) setFormErrors({ ...formErrors, tenure: '' });
                    }}
                  />
                  {formErrors.tenure && <p className="mt-1 text-sm text-red-600">{formErrors.tenure}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Charges ($) *</label>
                  <input
                    type="number"
                    placeholder="65.00"
                    min="0"
                    step="0.01"
                    className={`input ${formErrors.MonthlyCharges ? 'border-red-500' : ''}`}
                    value={formData.MonthlyCharges}
                    onChange={(e) => {
                      setFormData({ ...formData, MonthlyCharges: e.target.value });
                      if (formErrors.MonthlyCharges) setFormErrors({ ...formErrors, MonthlyCharges: '' });
                    }}
                  />
                  {formErrors.MonthlyCharges && <p className="mt-1 text-sm text-red-600">{formErrors.MonthlyCharges}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Charges ($) *</label>
                  <input
                    type="number"
                    placeholder="780.00"
                    min="0"
                    step="0.01"
                    className={`input ${formErrors.TotalCharges ? 'border-red-500' : ''}`}
                    value={formData.TotalCharges}
                    onChange={(e) => {
                      setFormData({ ...formData, TotalCharges: e.target.value });
                      if (formErrors.TotalCharges) setFormErrors({ ...formErrors, TotalCharges: '' });
                    }}
                  />
                  {formErrors.TotalCharges && <p className="mt-1 text-sm text-red-600">{formErrors.TotalCharges}</p>}
                </div>
              </div>

              {/* Services - Row 1 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Service</label>
                  <select
                    className="input"
                    value={formData.PhoneService}
                    onChange={(e) => setFormData({ ...formData, PhoneService: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Multiple Lines</label>
                  <select
                    className="input"
                    value={formData.MultipleLines}
                    onChange={(e) => setFormData({ ...formData, MultipleLines: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No phone service">No phone service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internet Service *</label>
                  <select
                    className={`input ${formErrors.InternetService ? 'border-red-500' : ''}`}
                    value={formData.InternetService}
                    onChange={(e) => {
                      setFormData({ ...formData, InternetService: e.target.value });
                      if (formErrors.InternetService) setFormErrors({ ...formErrors, InternetService: '' });
                    }}
                  >
                    <option value="DSL">DSL</option>
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="No">No</option>
                  </select>
                  {formErrors.InternetService && <p className="mt-1 text-sm text-red-600">{formErrors.InternetService}</p>}
                </div>
              </div>

              {/* Internet Services - Row 2 */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Security</label>
                  <select
                    className="input"
                    value={formData.OnlineSecurity}
                    onChange={(e) => setFormData({ ...formData, OnlineSecurity: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Backup</label>
                  <select
                    className="input"
                    value={formData.OnlineBackup}
                    onChange={(e) => setFormData({ ...formData, OnlineBackup: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Protection</label>
                  <select
                    className="input"
                    value={formData.DeviceProtection}
                    onChange={(e) => setFormData({ ...formData, DeviceProtection: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tech Support</label>
                  <select
                    className="input"
                    value={formData.TechSupport}
                    onChange={(e) => setFormData({ ...formData, TechSupport: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
              </div>

              {/* Internet Services - Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Streaming TV</label>
                  <select
                    className="input"
                    value={formData.StreamingTV}
                    onChange={(e) => setFormData({ ...formData, StreamingTV: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Streaming Movies</label>
                  <select
                    className="input"
                    value={formData.StreamingMovies}
                    onChange={(e) => setFormData({ ...formData, StreamingMovies: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="No internet service">No internet service</option>
                  </select>
                </div>
              </div>

              {/* Contract & Payment - Row 1 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract *</label>
                  <select
                    className={`input ${formErrors.Contract ? 'border-red-500' : ''}`}
                    value={formData.Contract}
                    onChange={(e) => {
                      setFormData({ ...formData, Contract: e.target.value });
                      if (formErrors.Contract) setFormErrors({ ...formErrors, Contract: '' });
                    }}
                  >
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                  {formErrors.Contract && <p className="mt-1 text-sm text-red-600">{formErrors.Contract}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paperless Billing</label>
                  <select
                    className="input"
                    value={formData.PaperlessBilling}
                    onChange={(e) => setFormData({ ...formData, PaperlessBilling: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    className={`input ${formErrors.PaymentMethod ? 'border-red-500' : ''}`}
                    value={formData.PaymentMethod}
                    onChange={(e) => {
                      setFormData({ ...formData, PaymentMethod: e.target.value });
                      if (formErrors.PaymentMethod) setFormErrors({ ...formErrors, PaymentMethod: '' });
                    }}
                  >
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                    <option value="Credit card (automatic)">Credit card (automatic)</option>
                  </select>
                  {formErrors.PaymentMethod && <p className="mt-1 text-sm text-red-600">{formErrors.PaymentMethod}</p>}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    '✓ Create Customer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormErrors({});
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers by ID..."
              className="input pl-10 w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Churn Filter */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <label className="text-sm font-medium text-gray-700">Churn Status:</label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'yes', label: 'Churned' },
                { value: 'no', label: 'Active' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setChurnFilter(option.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    churnFilter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center rounded-lg bg-white p-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Tenure
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Monthly Charges
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Churn
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.customerID}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {customer.gender || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {customer.tenure || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ${customer.MonthlyCharges?.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.Churn === 'Yes'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {customer.Churn || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePredict(customer.customerID, customer.customerID)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          title="Generate prediction for this customer"
                        >
                          <Zap size={14} />
                          Predict
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{(page - 1) * 20 + 1}</span> to <span className="font-semibold">{Math.min(page * 20, total)}</span> of <span className="font-semibold">{total}</span> customers
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* First Page Button */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go to first page"
            >
              « First
            </button>

            {/* Previous Button */}
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              ‹ Prev
            </button>

            {/* Page Input */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Page:</label>
              <input
                type="number"
                min="1"
                max={Math.ceil(total / 20)}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newPage = Math.max(1, Math.min(Math.ceil(total / 20), parseInt(pageInput) || 1));
                    setPage(newPage);
                    setPageInput(newPage.toString());
                  }
                }}
                className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="1"
              />
              <span className="text-sm text-gray-600">of {Math.ceil(total / 20)}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              Next ›
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => setPage(Math.ceil(total / 20))}
              disabled={page * 20 >= total}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go to last page"
            >
              Last »
            </button>
          </div>
        </div>
      </div>

      {/* Prediction Modal */}
      <PredictionModal
        isOpen={showPredictionModal}
        isLoading={predictionLoading}
        prediction={prediction}
        error={predictionError}
        customerId={predictingCustomerId || ''}
        customerName={predicatingCustomerName || undefined}
        onClose={handleClosePredictionModal}
      />
    </div>
  );
};

export default Customers;
