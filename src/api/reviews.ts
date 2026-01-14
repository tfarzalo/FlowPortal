import api from './api';

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  date: string;
  location: string;
  source: 'google' | 'yelp';
}

// Description: Get customer reviews
// Endpoint: GET /api/reviews
// Request: {}
// Response: { reviews: Array<Review> }
export const getReviews = () => {
  console.log('Fetching customer reviews');
  // Mocking the response
  return new Promise<{ reviews: Review[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        reviews: [
          {
            id: '1',
            customerName: 'Sarah M.',
            rating: 5,
            text: 'Excellent service! They responded to our emergency call within an hour and fixed our burst pipe quickly. Very professional and reasonably priced.',
            date: '2024-01-15',
            location: 'Newport, OR',
            source: 'google'
          },
          {
            id: '2',
            customerName: 'John D.',
            rating: 5,
            text: 'Best plumber in Newport! They installed our new water heater and did an amazing job. Clean work and great communication throughout the process.',
            date: '2024-01-10',
            location: 'Newport, OR',
            source: 'yelp'
          },
          {
            id: '3',
            customerName: 'Maria L.',
            rating: 5,
            text: 'Highly recommend! Fixed our drain issue that other plumbers couldn\'t solve. Very knowledgeable and friendly team.',
            date: '2024-01-05',
            location: 'Newport, OR',
            source: 'google'
          },
          {
            id: '4',
            customerName: 'Robert K.',
            rating: 5,
            text: 'Professional and reliable. They\'ve been our go-to plumber for years. Always on time and fair pricing.',
            date: '2023-12-28',
            location: 'Newport, OR',
            source: 'google'
          },
          {
            id: '5',
            customerName: 'Jennifer P.',
            rating: 5,
            text: 'Outstanding service! They handled our commercial plumbing needs efficiently. Will definitely use them again.',
            date: '2023-12-20',
            location: 'Newport, OR',
            source: 'yelp'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/reviews');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};