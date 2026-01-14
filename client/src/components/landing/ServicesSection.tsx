import * as LucideIcons from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// Default services if none configured
const defaultServices = [
  {
    id: 'service-1',
    icon: LucideIcons.Home,
    title: "Remodel & New Construction",
    description: "Complete plumbing solutions for your remodeling projects and new construction builds.",
    iconName: "Home",
    enabled: true
  },
  {
    id: 'service-2',
    icon: LucideIcons.Wrench,
    title: "Residential & Commercial Repairs",
    description: "Expert repair services for both residential homes and commercial properties.",
    iconName: "Wrench",
    enabled: true
  },
  {
    id: 'service-3',
    icon: LucideIcons.Flame,
    title: "Water Heater Service",
    description: "Professional water heater repair and replacement for reliable hot water supply.",
    iconName: "Flame",
    enabled: true
  },
  {
    id: 'service-4',
    icon: LucideIcons.Droplet,
    title: "Fixture & Faucet Repair",
    description: "Quality repair and installation of all types of plumbing fixtures and faucets.",
    iconName: "Droplet",
    enabled: true
  },
  {
    id: 'service-5',
    icon: LucideIcons.Building2,
    title: "Whole House Repipe",
    description: "Complete replumbing services to modernize your home's plumbing system.",
    iconName: "Building2",
    enabled: true
  },
  {
    id: 'service-6',
    icon: LucideIcons.AlertCircle,
    title: "Emergency Service",
    description: "Fast emergency plumbing response when you need it most.",
    iconName: "AlertCircle",
    enabled: true
  },
  {
    id: 'service-7',
    icon: LucideIcons.Package,
    title: "Parts & Fixtures",
    description: "Stocking all major brands of plumbing parts and fixtures in our showroom.",
    iconName: "Package",
    enabled: true
  },
  {
    id: 'service-8',
    icon: LucideIcons.DollarSign,
    title: "Free Estimates",
    description: "Get a free, no-obligation estimate for your plumbing project.",
    iconName: "DollarSign",
    enabled: true
  }
];

export function ServicesSection() {
  const { settings } = useSiteSettings();
  const isDark = settings?.defaultTheme === 'dark';

  // Get services from settings or use defaults, filter enabled only
  const configuredServices = settings?.landingPage?.serviceBlocks || [];
  const servicesToDisplay = configuredServices.length > 0
    ? configuredServices.filter(s => s.enabled).map(service => ({
        ...service,
        icon: (LucideIcons as any)[service.iconName] || LucideIcons.Wrench
      }))
    : defaultServices;

  return (
    <section className={`py-20 ${
      isDark
        ? 'bg-gradient-to-b from-slate-900 to-slate-950'
        : 'bg-gradient-to-b from-gray-50 to-gray-100'
    }`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Our Services
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive plumbing solutions for residential and commercial properties
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {servicesToDisplay.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id || index}
                className={`backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:shadow-cyan-500/20'
                    : 'bg-white/70 border-gray-300 hover:border-blue-500/50 hover:shadow-blue-500/20'
                }`}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                    isDark
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/50'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/50'
                  }`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}