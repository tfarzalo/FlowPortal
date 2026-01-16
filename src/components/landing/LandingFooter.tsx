import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getMediaUrl } from "@/config/api";

export function LandingFooter() {
  const { settings } = useSiteSettings();
  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={`border-t ${
      isDark
        ? 'bg-slate-950 border-slate-800'
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings?.logoUrl ? (
                <img
                  src={getMediaUrl(settings.logoUrl)}
                  alt={settings.siteName}
                  className="h-12 object-contain"
                  onError={(e) => {
                    console.error('[LandingFooter] Logo failed to load:', settings.logoUrl ? getMediaUrl(settings.logoUrl) : 'undefined');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-700'
                }`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{settings?.siteName || 'Newport Plumbing Inc'}</h3>
                <p className="text-gray-500 text-sm">Since 1978</p>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {settings?.tagline || 'Family owned & operated. Proudly servicing the Newport community for over 45 years.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className={`text-sm transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-cyan-400'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Home
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className={`text-sm transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-cyan-400'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('showroom')}
                  className={`text-sm transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-cyan-400'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Showroom
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('reviews')}
                  className={`text-sm transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-cyan-400'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('booking-form')}
                  className={`text-sm transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-cyan-400'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Book Service
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Us</h4>
            <ul className="space-y-3">
              <li className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Phone className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                <a
                  href={`tel:${settings?.contactPhone?.replace(/\D/g, '') || '5412657030'}`}
                  className={`transition-colors ${
                    isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'
                  }`}
                >
                  {settings?.contactPhone || '(541) 265-7030'}
                </a>
              </li>
              <li className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Mail className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                <a
                  href={`mailto:${settings?.contactEmail || 'newportplubinginc@gmail.com'}`}
                  className={`break-all transition-colors ${
                    isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'
                  }`}
                >
                  {settings?.contactEmail || 'newportplubinginc@gmail.com'}
                </a>
              </li>
              <li className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <MapPin className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                <span>{settings?.address || '490 SW 10th St, Newport, OR 97365'}</span>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Certifications</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>✓ CCB Licensed #24586</li>
              <li>✓ Licensed, Bonded & Insured</li>
              <li>✓ Newport Chamber Member</li>
              <li>✓ BBC Certified</li>
              <li>✓ 15x Best Plumbing Award</li>
            </ul>
          </div>
        </div>

        {/* Privacy Statement */}
        {settings?.privacyStatement && (
          <div className={`border-t pt-8 pb-6 ${
            isDark ? 'border-slate-800' : 'border-gray-200'
          }`}>
            <div
              className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              dangerouslySetInnerHTML={{ __html: settings.privacyStatement }}
            />
          </div>
        )}

        <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${
          isDark ? 'border-slate-800' : 'border-gray-200'
        }`}>
          <p className="text-gray-500 text-sm">
            © {currentYear} {settings?.siteName || 'Newport Plumbing Inc'}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {settings?.socialMedia?.facebook && (
              <a
                href={settings.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  isDark
                    ? 'text-gray-500 hover:text-cyan-400'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {settings?.socialMedia?.twitter && (
              <a
                href={settings.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  isDark
                    ? 'text-gray-500 hover:text-cyan-400'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {settings?.socialMedia?.instagram && (
              <a
                href={settings.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  isDark
                    ? 'text-gray-500 hover:text-cyan-400'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            <a href="/privacy-policy" className={`text-sm transition-colors ${
              isDark
                ? 'text-gray-500 hover:text-cyan-400'
                : 'text-gray-500 hover:text-blue-600'
            }`}>
              Privacy Policy
            </a>
            <a href="/login?redirect=/admin" className={`text-sm transition-colors ${
              isDark
                ? 'text-gray-500 hover:text-cyan-400'
                : 'text-gray-500 hover:text-blue-600'
            }`}>
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
