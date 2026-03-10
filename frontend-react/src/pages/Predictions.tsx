import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader, Zap, TrendingUp } from 'lucide-react';
import { predictionsApi } from '../services/api';
import { Prediction, Stats } from '../types';

const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tenure: 12,
    MonthlyCharges: 75,
    TotalCharges: 900,
    SeniorCitizen: 0,
    Contract: 0,
    InternetService: 0,
  });

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.tenure < 0 || formData.tenure > 72) {
      errors.tenure = 'Tenure must be between 0 and 72 months';
    }
    if (formData.MonthlyCharges < 0 || formData.MonthlyCharges > 300) {
      errors.MonthlyCharges = 'Monthly Charges must be between 0 and 300';
    }
    if (formData.TotalCharges < 0) {
      errors.TotalCharges = 'Total Charges cannot be negative';
    }
    if (formData.TotalCharges < formData.MonthlyCharges) {
      errors.TotalCharges = 'Total Charges should be >= Monthly Charges';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const [predRes, statsRes] = await Promise.all([
        predictionsApi.list(page, 20, riskFilter),
        predictionsApi.stats(),
      ]);
      setPredictions(predRes.data.data);
      setTotal(predRes.data.total);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [page, riskFilter]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await predictionsApi.create('new-customer-' + Date.now(), formData);
      setSuccess('Prediction created successfully!');
      setShowPredictionForm(false);
      setFormData({
        tenure: 12,
        MonthlyCharges: 75,
        TotalCharges: 900,
        SeniorCitizen: 0,
        Contract: 0,
        InternetService: 0,
      });
      setTimeout(() => setSuccess(null), 3000);
      fetchPredictions();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to make prediction';
      setError(errorMsg);
      console.error('Prediction error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this prediction?')) {
      try {
        await predictionsApi.delete(id);
        fetchPredictions();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete prediction');
      }
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Predictions</h1>
          <p className="mt-1 text-gray-600">Churn prediction results and analysis</p>
        </div>
        <button
          onClick={() => setShowPredictionForm(!showPredictionForm)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Zap size={20} />
          New Prediction
        </button>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Total Predictions</p>
            <p className="mt-2 text-2xl font-bold">{stats.totalPredictions}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">High Risk</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{stats.highRisk}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Medium Risk</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{stats.mediumRisk}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Low Risk</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{stats.lowRisk}</p>
          </div>
        </div>
      )}

      {showPredictionForm && (
        <form onSubmit={handlePredict} className="card space-y-4">
          <h2 className="text-lg font-semibold">Make New Prediction</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenure (months)
                <span className="text-gray-500 font-normal text-xs ml-1">How long the customer has been with the company</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 12"
                className={`input ${formErrors.tenure ? 'border-red-500' : ''}`}
                value={formData.tenure}
                min="0"
                max="72"
                onChange={(e) => {
                  setFormData({ ...formData, tenure: parseInt(e.target.value) || 0 });
                  if (formErrors.tenure) setFormErrors({ ...formErrors, tenure: '' });
                }}
              />
              {formErrors.tenure && <p className="mt-1 text-sm text-red-600">{formErrors.tenure}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Charges ($)
                <span className="text-gray-500 font-normal text-xs ml-1">Monthly billing amount</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 75.50"
                step="0.01"
                className={`input ${formErrors.MonthlyCharges ? 'border-red-500' : ''}`}
                value={formData.MonthlyCharges}
                min="0"
                max="300"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    MonthlyCharges: parseFloat(e.target.value) || 0,
                  });
                  if (formErrors.MonthlyCharges) setFormErrors({ ...formErrors, MonthlyCharges: '' });
                }}
              />
              {formErrors.MonthlyCharges && <p className="mt-1 text-sm text-red-600">{formErrors.MonthlyCharges}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Charges ($)
                <span className="text-gray-500 font-normal text-xs ml-1">Total amount paid by customer</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 900.00"
                step="0.01"
                className={`input ${formErrors.TotalCharges ? 'border-red-500' : ''}`}
                value={formData.TotalCharges}
                min="0"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    TotalCharges: parseFloat(e.target.value) || 0,
                  });
                  if (formErrors.TotalCharges) setFormErrors({ ...formErrors, TotalCharges: '' });
                }}
              />
              {formErrors.TotalCharges && <p className="mt-1 text-sm text-red-600">{formErrors.TotalCharges}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senior Citizen Status
                <span className="text-gray-500 font-normal text-xs ml-1">Is the customer 65 years or older?</span>
              </label>
              <select
                className="input"
                value={formData.SeniorCitizen}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    SeniorCitizen: parseInt(e.target.value),
                  })
                }
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Type
                <span className="text-gray-500 font-normal text-xs ml-1">Customer's contract duration</span>
              </label>
              <select
                className="input"
                value={formData.Contract}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Contract: parseInt(e.target.value),
                  })
                }
              >
                <option value={0}>Month-to-month</option>
                <option value={1}>One year</option>
                <option value={2}>Two year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internet Service
                <span className="text-gray-500 font-normal text-xs ml-1">Type of internet service</span>
              </label>
              <select
                className="input"
                value={formData.InternetService}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    InternetService: parseInt(e.target.value),
                  })
                }
              >
                <option value={0}>DSL</option>
                <option value={1}>Fiber optic</option>
                <option value={2}>No internet service</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Predict
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPredictionForm(false);
                setFormErrors({});
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Risk Filter */}
      <div className="flex gap-2">
        {['', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
          <button
            key={risk}
            onClick={() => {
              setRiskFilter(risk);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              riskFilter === risk
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {risk || 'All'} Predictions
          </button>
        ))}
      </div>

      {/* Predictions Table */}
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
                  Customer ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Churn Probability
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Risk Level
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Recommendation
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {predictions.map((pred) => (
                <tr key={pred._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {pred.customerId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            pred.churnProbability > 0.75
                              ? 'bg-red-500'
                              : pred.churnProbability > 0.5
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                          }`}
                          style={{
                            width: `${pred.churnProbability * 100}%`,
                          }}
                        />
                      </div>
                      <span>{(pred.churnProbability * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRiskColor(
                        pred.riskLevel
                      )}`}
                    >
                      {pred.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {pred.recommendation}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleDelete(pred._id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of{' '}
          {total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 20 >= total}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
