import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { predictionsApi } from '../services/api';
import { Prediction, Stats } from '../types';
import PredictionForm from '../components/PredictionForm';
import PredictionResultCard from '../components/PredictionResultCard';
import SimplePredictionForm from '../components/SimplePredictionForm';

const riskToneMap: Record<string, string> = {
  HIGH: 'badge badge-high',
  MEDIUM: 'badge badge-medium',
  LOW: 'badge badge-low',
};

const statAccentMap: Record<string, string> = {
  Total: 'text-slate-900',
  HIGH: 'text-red-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-emerald-600',
};

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
  const [formType, setFormType] = useState<'simple' | 'full'>('simple');

  const pageCount = Math.max(1, Math.ceil(total / 20));

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const [predRes, statsRes] = await Promise.all([
        predictionsApi.list(page, 20, riskFilter),
        predictionsApi.stats(),
      ]);

      const predictionsData = predRes.data?.data || predRes.data || [];
      const totalCount = predRes.data?.total || 0;
      const statsData = statsRes.data?.data || statsRes.data || null;

      setPredictions(Array.isArray(predictionsData) ? predictionsData : []);
      setTotal(totalCount);
      setStats(statsData);
    } catch (err: any) {
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
    window.setTimeout(() => {
      fetchPredictions();
    }, 600);
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

  const statCards = stats
    ? [
        { label: 'Total Predictions', value: stats.totalPredictions || 0, tone: 'Total' },
        { label: 'High Risk', value: stats.highRisk || 0, tone: 'HIGH' },
        { label: 'Medium Risk', value: stats.mediumRisk || 0, tone: 'MEDIUM' },
        { label: 'Low Risk', value: stats.lowRisk || 0, tone: 'LOW' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <p className="page-kicker">Predictive Workspace</p>
          <h1 className="page-title">Generate and review churn predictions</h1>
          <p className="page-description">
            Score customers with a quick form, switch to the full profile when needed and keep a
            clean history of generated predictions.
          </p>
        </div>

        {!showForm && (
          <div className="flex flex-wrap gap-3">
            <button onClick={handleNewPrediction} className="btn-primary gap-2">
              <Sparkles size={16} />
              New prediction
            </button>
          </div>
        )}
      </section>

      {error && (
        <div className="section-card p-4">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5" size={18} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {statCards.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${statAccentMap[card.tone]}`}>
                {card.value}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
        <div className="section-card p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="page-kicker">Input</p>
              <h2 className="text-xl font-semibold text-slate-900">
                {showForm ? 'Prediction form' : 'Latest prediction result'}
              </h2>
            </div>

            {showForm && (
              <div className="rounded-full border bg-slate-100 p-1">
                <button
                  onClick={() => setFormType('simple')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    formType === 'simple'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Quick form
                </button>
                <button
                  onClick={() => setFormType('full')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    formType === 'full'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Full form
                </button>
              </div>
            )}
          </div>

          {showForm ? (
            formType === 'simple' ? (
              <SimplePredictionForm onSubmit={handleFormSubmit} />
            ) : (
              <PredictionForm onSubmit={handleFormSubmit} />
            )
          ) : result ? (
            <div className="space-y-4">
              <PredictionResultCard
                prediction={result}
                customerName={result.customerName}
                customerId={result.customerId}
                onClose={handleNewPrediction}
              />
              <button onClick={handleNewPrediction} className="btn-outline w-full">
                Start another prediction
              </button>
            </div>
          ) : null}
        </div>

        <aside className="section-card p-6">
          <div className="mb-5">
            <p className="page-kicker">Recent Items</p>
            <h2 className="text-xl font-semibold text-slate-900">Recent predictions</h2>
          </div>

          {predictions.slice(0, 5).length === 0 ? (
            <div className="empty-state min-h-[240px]">
              <p className="text-sm text-slate-500">No predictions have been generated yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.slice(0, 5).map((pred) => {
                const predictionId = pred.id || pred._id || '';

                return (
                  <button
                    key={predictionId}
                    onClick={() => setSelectedPrediction(pred)}
                    className="w-full rounded-2xl border bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={riskToneMap[pred.riskLevel || 'MEDIUM'] || 'badge badge-neutral'}>
                        {pred.riskLevel || 'MEDIUM'}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {((pred.churnProbability || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {pred.recommendation || 'No recommendation available.'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      </section>

      <section className="section-card overflow-hidden">
        <div className="border-b px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="page-kicker">History</p>
              <h2 className="text-xl font-semibold text-slate-900">Prediction archive</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'HIGH', label: 'High Risk' },
                { value: 'MEDIUM', label: 'Medium Risk' },
                { value: 'LOW', label: 'Low Risk' },
              ].map((option) => (
                <button
                  key={option.value || 'ALL'}
                  onClick={() => {
                    setPage(1);
                    setRiskFilter(option.value);
                  }}
                  className={`filter-pill ${
                    riskFilter === option.value ? 'filter-pill-active' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <Loader className="mb-4 animate-spin text-slate-900" size={24} />
            <p className="text-sm text-slate-500">Loading prediction history...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="empty-state">
            <p className="text-sm text-slate-500">No predictions found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Risk</th>
                  <th>Probability</th>
                  <th>Priority</th>
                  <th>Recommendation</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => {
                  const predictionId = pred.id || pred._id || '-';

                  return (
                    <tr
                      key={predictionId}
                      className="cursor-pointer"
                      onClick={() => setSelectedPrediction(pred)}
                    >
                      <td className="max-w-[180px] truncate font-medium text-slate-900">
                        {predictionId}
                      </td>
                      <td>
                        <span className={riskToneMap[pred.riskLevel || 'MEDIUM'] || 'badge badge-neutral'}>
                          {pred.riskLevel || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="font-medium text-slate-900">
                        {((pred.churnProbability || 0) * 100).toFixed(2)}%
                      </td>
                      <td>{pred.priority || '-'}</td>
                      <td className="max-w-[360px] truncate">{pred.recommendation}</td>
                      <td>
                        {pred.createdAt
                          ? new Date(pred.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            if (predictionId !== '-') {
                              handleDeletePrediction(predictionId);
                            }
                          }}
                          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {pageCount}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-outline gap-2"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pageCount, page + 1))}
                disabled={page === pageCount}
                className="btn-outline gap-2"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white/95 px-6 py-4 backdrop-blur">
              <div>
                <p className="page-kicker">Prediction Detail</p>
                <h2 className="text-xl font-semibold text-slate-900">Stored prediction</h2>
              </div>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="btn-outline h-10 px-3"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <PredictionResultCard
                prediction={selectedPrediction}
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
