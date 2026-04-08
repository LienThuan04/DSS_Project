import React from 'react';
import { AlertCircle, Clock, Loader, TrendingUp, X } from 'lucide-react';
import ExplainabilityPanel from './ExplainabilityPanel';
import { Prediction } from '../types';

interface PredictionModalProps {
  isOpen: boolean;
  isLoading: boolean;
  prediction: Prediction | null;
  error: string | null;
  customerId: string;
  customerName?: string;
  onClose: () => void;
}

const getRiskBadge = (riskLevel: string) => {
  switch (riskLevel) {
    case 'HIGH':
      return 'badge badge-high';
    case 'MEDIUM':
      return 'badge badge-medium';
    case 'LOW':
      return 'badge badge-low';
    default:
      return 'badge badge-neutral';
  }
};

const PredictionModal: React.FC<PredictionModalProps> = ({
  isOpen,
  isLoading,
  prediction,
  error,
  customerId,
  customerName,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="page-kicker">Prediction</p>
            <h2 className="text-2xl font-semibold text-slate-900">Customer churn score</h2>
            <p className="mt-2 text-sm text-slate-500">
              {customerName ? `Customer: ${customerName}` : `Customer ID: ${customerId}`}
            </p>
          </div>
          <button onClick={onClose} className="btn-outline h-10 px-3">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {isLoading ? (
            <div className="empty-state min-h-[300px]">
              <Loader className="mb-4 animate-spin text-slate-900" size={24} />
              <p className="text-sm text-slate-500">Generating prediction...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3 text-red-700">
                <AlertCircle className="mt-0.5" size={18} />
                <div>
                  <p className="font-medium">Prediction failed</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : prediction ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Churn probability</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-4xl font-semibold text-slate-900">
                      {Math.round((prediction.churnProbability || 0) * 100)}%
                    </p>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="mt-5 h-3 rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-slate-900"
                      style={{
                        width: `${Math.round((prediction.churnProbability || 0) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Risk level</p>
                  <div className="mt-3">
                    <span className={getRiskBadge(prediction.riskLevel || 'MEDIUM')}>
                      {prediction.riskLevel || 'MEDIUM'}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    {prediction.recommendation || 'No recommendation available.'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5">
                <p className="text-sm font-medium text-slate-900">Recommendation</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {prediction.recommendation || 'No specific recommendation available.'}
                </p>
              </div>

              {prediction.topFactors && prediction.topFactors.length > 0 && (
                <ExplainabilityPanel topFactors={prediction.topFactors} isExpanded={true} />
              )}

              {prediction.createdAt && (
                <div className="flex items-center gap-2 border-t pt-4 text-sm text-slate-500">
                  <Clock size={16} />
                  <span>{new Date(prediction.createdAt).toLocaleString()}</span>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state min-h-[260px]">
              <p className="text-sm text-slate-500">No prediction available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionModal;
