import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getReviews, Review } from "@/api/reviews";
import { toast } from "sonner";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export function ReviewsSection() {
  const { settings } = useSiteSettings();
  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log('Fetching reviews...');
        const data = await getReviews();
        setReviews(data.reviews);
        console.log('Reviews loaded:', data.reviews.length);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const handlePrevious = () => {
    console.log('Previous review clicked');
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    console.log('Next review clicked');
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const getVisibleReviews = () => {
    if (reviews.length === 0) return [];
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(reviews[(currentIndex + i) % reviews.length]);
    }
    return visible;
  };

  if (loading) {
    return (
      <section className={`py-20 ${
        isDark
          ? 'bg-gradient-to-b from-slate-950 to-slate-900'
          : 'bg-gradient-to-b from-white to-gray-50'
      }`}>
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className={`animate-pulse ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading reviews...</div>
          </div>
        </div>
      </section>
    );
  }

  const visibleReviews = getVisibleReviews();

  return (
    <section className={`py-20 ${
      isDark
        ? 'bg-gradient-to-b from-slate-950 to-slate-900'
        : 'bg-gradient-to-b from-white to-gray-50'
    }`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            What Our Customers Say
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {visibleReviews.map((review, index) => (
              <Card
                key={review.id}
                className={`backdrop-blur-sm transition-all duration-500 ${
                  isDark
                    ? `bg-slate-800/50 border-slate-700 ${index === 0 ? 'md:scale-105 border-cyan-500/50' : ''}`
                    : `bg-white border-gray-300 shadow-lg ${index === 0 ? 'md:scale-105 border-blue-400' : ''}`
                }`}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400 fill-yellow-400' : (isDark ? 'text-gray-600' : 'text-gray-300')
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{review.text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{review.customerName}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{review.location}</div>
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className={isDark
                ? 'border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600'
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? (isDark ? 'bg-cyan-400 w-8' : 'bg-blue-600 w-8')
                      : (isDark ? 'bg-slate-700' : 'bg-gray-300')
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className={isDark
                ? 'border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600'
              }
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
