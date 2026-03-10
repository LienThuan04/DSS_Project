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
  onClose?: () => void;
}

const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  prediction,
  customerName,
  onClose,
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      case 'MEDIUM':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
      case 'LOW':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
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
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-600 text-white';
      case 'NORMAL':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const riskColor = getRiskColor(prediction.riskLevel);
  const riskMessage = getRiskMessage(prediction.riskLevel);
  const probabilityPercent = Math.round(prediction.churnProbability * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">Prediction Result</h3>
            {customerName && <p className="text-blue-100 text-sm mt-1">{customerName}</p>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Churn Probability */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Churn Probability
            </h4>
            <span className="text-2xl font-bold text-blue-600">{probabilityPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${probabilityPercent}%` }}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className={`${riskColor.bg} rounded-lg p-4 border ${riskColor.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-semibold ${riskColor.text} flex items-center gap-2`}>
                <AlertCircle className="w-5 h-5" />
                Risk Level
              </h4>
              <p className={`text-sm ${riskColor.text} mt-1`}>{riskMessage}</p>
            </div>
            <span className={`text-xl font-bold ${riskColor.text}`}>{prediction.riskLevel}</span>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">Priority Level</span>
          <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getPriorityColor(prediction.priority)}`}>
            {prediction.priority}
          </span>
        </div>

        {/* Recommendation */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{prediction.recommendation}</p>
        </div>

        {/* Top Factors */}
        {prediction.topFactors && prediction.topFactors.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Top Contributing Factors
            </h4>
            <div className="space-y-3">
              {prediction.topFactors.slice(0, 5).map((factor, index) => (
                <div key={`${factor.feature}-${index}`} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{factor.feature}</span>
                      <span className="text-xs text-gray-600">{(factor.impact * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(factor.impact * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Value: {factor.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {prediction.createdAt && (
          <div className="text-xs text-gray-500 flex items-center gap-2 pt-2 border-t border-gray-200">
            <Clock className="w-4 h-4" />
            {new Date(prediction.createdAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition"
          >
            Close
          </button>
        )}
        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PredictionResultCard;
