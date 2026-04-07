import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Users, TrendingUp, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/' },
    { label: 'Customers', icon: Users, path: '/customers' },
    { label: 'Predictions', icon: TrendingUp, path: '/predictions' },
    { label: 'What-If Analysis', icon: Zap, path: '/predictions/what-if' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleDrawer}
        className="fixed right-4 top-4 z-50 rounded-md bg-primary p-2 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors md:hidden"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-white transition-transform duration-300 ease-in-out md:relative md:z-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-slate-700 px-6 bg-slate-950">
          <h1 className="text-lg font-bold tracking-tight text-white">Churn DSS</h1>
        </div>
        <nav className="space-y-1 p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customer Churn DSS</h2>
            <p className="text-sm text-slate-600 mt-1">
              Decision Support System for Churn Prediction
            </p>
          </div>
        </header>
        <div className="p-8 max-w-full">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
