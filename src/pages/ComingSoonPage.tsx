import { useEffect, useState } from "react";
import { getSiteSettings, SiteSettings } from "../api/admin";
import { getMediaUrl } from "../config/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function ComingSoonPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (error) {
      console.error('[ComingSoonPage] Failed to load settings:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12 px-8 text-center space-y-6">
          {settings?.logoUrl && (
            <div className="flex justify-center mb-8">
              <img
                src={getMediaUrl(settings.logoUrl)}
                alt={settings.siteName}
                className="h-20 object-contain"
                onError={(e) => {
                  console.error('[ComingSoonPage] Logo failed to load:', getMediaUrl(settings.logoUrl));
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-primary">
              Coming Soon
            </h1>
            <h2 className="text-3xl font-semibold">
              {settings?.siteName || 'FlowPortal'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {settings?.tagline || 'Your Trusted Plumbing Partner'}
            </p>
          </div>

          <div className="py-8">
            <div className="max-w-md mx-auto space-y-3">
              <p className="text-lg">
                We're currently working on something amazing. Our new website will be launching soon!
              </p>
              <p className="text-muted-foreground">
                Check back soon for updates.
              </p>
            </div>
          </div>

          {settings && (
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <div className="space-y-2 text-muted-foreground">
                {settings.contactPhone && (
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a
                      href={`tel:${settings.contactPhone}`}
                      className="text-primary hover:underline"
                    >
                      {settings.contactPhone}
                    </a>
                  </p>
                )}
                {settings.contactEmail && (
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-primary hover:underline"
                    >
                      {settings.contactEmail}
                    </a>
                  </p>
                )}
                {settings.address && (
                  <p>
                    <strong>Address:</strong> {settings.address}
                  </p>
                )}
              </div>

              {/* Admin Link */}
              <div className="pt-4">
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    Admin Access
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
