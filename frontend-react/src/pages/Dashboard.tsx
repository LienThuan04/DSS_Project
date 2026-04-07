import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { customersApi, predictionsApi } from '../services/api';
import { Stats } from '../types';
import { AlertCircle, Loader } from 'lucide-react';
import ChurnByContractChart from '../components/ChurnByContractChart';
import ChurnByInternetServiceChart from '../components/ChurnByInternetServiceChart';
import ChurnByPaymentMethodChart from '../components/ChurnByPaymentMethodChart';

const StatCard = ({ label, value, color = 'from-blue-500 to-cyan-500' }: any) => (
  <div className="card bg-gradient-to-br from-white/90 to-blue-50/50 border-l-4 border-purple-500 group hover:shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
        <p className={`mt-3 text-4xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [customerStats, setCustomerStats] = useState<Stats | null>(null);
  const [predictionStats, setPredictionStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [custRes, predRes] = await Promise.all([
          customersApi.stats(),
          predictionsApi.stats(),
        ]);

        setCustomerStats(custRes.data);
        setPredictionStats(predRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 p-12">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-lg font-semibold text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const churnData = [
    { name: 'Retained', value: customerStats?.retained || 0, fill: '#4caf50' },
    { name: 'Churned', value: customerStats?.churned || 0, fill: '#f44336' },
  ];

  const riskData = [
    { name: 'High Risk', value: predictionStats?.highRisk || 0, fill: '#f44336' },
    { name: 'Medium Risk', value: predictionStats?.mediumRisk || 0, fill: '#ff9800' },
    { name: 'Low Risk', value: predictionStats?.lowRisk || 0, fill: '#4caf50' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-4xl font-black gradient-text">Dashboard</h1>
        <p className="mt-2 text-lg text-slate-600 font-medium">Customer churn prediction overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={customerStats?.totalCustomers || 0} color="from-blue-500 to-cyan-500" />
        <StatCard label="Churn Rate" value={customerStats?.churnRate || '0%'} color="from-orange-500 to-red-500" />
        <StatCard label="Total Predictions" value={predictionStats?.totalPredictions || 0} color="from-emerald-500 to-teal-500" />
        <StatCard label="High Risk" value={predictionStats?.highRisk || 0} color="from-pink-500 to-red-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Churn Distribution */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Churn Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={churnData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {churnData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Risk Level Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segmentation Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChurnByContractChart />
        <ChurnByInternetServiceChart />
        <ChurnByPaymentMethodChart />
      </div>
    </div>
  );
};

export default Dashboard;
