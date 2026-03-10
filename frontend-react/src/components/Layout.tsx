import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Users, TrendingUp } from 'lucide-react';

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
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleDrawer}
        className="fixed right-4 top-4 z-50 rounded-lg bg-blue-600 p-2 text-white md:hidden"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 text-white transition-transform duration-300 ease-in-out md:relative md:z-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <h1 className="text-xl font-bold">Churn DSS</h1>
        </div>
        <nav className="space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Customer Churn DSS</h2>
            <p className="text-sm text-gray-600">
              Decision Support System for Churn Prediction
            </p>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
