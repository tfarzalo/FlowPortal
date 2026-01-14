import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export function ContactBar() {
  const { settings } = useSiteSettings();

  // Get colors and theme from settings
  const primaryColor = settings?.primaryColor || '#06b6d4'; // cyan-500
  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';

  const handlePhoneClick = () => {
    console.log('[ContactBar] Phone number clicked');
    const phoneNumber = settings?.contactPhone?.replace(/\D/g, '') || '5412657030';
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailClick = () => {
    console.log('[ContactBar] Email clicked');
    const email = settings?.contactEmail || 'newportplubinginc@gmail.com';
    window.location.href = `mailto:${email}`;
  };

  const handleAddressClick = () => {
    console.log('[ContactBar] Address clicked');
    const mapUrl = settings?.googleMapsUrl || 'https://maps.google.com/?q=490+SW+10th+St+Newport+OR+97365';
    window.open(mapUrl, '_blank');
  };

  return (
    <div className={`backdrop-blur-sm border-b sticky top-0 z-50 ${
      isDark
        ? 'bg-slate-900/95 border-slate-800'
        : 'bg-white/95 border-gray-200 shadow-sm'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Mobile: Only show phone number centered */}
        <div className="md:hidden flex justify-center">
          <button
            onClick={handlePhoneClick}
            className={`flex items-center gap-3 transition-colors group ${
              isDark
                ? 'text-gray-300 hover:text-cyan-400'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDark
                ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <Phone className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            </div>
            <div className="font-semibold text-base">{settings?.contactPhone || '(541) 265-7030'}</div>
          </button>
        </div>

        {/* Desktop: Show all 4 items */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handlePhoneClick}
            className={`flex items-center gap-3 transition-colors group ${
              isDark ? 'text-gray-300 hover:text-cyan-400' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDark
                ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <Phone className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            </div>
            <div className="text-left min-w-0">
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Call Us</div>
              <div className="font-semibold text-base truncate">{settings?.contactPhone || '(541) 265-7030'}</div>
            </div>
          </button>

          <button
            onClick={handleEmailClick}
            className={`flex items-center gap-3 transition-colors group ${
              isDark ? 'text-gray-300 hover:text-cyan-400' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDark
                ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <Mail className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            </div>
            <div className="text-left min-w-0">
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Email</div>
              <div className="font-semibold text-sm truncate">{settings?.contactEmail || 'newportplubinginc@gmail.com'}</div>
            </div>
          </button>

          <button
            onClick={handleAddressClick}
            className={`flex items-center gap-3 transition-colors group ${
              isDark ? 'text-gray-300 hover:text-cyan-400' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDark
                ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <MapPin className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            </div>
            <div className="text-left min-w-0">
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Location</div>
              <div className="font-semibold text-sm truncate">{settings?.address || '490 SW 10th St, Newport, OR'}</div>
            </div>
          </button>

          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              isDark ? 'bg-cyan-500/10' : 'bg-blue-100'
            }`}>
              <Clock className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            </div>
            <div className="text-left min-w-0">
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Hours</div>
              <div className="font-semibold text-sm truncate">
                {settings?.businessHours?.monday || 'Mon-Fri 8am-5pm'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}