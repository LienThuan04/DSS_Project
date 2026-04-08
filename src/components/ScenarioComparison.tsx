import React from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

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

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'badge badge-high';
    case 'HIGH':
      return 'badge badge-medium';
    case 'NORMAL':
    case 'LOW':
    default:
      return 'badge badge-neutral';
  }
};

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  base,
  scenario,
  delta,
  scenarioName,
}) => {
  const deltaPercentagePrefix = delta.probabilityDeltaPercent > 0 ? '+' : '';

  return (
    <div className="section-card p-6">
      <div className="space-y-6">
        <div>
          <p className="page-kicker">Comparison</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {scenarioName || 'Scenario comparison'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{delta.summary}</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {[{ title: 'Base scenario', data: base }, { title: 'Modified scenario', data: scenario }].map(
            (block) => (
              <div key={block.title} className="rounded-2xl border bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{block.title}</h3>
                  <span className={getRiskBadge(block.data.riskLevel)}>{block.data.riskLevel}</span>
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Churn probability</span>
                      <span className="font-semibold text-slate-900">
                        {(block.data.churnProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-slate-900"
                        style={{ width: `${block.data.churnProbability * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Priority</span>
                    <span className={getPriorityBadge(block.data.priority)}>
                      {block.data.priority}
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">Recommendation</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {block.data.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Probability delta</p>
            <div className="mt-3 flex items-center gap-2">
              {delta.probabilityDelta > 0 ? (
                <ArrowUpRight className="text-red-600" size={18} />
              ) : delta.probabilityDelta < 0 ? (
                <ArrowDownRight className="text-emerald-600" size={18} />
              ) : (
                <ArrowRight className="text-slate-500" size={18} />
              )}
              <span
                className={`text-2xl font-semibold ${
                  delta.probabilityDelta > 0
                    ? 'text-red-600'
                    : delta.probabilityDelta < 0
                    ? 'text-emerald-600'
                    : 'text-slate-900'
                }`}
              >
                {delta.probabilityDelta === 0
                  ? '0'
                  : delta.probabilityDelta > 0
                  ? `+${delta.probabilityDelta.toFixed(3)}`
                  : delta.probabilityDelta.toFixed(3)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {deltaPercentagePrefix}
              {delta.probabilityDeltaPercent.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Risk level shift</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={getRiskBadge(base.riskLevel)}>{base.riskLevel}</span>
              <ArrowRight size={16} className="text-slate-400" />
              <span className={getRiskBadge(scenario.riskLevel)}>{scenario.riskLevel}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {delta.riskLevelChanged ? 'Risk bucket changed.' : 'Risk bucket unchanged.'}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Priority shift</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={getPriorityBadge(base.priority)}>{base.priority}</span>
              <ArrowRight size={16} className="text-slate-400" />
              <span className={getPriorityBadge(scenario.priority)}>{scenario.priority}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {delta.priorityChanged ? 'Recommended action changed.' : 'Priority unchanged.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;
