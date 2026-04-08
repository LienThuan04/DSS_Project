import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TopFactor {
  feature: string;
  value: string | number;
  impact: number;
}

interface ExplainabilityPanelProps {
  topFactors?: TopFactor[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  topFactors = [],
  isExpanded = true,
  onToggle,
}) => {
  if (!topFactors || topFactors.length === 0) {
    return null;
  }

  const maxImpact = Math.max(...topFactors.map((factor) => Math.abs(factor.impact)));
  const normalizedFactors = topFactors.map((factor) => ({
    ...factor,
    normalizedImpact: maxImpact > 0 ? Math.abs(factor.impact) / maxImpact : 0,
  }));

  const formatFeatureName = (feature: string): string =>
    feature
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div
        onClick={onToggle}
        className={`flex items-center justify-between border-b px-5 py-4 ${
          onToggle ? 'cursor-pointer hover:bg-slate-50' : ''
        }`}
      >
        <div>
          <p className="page-kicker">Explainability</p>
          <h3 className="text-base font-semibold text-slate-900">
            Top factors influencing this score
          </h3>
        </div>
        {onToggle && (
          <button className="btn-outline h-10 px-3">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm text-slate-500">
            Relative impact of the most influential features behind the prediction.
          </p>

          {normalizedFactors.map((factor, index) => (
            <div key={`${factor.feature}-${index}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {index + 1}. {formatFeatureName(factor.feature)}
                  </p>
                  <p className="text-xs text-slate-500">Value: {String(factor.value)}</p>
                </div>
                <span className="badge badge-neutral">
                  {(factor.normalizedImpact * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-slate-900"
                  style={{ width: `${factor.normalizedImpact * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplainabilityPanel;
