import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, LogOut, Settings, Briefcase, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { API_URL } from '../config';

interface LayoutProps {
  onLogout: () => void;
}

export default function Layout({ onLogout }: LayoutProps) {
  const location = useLocation();

  const handleLogout = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      await fetch(`${API_URL}/api/admin/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    }
    localStorage.removeItem('admin_token');
    onLogout();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/projects', label: 'Projects', icon: Briefcase },
    { path: '/social-links', label: 'Social Links', icon: Share2 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-card p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-wide font-anton">Ndhvbase Admin</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex w-full items-center justify-start gap-3 px-4 py-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
