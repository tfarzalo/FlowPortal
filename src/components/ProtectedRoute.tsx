import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] State:', { isAuthenticated, loading, userRole: user?.role, requireAdmin });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    if (!user?.role) {
      console.log('[ProtectedRoute] Admin required but no role loaded, showing spinner');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (user.role !== "admin") {
      console.log('[ProtectedRoute] User is not admin, redirecting to /');
      return <Navigate to="/" replace />;
    }
    console.log('[ProtectedRoute] User is admin, allowing access');
  }

  return <>{children}</>;
}
