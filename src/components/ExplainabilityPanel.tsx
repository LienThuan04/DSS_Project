import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TopFactor {
  feature: string;
  value: string | number;
  impact: number; // 0-1 normalized importance
}

interface ExplainabilityPanelProps {
  topFactors?: TopFactor[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  topFactors = [],
  isExpanded = true,
  onToggle
}) => {
  if (!topFactors || topFactors.length === 0) {
    return null;
  }

  // Normalize impact scores for display (0-100)
  const maxImpact = Math.max(...topFactors.map(f => Math.abs(f.impact)));
  const normalizedFactors = topFactors.map(f => ({
    ...f,
    normalizedImpact: maxImpact > 0 ? Math.abs(f.impact) / maxImpact : 0
  }));

  const formatFeatureName = (feature: string): string => {
    return feature
      .replace(/([A-Z])/g, ' $1') // Add space before capitals
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Header */}
      <div
        onClick={onToggle}
        className={`flex items-center justify-between px-6 py-4 cursor-pointer ${
          onToggle ? 'hover:bg-blue-100' : ''
        } bg-blue-100 border-b border-blue-200`}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
          <h3 className="font-semibold text-gray-900">Top Factors Influencing Prediction</h3>
        </div>
        {onToggle && (
          <button className="text-gray-600 hover:text-gray-900">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Summary Text */}
          <p className="text-sm text-gray-700">
            Top factors contributing to this churn prediction:
            <span className="font-semibold ml-1">
              {normalizedFactors.slice(0, 3).map(f => formatFeatureName(f.feature)).join(', ')}
            </span>
          </p>

          {/* Factor Bars */}
          <div className="space-y-3">
            {normalizedFactors.map((factor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {index + 1}. {formatFeatureName(factor.feature)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Value: <span className="font-mono font-semibold">{String(factor.value).slice(0, 20)}</span>
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                      {(factor.normalizedImpact * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Horizontal Bar Chart */}
                <div className="h-2 rounded-full bg-gray-300 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${factor.normalizedImpact * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend/Info */}
          <div className="mt-4 rounded-lg bg-white p-3 border border-blue-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">How to read:</span> The percentage shows the relative importance of each factor.
              A higher percentage means the factor has a stronger influence on the churn prediction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainabilityPanel;
