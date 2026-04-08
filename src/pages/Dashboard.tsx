import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, AlertTriangle, BarChart3, Loader, TrendingUp, Users } from 'lucide-react';
import { customersApi, predictionsApi } from '../services/api';
import { Stats } from '../types';
import ChurnByContractChart from '../components/ChurnByContractChart';
import ChurnByInternetServiceChart from '../components/ChurnByInternetServiceChart';
import ChurnByPaymentMethodChart from '../components/ChurnByPaymentMethodChart';

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, helper, icon: Icon }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
      </div>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
        <Icon size={18} />
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
      <div className="empty-state min-h-[420px]">
        <Loader className="mb-4 animate-spin text-slate-900" size={28} />
        <p className="text-sm text-slate-500">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-card p-6">
        <div className="flex items-start gap-3 text-red-700">
          <AlertCircle className="mt-0.5" size={20} />
          <div>
            <p className="font-medium">Unable to load dashboard</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const churnData = [
    { name: 'Retained', value: customerStats?.retained || 0, fill: '#0f172a' },
    { name: 'Churned', value: customerStats?.churned || 0, fill: '#ef4444' },
  ];

  const riskData = [
    { name: 'High Risk', value: predictionStats?.highRisk || 0, fill: '#ef4444' },
    { name: 'Medium Risk', value: predictionStats?.mediumRisk || 0, fill: '#f59e0b' },
    { name: 'Low Risk', value: predictionStats?.lowRisk || 0, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <section className="section-card bg-grid overflow-hidden p-6 md:p-8">
        <div className="page-header">
          <div>
            <p className="page-kicker">Overview</p>
            <h1 className="page-title">Customer churn analytics workspace</h1>
            <p className="page-description">
              Track active customers, monitor risk concentration and inspect retention patterns
              across contracts, internet services and payment methods.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-white/80 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Current churn rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {customerStats?.churnRate || '0%'}
              </p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                High-risk predictions
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {predictionStats?.highRisk || 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={customerStats?.totalCustomers || 0}
          helper="All customers available in the dataset."
          icon={Users}
        />
        <StatCard
          label="Churn Rate"
          value={customerStats?.churnRate || '0%'}
          helper="Overall attrition ratio across the customer base."
          icon={TrendingUp}
        />
        <StatCard
          label="Predictions"
          value={predictionStats?.totalPredictions || 0}
          helper="Stored churn predictions generated from the app."
          icon={BarChart3}
        />
        <StatCard
          label="High Risk"
          value={predictionStats?.highRisk || 0}
          helper="Customers needing immediate retention attention."
          icon={AlertTriangle}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="section-card p-6">
          <div className="mb-6">
            <p className="page-kicker">Distribution</p>
            <h2 className="text-xl font-semibold text-slate-900">Churn composition</h2>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={churnData}
                dataKey="value"
                innerRadius={60}
                outerRadius={92}
                paddingAngle={3}
              >
                {churnData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {churnData.map((item) => (
              <div key={item.name} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex size-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card p-6">
          <div className="mb-6">
            <p className="page-kicker">Risk Levels</p>
            <h2 className="text-xl font-semibold text-slate-900">Prediction distribution</h2>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskData}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {riskData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {riskData.map((item) => (
              <div key={item.name} className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">{item.name}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="page-kicker">Segments</p>
          <h2 className="text-xl font-semibold text-slate-900">Churn by business dimension</h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <ChurnByContractChart />
          <ChurnByInternetServiceChart />
          <ChurnByPaymentMethodChart />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
