import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitBooking } from "@/api/booking";
import { toast } from "sonner";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Please select a date"),
  preferredTime: z.string().min(1, "Please select a time"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  message: z.string().optional(),
  smsConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to receive communications to submit this form",
  }),
});

type FormData = z.infer<typeof formSchema>;

const services = [
  "Remodel & New Construction",
  "Residential Repair",
  "Commercial Repair",
  "Water Heater Service",
  "Fixture & Faucet Repair",
  "Whole House Repipe",
  "Emergency Service",
  "General Inquiry"
];

const timeSlots = ["Morning (8AM-12PM)", "Afternoon (1PM-5PM)", "Emergency (ASAP)"];

export function BookingForm() {
  const { settings } = useSiteSettings();
  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      service: "",
      preferredDate: "",
      preferredTime: "",
      address: "",
      message: "",
      smsConsent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form submission started:', data);
    setIsSubmitting(true);

    try {
      const bookingData = {
        ...data,
        message: data.message || '', // Ensure message is always a string
      };
      const response = await submitBooking(bookingData);
      console.log('Booking submitted successfully:', response);
      toast.success(response.message || "Booking request submitted successfully!");
      form.reset();
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please call us directly at (541) 265-7030");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <section id="booking-form" className={`py-20 ${
      isDark
        ? 'bg-gradient-to-b from-slate-900 to-slate-950'
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <Card className={`backdrop-blur-sm shadow-2xl ${
            isDark
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-300'
          }`}>
            <CardHeader className="text-center">
              <CardTitle className={`text-3xl md:text-4xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Schedule Your Service
              </CardTitle>
              <CardDescription className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Fill out the form below and we'll contact you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDark ? 'text-gray-300' : 'text-gray-700'}>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              className={
                                isDark
                                  ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-500'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDark ? 'text-gray-300' : 'text-gray-700'}>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(541) 555-0123"
                              className={
                                isDark
                                  ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-500'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDark ? 'text-gray-300' : 'text-gray-700'}>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className={
                              isDark
                                ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDark ? 'text-gray-300' : 'text-gray-700'}>Service Needed *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={
                              isDark
                                ? 'bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            }>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}>
                            {services.map((service) => (
                              <SelectItem 
                                key={service} 
                                value={service} 
                                className={isDark ? 'text-white hover:bg-slate-800' : 'text-gray-900 hover:bg-gray-100'}
                              >
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={`${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <Calendar className="h-4 w-4" />
                            Preferred Date *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="date"
                                min={getTodayDate()}
                                className={`w-full cursor-pointer ${
                                  isDark
                                    ? 'bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500 [color-scheme:dark]'
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 [color-scheme:light]'
                                }`}
                                onClick={(e) => {
                                  // Trigger the date picker when clicking anywhere on the field
                                  e.currentTarget.showPicker?.();
                                }}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={`${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <Clock className="h-4 w-4" />
                            Preferred Time *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className={
                                isDark
                                  ? 'bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500'
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                              }>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}>
                              {timeSlots.map((slot) => (
                                <SelectItem 
                                  key={slot} 
                                  value={slot} 
                                  className={isDark ? 'text-white hover:bg-slate-800' : 'text-gray-900 hover:bg-gray-100'}
                                >
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDark ? 'text-gray-300' : 'text-gray-700'}>Service Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main St, Newport, OR 97365"
                            className={
                              isDark
                                ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDark ? 'text-gray-300' : 'text-gray-700'}>Message/Details (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your plumbing issue..."
                            className={`min-h-[100px] ${
                              isDark
                                ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-cyan-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                            }`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smsConsent"
                    render={({ field }) => (
                      <FormItem className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ${
                        isDark
                          ? 'border-slate-700 bg-slate-900/30'
                          : 'border-gray-300 bg-gray-50'
                      }`}>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={
                              isDark
                                ? 'border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500'
                                : 'border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                            }
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className={`text-sm font-normal cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            By submitting this form and signing up for text messages, you consent to receive communications from Newport Plumbing in accordance with our{" "}
                            <a
                              href="https://newportplumbing.com/privacy-policy/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className={isDark ? 'text-cyan-400 hover:text-cyan-300 underline' : 'text-blue-600 hover:text-blue-700 underline'}
                            >
                              Privacy Policy
                            </a>. *
                          </FormLabel>
                          <FormMessage className="text-red-500" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg rounded-xl shadow-2xl shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Request Appointment"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}