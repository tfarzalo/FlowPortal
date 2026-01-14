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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
