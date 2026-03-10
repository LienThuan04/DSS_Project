import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface PredictionInfo {
  churnProbability: number;
  riskLevel: string;
  recommendation: string;
  priority: string;
}

interface DeltaInfo {
  probabilityDelta: number;
  probabilityDeltaPercent: number;
  riskLevelChanged: boolean;
  recommendationChanged: boolean;
  priorityChanged: boolean;
  summary: string;
}

interface ScenarioComparisonProps {
  base: PredictionInfo;
  scenario: PredictionInfo;
  delta: DeltaInfo;
  scenarioName?: string;
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  base,
  scenario,
  delta,
  scenarioName
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return { bg: 'bg-red-50', text: 'text-red-900', badge: 'bg-red-200 text-red-800' };
      case 'MEDIUM':
        return { bg: 'bg-yellow-50', text: 'text-yellow-900', badge: 'bg-yellow-200 text-yellow-800' };
      case 'LOW':
        return { bg: 'bg-green-50', text: 'text-green-900', badge: 'bg-green-200 text-green-800' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-900', badge: 'bg-gray-200 text-gray-800' };
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
      case 'LOW':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const baseRiskColors = getRiskColor(base.riskLevel);
  const scenarioRiskColors = getRiskColor(scenario.riskLevel);
  const deltaPercentageStr = delta.probabilityDeltaPercent > 0 ? '+' : '';

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      {scenarioName && (
        <div className="pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{scenarioName}</h2>
        </div>
      )}

      {/* Delta Summary */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Impact Summary</h3>
        <p className="text-blue-800">{delta.summary}</p>
      </div>

      {/* Two-Column Comparison */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Base Scenario */}
        <div className="rounded-lg border border-gray-300 p-5 bg-gray-50">
          <h3 className="mb-4 font-bold text-gray-900">Base Scenario</h3>

          {/* Probability */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">Churn Probability</span>
              <span className="text-xl font-bold text-gray-900">
                {(base.churnProbability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-300">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${base.churnProbability * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">Risk Level</span>
            <div className={`mt-1 inline-block px-3 py-1 rounded-full font-medium ${baseRiskColors.badge}`}>
              {base.riskLevel}
            </div>
          </div>

          {/* Priority */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">Recommended Priority</span>
            <div className={`mt-1 inline-block px-3 py-1 rounded-full font-medium ${getPriorityColor(base.priority)}`}>
              {base.priority}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded bg-gray-100 p-3">
            <p className="text-sm text-gray-700">{base.recommendation}</p>
          </div>
        </div>

        {/* Scenario */}
        <div className="rounded-lg border border-gray-300 p-5 bg-blue-50">
          <h3 className="mb-4 font-bold text-gray-900">Modified Scenario</h3>

          {/* Probability */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">Churn Probability</span>
              <span className="text-xl font-bold text-gray-900">
                {(scenario.churnProbability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-300">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${scenario.churnProbability * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">Risk Level</span>
            <div className={`mt-1 inline-block px-3 py-1 rounded-full font-medium ${scenarioRiskColors.badge}`}>
              {scenario.riskLevel}
            </div>
          </div>

          {/* Priority */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">Recommended Priority</span>
            <div className={`mt-1 inline-block px-3 py-1 rounded-full font-medium ${getPriorityColor(scenario.priority)}`}>
              {scenario.priority}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded bg-white p-3 border border-blue-200">
            <p className="text-sm text-gray-700">{scenario.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Delta Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 rounded-lg bg-gray-50 p-4">
        {/* Probability Delta */}
        <div className="rounded border border-gray-300 bg-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {delta.probabilityDelta > 0 ? (
              <>
                <ArrowUpRight className="text-red-600" size={20} />
                <span className="text-lg font-bold text-red-600">+{Math.abs(delta.probabilityDelta).toFixed(3)}</span>
              </>
            ) : delta.probabilityDelta < 0 ? (
              <>
                <ArrowDownRight className="text-green-600" size={20} />
                <span className="text-lg font-bold text-green-600">{delta.probabilityDelta.toFixed(3)}</span>
              </>
            ) : (
              <>
                <ArrowRight className="text-gray-600" size={20} />
                <span className="text-lg font-bold text-gray-600">No Change</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-600">Probability Change</p>
          <p className={`text-sm font-semibold ${delta.probabilityDelta > 0 ? 'text-red-600' : delta.probabilityDelta < 0 ? 'text-green-600' : 'text-gray-600'}`}>
            ({deltaPercentageStr}{delta.probabilityDeltaPercent.toFixed(1)}%)
          </p>
        </div>

        {/* Risk Level Change */}
        <div className="rounded border border-gray-300 bg-white p-4 text-center">
          <div className="mb-2">
            {delta.riskLevelChanged ? (
              <div className="flex items-center justify-center gap-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRiskColor(base.riskLevel).badge}`}>
                  {base.riskLevel}
                </span>
                <ArrowRight size={16} />
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRiskColor(scenario.riskLevel).badge}`}>
                  {scenario.riskLevel}
                </span>
              </div>
            ) : (
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRiskColor(base.riskLevel).badge}`}>
                No Change
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600">Risk Level</p>
        </div>

        {/* Priority Change */}
        <div className="rounded border border-gray-300 bg-white p-4 text-center">
          <div className="mb-2">
            {delta.priorityChanged ? (
              <div className="flex items-center justify-center gap-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(base.priority)}`}>
                  {base.priority}
                </span>
                <ArrowRight size={16} />
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(scenario.priority)}`}>
                  {scenario.priority}
                </span>
              </div>
            ) : (
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(base.priority)}`}>
                No Change
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600">Action Priority</p>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;
