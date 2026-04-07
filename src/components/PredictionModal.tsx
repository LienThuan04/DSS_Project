import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
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

  const getRiskColor = (riskLevel: string): { bg: string; text: string; border: string } => {
    switch (riskLevel) {
      case 'HIGH':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      case 'MEDIUM':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
      case 'LOW':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-600 text-white';
      case 'NORMAL':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const riskColors = prediction ? getRiskColor(prediction.riskLevel) : { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 border-b bg-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Churn Prediction</h2>
            <p className="mt-1 text-sm text-gray-600">
              {customerName ? `Customer: ${customerName}` : `Customer ID: ${customerId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin">
                <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 text-red-600 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900">Prediction Failed</h3>
                  <p className="mt-1 text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          ) : prediction ? (
            <>
              {/* Main Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {/* Churn Probability */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm font-medium text-blue-900">Churn Probability</p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {Math.round((prediction.churnProbability || 0) * 100)}%
                  </p>
                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.round((prediction.churnProbability || 0) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Risk Level */}
                <div className={`rounded-lg border-2 p-4 ${riskColors.bg} ${riskColors.border}`}>
                  <p className={`text-sm font-medium ${riskColors.text}`}>Risk Level</p>
                  <p className={`mt-2 text-3xl font-bold ${riskColors.text}`}>
                    {prediction.riskLevel}
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    {prediction.riskLevel === 'HIGH' && (
                      <TrendingUp size={16} className={riskColors.text} />
                    )}
                    <span className={`text-xs font-medium ${riskColors.text}`}>
                      {prediction.riskLevel === 'HIGH'
                        ? 'Immediate attention needed'
                        : prediction.riskLevel === 'MEDIUM'
                        ? 'Monitor closely'
                        : 'Low concern'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority & Recommendation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <span className={`px-3 py-1 rounded-full font-medium text-xs ${getPriorityColor(prediction.priority || 'NORMAL')}`}>
                    {prediction.priority || 'NORMAL'}
                  </span>
                </div>

                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Recommendation</p>
                  <p className="text-gray-700">{prediction.recommendation || 'No specific recommendation available'}</p>
                </div>
              </div>

              {/* Top Factors - Using Explainability Panel */}
              {prediction.topFactors && prediction.topFactors.length > 0 && (
                <ExplainabilityPanel
                  topFactors={prediction.topFactors}
                  isExpanded={true}
                />
              )}

              {/* Metadata */}
              {prediction.createdAt && (
                <div className="flex items-center gap-2 text-xs text-gray-500 border-t pt-4">
                  <Clock size={14} />
                  <span>Predicted on {new Date(prediction.createdAt).toLocaleString()}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No prediction available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
          >
            Close
          </button>
          {prediction && (
            <button
              onClick={() => {
                console.log('View details:', prediction._id);
                // Could navigate to detailed prediction view
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionModal;
