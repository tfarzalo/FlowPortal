import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/SupabaseAuthContext";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";
import { getMediaUrl } from "../../config/api";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  FileText,
  NewspaperIcon,
  Settings,
  Image,
  LogOut,
  Users,
  Inbox,
  FormInput,
  ExternalLink,
} from "lucide-react";
import { useEffect } from "react";

export function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!user?.role || user.role === 'user') {
      // User is authenticated but doesn't have admin privileges
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewSite = () => {
    console.log('[AdminLayout] Opening site in new tab with preview mode');
    window.open('/?preview=true', '_blank');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/pages', label: 'Pages', icon: FileText },
    { path: '/admin/posts', label: 'Posts', icon: NewspaperIcon },
    { path: '/admin/media', label: 'Media', icon: Image },
    { path: '/admin/form-entries', label: 'Form Entries', icon: Inbox },
    { path: '/admin/form-configuration', label: 'Form Config', icon: FormInput },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          {settings?.logoUrl ? (
            <img
              src={getMediaUrl(settings.logoUrl)}
              alt={settings.siteName}
              className="h-10 object-contain mb-2"
              onError={(e) => {
                console.error('[AdminLayout] Logo failed to load:', getMediaUrl(settings.logoUrl));
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <h1 className="text-2xl font-bold text-primary">
            {settings?.siteName || 'FlowPortal'}
          </h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems && navItems.length > 0 ? (
            navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })
          ) : (
            <div className="text-muted-foreground text-sm p-4">
              No navigation items available
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4 px-4 py-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {navItems.find((item) => isActive(item.path))?.label || 'Admin Panel'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewSite}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Site
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
