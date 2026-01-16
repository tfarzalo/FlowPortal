import { HeroSection } from "@/components/landing/HeroSection";
import { ContactBar } from "@/components/landing/ContactBar";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { LicensingSection } from "@/components/landing/LicensingSection";
import { ShowroomSection } from "@/components/landing/ShowroomSection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { BookingForm } from "@/components/landing/BookingForm";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { toast } from "sonner";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import ComingSoonPage from "./ComingSoonPage";

export function LandingPage() {
  const { settings, loading } = useSiteSettings();

  // Show loading state while checking
  if (loading && !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show Coming Soon page if mode is enabled
  if (settings?.comingSoonMode) {
    console.log('[LandingPage] Coming soon mode is enabled');
    return <ComingSoonPage />;
  }

  const scrollToBookingForm = () => {
    console.log('Scrolling to booking form');
    const element = document.getElementById('booking-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCallClick = () => {
    console.log('[LandingPage] Call button clicked');
    const phoneNumber = settings?.contactPhone?.replace(/\D/g, '') || '5412657030';
    const formattedPhone = settings?.contactPhone || '(541) 265-7030';

    // Check if on mobile device
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // On desktop, copy to clipboard
      navigator.clipboard.writeText(formattedPhone).then(() => {
        toast.success('Phone number copied to clipboard!');
      }).catch(() => {
        toast.info(`Call us at: ${formattedPhone}`);
      });
    }
  };

  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950' : 'light bg-gray-50'}`}>
      <ContactBar />
      <HeroSection onScheduleClick={scrollToBookingForm} onCallClick={handleCallClick} />
      <div id="services">
        <ServicesSection />
      </div>
      <div id="licensing">
        <LicensingSection />
      </div>
      <div id="showroom">
        <ShowroomSection />
      </div>
      <div id="reviews">
        <ReviewsSection />
      </div>
      <BookingForm />
      <LandingFooter />
    </div>
  );
}
