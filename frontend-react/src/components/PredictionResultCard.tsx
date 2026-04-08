import React from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface TopFactor {
  feature: string;
  value: number | string;
  impact: number;
}

interface Prediction {
  churnProbability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  topFactors?: TopFactor[];
  createdAt?: string;
}

interface PredictionResultCardProps {
  prediction: Prediction;
  customerName?: string;
  customerId?: string;
  onClose?: () => void;
}

const getRiskBadge = (level: string) => {
  switch (level) {
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

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'badge badge-high';
    case 'HIGH':
      return 'badge badge-medium';
    default:
      return 'badge badge-neutral';
  }
};

const getRiskMessage = (level: string) => {
  switch (level) {
    case 'HIGH':
      return 'Immediate retention action recommended.';
    case 'MEDIUM':
      return 'Monitor closely and review the offer mix.';
    case 'LOW':
      return 'Current customer profile is relatively stable.';
    default:
      return 'Risk information unavailable.';
  }
};

const formatFeatureName = (feature: string) =>
  feature
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  prediction,
  customerName,
  customerId,
  onClose,
}) => {
  const probabilityPercent = Math.round((prediction.churnProbability || 0) * 100);

  return (
    <div className="section-card overflow-hidden">
      <div className="border-b px-6 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="page-kicker">Prediction Result</p>
            <h3 className="text-2xl font-semibold text-slate-900">Churn risk summary</h3>
            {(customerName || customerId) && (
              <p className="mt-2 text-sm text-slate-500">
                {customerName || 'Customer'} {customerId ? `| ${customerId}` : ''}
              </p>
            )}
          </div>

          <span className={getRiskBadge(prediction.riskLevel)}>{prediction.riskLevel}</span>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Churn probability</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
                  {probabilityPercent}%
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-5 h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-slate-900 transition-all"
                style={{ width: `${probabilityPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Priority</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className={getPriorityBadge(prediction.priority || 'NORMAL')}>
                {prediction.priority || 'NORMAL'}
              </span>
              {prediction.riskLevel === 'HIGH' ? (
                <AlertCircle className="text-red-600" size={18} />
              ) : (
                <CheckCircle className="text-emerald-600" size={18} />
              )}
            </div>
            <p className="mt-4 text-sm text-slate-600">{getRiskMessage(prediction.riskLevel)}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm font-medium text-slate-900">Recommendation</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{prediction.recommendation}</p>
        </div>

        {prediction.topFactors && prediction.topFactors.length > 0 && (
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm font-medium text-slate-900">Top contributing factors</p>
            <div className="mt-4 space-y-4">
              {prediction.topFactors.slice(0, 5).map((factor, index) => (
                <div key={`${factor.feature}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {formatFeatureName(factor.feature)}
                      </p>
                      <p className="text-xs text-slate-500">Value: {String(factor.value)}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {(factor.impact * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${Math.min(factor.impact * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {prediction.createdAt && (
          <div className="flex items-center gap-2 border-t pt-4 text-sm text-slate-500">
            <Clock size={16} />
            <span>{new Date(prediction.createdAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {onClose && (
        <div className="border-t px-6 py-4">
          <button onClick={onClose} className="btn-outline w-full">
            Close result
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictionResultCard;
