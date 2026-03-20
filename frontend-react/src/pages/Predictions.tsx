import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { predictionsApi } from '../services/api';
import { Prediction, Stats } from '../types';
import PredictionForm from '../components/PredictionForm';
import PredictionResultCard from '../components/PredictionResultCard';

const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const [predRes, statsRes] = await Promise.all([
        predictionsApi.list(page, 20, riskFilter),
        predictionsApi.stats(),
      ]);
      // Handle both response structures
      const predictionsData = predRes.data?.data || predRes.data || [];
      const totalCount = predRes.data?.total || 0;
      const statsData = statsRes.data?.data || statsRes.data || null;
      
      setPredictions(Array.isArray(predictionsData) ? predictionsData : []);
      setTotal(totalCount);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch predictions:', err);
      setError(err.response?.data?.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [page, riskFilter]);

  const handleFormSubmit = (predictionResult: any) => {
    setResult(predictionResult);
    setShowForm(false);
    setTimeout(() => {
      fetchPredictions();
    }, 1000);
  };

  const handleNewPrediction = () => {
    setResult(null);
    setShowForm(true);
  };

  const handleDeletePrediction = async (id: string) => {
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Churn Predictions</h1>
        <p className="mt-1 text-gray-600">Make new predictions and view prediction history</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Total Predictions</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalPredictions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">High Risk</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{stats.highRisk}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Medium Risk</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{stats.mediumRisk}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-600">Low Risk</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{stats.lowRisk}</p>
          </div>
        </div>
      )}

      {/* Prediction Form / Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {showForm ? (
            <PredictionForm onSubmit={handleFormSubmit} />
          ) : result ? (
            <div className="space-y-4">
              <PredictionResultCard 
                prediction={result} 
                customerName={result.customerName}
                customerId={result.customerId}
                onClose={handleNewPrediction} 
              />
              <button
                onClick={handleNewPrediction}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
              >
                Make Another Prediction
              </button>
            </div>
          ) : null}
        </div>

        {/* Recent Predictions Sidebar */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Predictions</h3>
          {predictions.slice(0, 5).length === 0 ? (
            <p className="text-gray-600 text-sm">No predictions yet</p>
          ) : (
            <div className="space-y-3">
              {predictions.slice(0, 5).map((pred) => (
                <div
                  key={pred.id || pred._id}
                  onClick={() => setSelectedPrediction(pred)}
                  className="border-l-4 border-blue-600 pl-3 py-2 cursor-pointer hover:bg-blue-50 rounded transition"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getRiskColor(pred.riskLevel || 'MEDIUM')}`}>
                      {pred.riskLevel || 'MEDIUM'}
                    </span>
                    <span className="text-xs text-gray-500">{((pred.churnProbability) * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">{pred.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Predictions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Prediction History</h2>
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setRiskFilter('')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                riskFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRiskFilter('HIGH')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                riskFilter === 'HIGH' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setRiskFilter('MEDIUM')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                riskFilter === 'MEDIUM' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Medium Risk
            </button>
            <button
              onClick={() => setRiskFilter('LOW')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                riskFilter === 'LOW' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Low Risk
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No predictions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Risk Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Probability</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Recommendation</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => (
                  <tr key={pred.id || pred._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">{pred.id || pred._id || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(pred.riskLevel || 'MEDIUM')}`}>
                        {pred.riskLevel || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {((pred.churnProbability) * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{pred.priority || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-sm">{pred.recommendation}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pred.createdAt ? new Date(pred.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          const id = pred.id || pred._id;
                          if (id) {
                            handleDeletePrediction(id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {page} of {Math.ceil(total / 20)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(Math.ceil(total / 20), page + 1))}
                disabled={page === Math.ceil(total / 20)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Prediction Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Prediction Details</h2>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <PredictionResultCard
                prediction={selectedPrediction as any}
                customerName={selectedPrediction.customerName}
                customerId={selectedPrediction.customerId}
                onClose={() => setSelectedPrediction(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;
