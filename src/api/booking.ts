import { submitForm } from './forms';

// Description: Submit a booking request
// Endpoint: POST /api/forms/booking
// Request: { fullName: string, phone: string, email: string, service: string, preferredDate: string, preferredTime: string, message: string, address: string }
// Response: { success: boolean, message: string, bookingId: string }
export const submitBooking = async (data: {
  fullName: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  address: string;
  smsConsent: boolean;
}) => {
  console.log('Submitting booking request:', data);
  try {
    const entry = await submitForm('booking', data);
    return {
      success: true,
      message: 'Booking request submitted successfully!',
      bookingId: entry.id || entry._id || '',
    };
  } catch (error: unknown) {
    console.error('Error submitting booking:', error);
    const err = error as { message?: string };
    throw new Error(err?.message || 'An error occurred');
  }
};
