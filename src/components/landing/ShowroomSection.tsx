import { MapPin, Clock, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export function ShowroomSection() {
  const { settings } = useSiteSettings();
  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';

  const handleMapClick = () => {
    console.log('Opening map to showroom location');
    window.open('https://maps.google.com/?q=490+SW+10th+St+Newport+OR+97365', '_blank');
  };

  return (
    <section className={`py-20 ${
      isDark
        ? 'bg-gradient-to-b from-slate-950 to-slate-900'
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Visit Our Showroom
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Come visit our showroom & parts department
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Map Card */}
            <Card className={`backdrop-blur-sm overflow-hidden group transition-all duration-300 ${
              isDark
                ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
                : 'bg-white/80 border-gray-300 hover:border-blue-400 shadow-lg'
            }`}>
              <CardContent className="p-0">
                <div className={`relative h-64 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2876.5!2d-124.0537!3d44.6368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54c3a0a0a0a0a0a0%3A0x0!2s490%20SW%2010th%20St%2C%20Newport%2C%20OR%2097365!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-300"
                  ></iframe>
                  <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none ${
                    isDark ? 'from-slate-900/80' : 'from-white/80'
                  } to-transparent`}></div>
                </div>
                <div className="p-6">
                  <Button
                    onClick={handleMapClick}
                    className={`w-full text-white ${
                      isDark
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                        : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                    }`}
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className={`backdrop-blur-sm ${
              isDark
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white/80 border-gray-300 shadow-lg'
            }`}>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isDark ? 'bg-cyan-500/10' : 'bg-blue-100'
                    }`}>
                      <MapPin className={`h-6 w-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Address</h3>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>490 SW 10th St</p>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Newport, OR 97365</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isDark ? 'bg-blue-500/10' : 'bg-blue-100'
                    }`}>
                      <Clock className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Office Hours</h3>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Monday - Friday</p>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>8:00 AM - 5:00 PM</p>
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Showroom closed 12pm-1pm for lunch</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isDark ? 'bg-purple-500/10' : 'bg-purple-100'
                    }`}>
                      <Package className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Parts & Fixtures</h3>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Stocking all major brands</p>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Professional-grade supplies</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
