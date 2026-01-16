import { LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"

import { useAuth } from "@/contexts/SupabaseAuthContext"
import { useSiteSettings } from "@/contexts/SiteSettingsContext"
import { getMediaUrl } from "@/config/api"
import { useNavigate } from "react-router-dom"

export function Header() {

  const { logout } = useAuth()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-left"
        >
          {settings?.logoUrl ? (
            <img
              src={getMediaUrl(settings.logoUrl)}
              alt={settings?.siteName ? `${settings.siteName} logo` : "Site logo"}
              className="h-9 w-auto"
            />
          ) : null}
          <span className="text-lg font-semibold">
            {settings?.siteName || "FlowPortal"}
          </span>
        </button>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
