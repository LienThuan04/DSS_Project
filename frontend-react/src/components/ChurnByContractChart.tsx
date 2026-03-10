import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { customersApi } from '../services/api';
import { AlertCircle, Loader } from 'lucide-react';

interface ChurnData {
  name: string;
  total: number;
  churned: number;
  churnRate: number;
}

const ChurnByContractChart: React.FC = () => {
  const [data, setData] = useState<ChurnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await customersApi.segmentedStats();
        setData(response.data.byContract || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load churn data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="card flex items-center justify-center h-80">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const getColor = (rate: number) => {
    if (rate > 60) return '#f44336';
    if (rate > 40) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div className="card">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Churn Rate by Contract Type</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: any) => [`${value.toFixed(1)}%`, 'Churn Rate']}
            labelFormatter={(label) => `Contract: ${label}`}
          />
          <Bar dataKey="churnRate" fill="#8884d8" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.churnRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {data.map((item) => (
          <div key={item.name} className="text-sm">
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-2xl font-bold" style={{ color: getColor(item.churnRate) }}>
              {item.churnRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600">{item.churned} of {item.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChurnByContractChart;
