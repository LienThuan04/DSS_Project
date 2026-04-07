import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';

interface TopFactor {
  feature: string;
  value: number | string;
  impact: number;
}

interface Prediction {
  churnProbability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  topFactors?: TopFactor[];
  createdAt?: string;
}

interface PredictionResultCardProps {
  prediction: Prediction;
  customerName?: string;
  customerId?: string;
  onClose?: () => void;
}

const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  prediction,
  customerName,
  customerId,
  onClose,
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return { bg: 'bg-gradient-to-br from-red-50 to-pink-50', text: 'text-red-700', border: 'border-red-300', badge: 'badge-red' };
      case 'MEDIUM':
        return { bg: 'bg-gradient-to-br from-amber-50 to-orange-50', text: 'text-amber-700', border: 'border-amber-300', badge: 'badge-purple' };
      case 'LOW':
        return { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', text: 'text-emerald-700', border: 'border-emerald-300', badge: 'badge-green' };
      default:
        return { bg: 'bg-gradient-to-br from-slate-50 to-slate-100', text: 'text-slate-700', border: 'border-slate-300', badge: 'badge-purple' };
    }
  };

  const getRiskMessage = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'Immediate attention needed';
      case 'MEDIUM':
        return 'Monitor closely';
      case 'LOW':
        return 'Low concern';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30';
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30';
      case 'NORMAL':
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30';
    }
  };

  const riskColor = getRiskColor(prediction.riskLevel);
  const riskMessage = getRiskMessage(prediction.riskLevel);
  const probabilityPercent = Math.round(prediction.churnProbability * 100);

  return (
    <div className="card bg-white/95 backdrop-blur border-2 border-slate-200/50 overflow-hidden shadow-xl hover:shadow-2xl transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-700 to-slate-900 px-8 py-6 -mx-6 -mt-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-white">Prediction Result</h3>
            {(customerName || customerId) && (
              <p className="text-slate-200 text-sm mt-2 font-medium">
                {customerId && <span>ID: {customerId}</span>}
                {customerId && customerName && <span> • </span>}
                {customerName && <span>{customerName}</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5">
        {/* Churn Probability */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              📊 Churn Probability
            </h4>
            <span className="text-3xl font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{probabilityPercent}%</span>
          </div>
          <div className="w-full bg-slate-300/30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
              style={{ width: `${probabilityPercent}%` }}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className={`${riskColor.bg} rounded-2xl p-6 border-2 ${riskColor.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-bold text-lg flex items-center gap-2 ${riskColor.text}`}>
                Risk Level
              </h4>
              <p className={`text-sm ${riskColor.text} mt-2 opacity-85 font-medium`}>{riskMessage}</p>
            </div>
            <span className={`${riskColor.badge} px-4 py-2 rounded-lg font-bold`}>{prediction.riskLevel}</span>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-6 border-2 border-slate-200/50">
          <span className="font-bold text-slate-700 text-lg">⚡ Priority Level</span>
          <span className={`px-6 py-3 rounded-xl font-bold text-sm transform hover:scale-105 transition-transform ${getPriorityColor(prediction.priority)}`}>
            {prediction.priority}
          </span>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200/50">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">💡 Recommendation</h4>
          <p className="text-slate-700 leading-relaxed font-medium">{prediction.recommendation}</p>
        </div>

        {/* Top Factors */}
        {prediction.topFactors && prediction.topFactors.length > 0 && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-purple-200/50">
            <h4 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-lg">
              🣄 Top Contributing Factors
            </h4>
            <div className="space-y-4">
              {prediction.topFactors.slice(0, 5).map((factor, index) => (
                <div key={`${factor.feature}-${index}`} className="flex items-center gap-4 bg-white/60 p-3 rounded-xl hover:bg-white transition-colors">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg w-8 h-8 flex items-center justify-center shadow-md">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700 truncate">{factor.feature}</span>
                      <span className="text-xs font-bold text-purple-600 whitespace-nowrap ml-2">{(factor.impact * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-300/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all shadow-md shadow-purple-500/30"
                        style={{ width: `${Math.min(factor.impact * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">🃌 Value: {factor.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {prediction.createdAt && (
          <div className="text-xs text-slate-500 flex items-center gap-2 pt-4 border-t border-slate-200/50 font-medium">
            ⏱️ {new Date(prediction.createdAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {onClose && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 -mx-6 -mb-6 mt-6 px-8 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            ✖️ Close
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictionResultCard;
