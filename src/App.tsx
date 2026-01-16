import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "./components/ui/sonner"
import { LandingPage } from "./pages/LandingPage"
import { PageView } from "./pages/PageView"
import Login from "./pages/Login"
import MediaManagement from "./pages/MediaManagement"
import { AuthProvider } from "./contexts/SupabaseAuthContext"
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext"
import { AdminLayout } from "./components/admin/AdminLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"
import PagesManagement from "./pages/admin/PagesManagement"
import PageEditor from "./pages/admin/PageEditor"
import PostsManagement from "./pages/admin/PostsManagement"
import SiteSettings from "./pages/admin/SiteSettings"
import UsersManagement from "./pages/admin/UsersManagement"
import FormEntriesManagement from "./pages/admin/FormEntriesManagement"
import FormConfigurationManagement from "./pages/admin/FormConfigurationManagement"
import ErrorBoundary from "./components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      {/* Removed ThemeProvider - theme is managed by SiteSettingsContext */}
      <SiteSettingsProvider>
        <Router>
          <Routes>
            {/* Public routes - no auth loading, instant rendering */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/page/:slug" element={<PageView />} />
            
            {/* Auth-required routes */}
            <Route path="/login" element={
              <AuthProvider>
                <Login />
              </AuthProvider>
            } />

            {/* Admin Routes - wrapped in AuthProvider only */}
            <Route path="/admin" element={
              <AuthProvider>
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              </AuthProvider>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="pages" element={<PagesManagement />} />
              <Route path="pages/new" element={<PageEditor />} />
              <Route path="pages/edit/:id" element={<PageEditor />} />
              <Route path="posts" element={<PostsManagement />} />
              <Route path="media" element={<MediaManagement />} />
              <Route path="form-entries" element={<FormEntriesManagement />} />
              <Route path="form-configuration" element={<FormConfigurationManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="settings" element={<ErrorBoundary><SiteSettings /></ErrorBoundary>} />
            </Route>

            {/* Fallback for old /:slug routes - redirect to /page/:slug */}
            <Route path="/:slug" element={<PageView />} />
          </Routes>
        </Router>
        <Toaster />
      </SiteSettingsProvider>
    </ErrorBoundary>
  )
}

export default App
