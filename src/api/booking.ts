import api from './api';

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
    const response = await api.post('/api/forms/booking', data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error submitting booking:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};