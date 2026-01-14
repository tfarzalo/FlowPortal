import { Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getMediaUrl } from "@/config/api";

interface HeroSectionProps {
  onScheduleClick: () => void;
  onCallClick: () => void;
}

export function HeroSection({ onScheduleClick, onCallClick }: HeroSectionProps) {
  const { settings } = useSiteSettings();

  // Get colors from settings or use defaults
  const primaryColor = settings?.primaryColor || '#2563eb';
  const secondaryColor = settings?.secondaryColor || '#1e40af';

  // Get hero background image from settings or use default
  const heroBackgroundUrl = settings?.landingPage?.heroBackgroundImageUrl
    ? getMediaUrl(settings.landingPage.heroBackgroundImageUrl)
    : "url('https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=2070&auto=format&fit=crop')";

  // Get landing page icon or fallback to logo
  const displayIcon = settings?.landingPageIconUrl || settings?.logoUrl;

  // Get button styles from settings
  const buttonStyles = settings?.buttonStyles || {
    primaryButtonBg: '#2563eb',
    primaryButtonText: '#ffffff',
    primaryButtonHoverBg: '#1e40af',
    primaryButtonHoverText: '#ffffff',
    primaryButtonBorder: '0px',
    primaryButtonBorderColor: '#2563eb',
    secondaryButtonBg: 'transparent',
    secondaryButtonText: '#2563eb',
    secondaryButtonHoverBg: '#2563eb',
    secondaryButtonHoverText: '#ffffff',
    secondaryButtonBorder: '2px',
    secondaryButtonBorderColor: '#2563eb'
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: heroBackgroundUrl.startsWith('url(') ? heroBackgroundUrl : `url('${heroBackgroundUrl}')`,
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/90 to-slate-900/95"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${primaryColor}1A` }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{ backgroundColor: `${secondaryColor}1A` }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          {displayIcon ? (
            <img
              src={getMediaUrl(displayIcon)}
              alt={settings?.siteName || 'Company Logo'}
              className="h-20 object-contain"
              onError={(e) => {
                console.error('[HeroSection] Icon/Logo failed to load:', getMediaUrl(displayIcon));
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          {settings?.siteName || 'Newport Plumbing Inc'}
          <span
            className="block text-3xl md:text-4xl mt-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
            }}
          >
            {settings?.landingPage?.heroTagline || settings?.tagline || 'Discover the Difference'}
          </span>
        </h1>

        <div className="flex flex-wrap justify-center gap-4 mb-12 text-gray-300">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-medium">Family Owned & Operated</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-medium">Licensed, Bonded & Insured</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-medium">Serving Newport Since 1978</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={onScheduleClick}
            className="px-8 py-6 text-lg rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: buttonStyles.primaryButtonBg,
              color: buttonStyles.primaryButtonText,
              border: `${buttonStyles.primaryButtonBorder} solid ${buttonStyles.primaryButtonBorderColor}`,
              boxShadow: `0 20px 50px ${primaryColor}50`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyles.primaryButtonHoverBg;
              e.currentTarget.style.color = buttonStyles.primaryButtonHoverText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyles.primaryButtonBg;
              e.currentTarget.style.color = buttonStyles.primaryButtonText;
            }}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule Service Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onCallClick}
            className="px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: buttonStyles.secondaryButtonBg,
              color: buttonStyles.secondaryButtonText,
              border: `${buttonStyles.secondaryButtonBorder} solid ${buttonStyles.secondaryButtonBorderColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyles.secondaryButtonHoverBg;
              e.currentTarget.style.color = buttonStyles.secondaryButtonHoverText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyles.secondaryButtonBg;
              e.currentTarget.style.color = buttonStyles.secondaryButtonText;
            }}
          >
            <Phone className="mr-2 h-5 w-5" />
            Call Now: {settings?.contactPhone || '(541) 265-7030'}
          </Button>
        </div>
      </div>
    </section>
  );
}