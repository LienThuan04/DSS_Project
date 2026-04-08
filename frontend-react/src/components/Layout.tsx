import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Menu, TrendingUp, Users, X, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    path: '/',
    description: 'Overview, key metrics and churn segments.',
  },
  {
    label: 'Customers',
    icon: Users,
    path: '/customers',
    description: 'Manage customer records and run direct predictions.',
  },
  {
    label: 'Predictions',
    icon: TrendingUp,
    path: '/predictions',
    description: 'Score churn risk and review prediction history.',
  },
  {
    label: 'What-If Analysis',
    icon: Zap,
    path: '/predictions/what-if',
    description: 'Compare scenarios before making retention changes.',
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    if (path === '/predictions') {
      return location.pathname === '/predictions';
    }

    return location.pathname.startsWith(path);
  };

  const currentItem =
    menuItems.find((item) => isActiveRoute(item.path)) || menuItems[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {open && (
          <button
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white/95 backdrop-blur transition-transform duration-200 md:static md:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b px-5 py-5">
            <div className="inline-flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <BarChart3 size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Churn DSS</p>
                <p className="text-xs text-slate-500">Decision support workspace</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <div className="surface-muted bg-grid p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Workspace
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Unified view for churn monitoring, prediction and scenario testing.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpen((value) => !value)}
                  className="btn-outline h-10 px-3 md:hidden"
                  aria-label="Toggle navigation"
                >
                  {open ? <X size={18} /> : <Menu size={18} />}
                </button>

                <div>
                  <p className="text-sm font-semibold text-slate-900">{currentItem.label}</p>
                  <p className="hidden text-xs text-slate-500 sm:block">
                    {currentItem.description}
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <span className="badge badge-neutral">Shadcn-style refresh</span>
                <span className="badge badge-neutral">React + Tailwind</span>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="page-shell">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
