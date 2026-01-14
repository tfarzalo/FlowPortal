import { Shield, Award, CheckCircle, Star, Users, Trophy } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export function LicensingSection() {
  const { settings } = useSiteSettings();
  const isDark = settings?.defaultTheme === 'dark';

  // Get company info from settings or use defaults
  const ccbLicense = settings?.landingPage?.companyInfo?.ccbLicense || '#24586';
  const yearsInBusiness = settings?.landingPage?.companyInfo?.yearsInBusiness || 'Since 1978';
  const teamDescription = settings?.landingPage?.companyInfo?.teamDescription || 'Licensed Plumbers';
  const awardsDescription = settings?.landingPage?.companyInfo?.awardsDescription || 'Best Plumbing 15 Years';

  return (
    <section className={`py-16 backdrop-blur-sm border-y ${
      isDark
        ? 'bg-slate-900/50 border-slate-800'
        : 'bg-slate-100/80 border-slate-200'
    }`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12">
          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/20'}`}>
              <Shield className={`h-8 w-8 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>CCB License</div>
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{ccbLicense}</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-500/20'}`}>
              <CheckCircle className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</div>
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Licensed, Bonded & Insured</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'}`}>
              <Award className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Experience</div>
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{yearsInBusiness}</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'}`}>
              <Users className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Team</div>
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{teamDescription}</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-500/20'}`}>
              <Trophy className={`h-8 w-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Award</div>
              <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{awardsDescription}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}