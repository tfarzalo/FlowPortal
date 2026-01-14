import mongoose from 'mongoose';
import { config } from 'dotenv';
import FormConfiguration from '../models/FormConfiguration';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/flowportal';

async function initializeFormConfig() {
  try {
    console.log('[InitFormConfig] Connecting to database...');
    await mongoose.connect(DATABASE_URL);
    console.log('[InitFormConfig] Connected successfully');

    // Check if booking config already exists
    const existingConfig = await FormConfiguration.findOne({ formType: 'booking' });

    if (existingConfig) {
      console.log('[InitFormConfig] Booking form configuration already exists');
      console.log('[InitFormConfig] Config ID:', existingConfig._id);
      process.exit(0);
    }

    // Create default booking configuration
    const defaultConfig = {
      formType: 'booking',
      formName: 'Book Service',
      enabled: true,
      fields: [
        {
          id: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your full name',
          order: 1,
          enabled: true,
        },
        {
          id: 'phone',
          label: 'Phone Number',
          type: 'phone',
          required: true,
          placeholder: '(555) 123-4567',
          order: 2,
          enabled: true,
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'your.email@example.com',
          order: 3,
          enabled: true,
        },
        {
          id: 'service',
          label: 'Service Needed',
          type: 'select',
          required: true,
          options: [
            'Plumbing Repair',
            'Water Heater Service',
            'Drain Cleaning',
            'Fixture Installation',
            'Emergency Service',
            'Bathroom Remodel',
            'Other',
          ],
          order: 4,
          enabled: true,
        },
        {
          id: 'preferredDate',
          label: 'Preferred Date',
          type: 'date',
          required: true,
          order: 5,
          enabled: true,
        },
        {
          id: 'preferredTime',
          label: 'Preferred Time',
          type: 'select',
          required: true,
          options: [
            '8:00 AM - 10:00 AM',
            '10:00 AM - 12:00 PM',
            '12:00 PM - 2:00 PM',
            '2:00 PM - 4:00 PM',
            '4:00 PM - 6:00 PM',
          ],
          order: 6,
          enabled: true,
        },
        {
          id: 'address',
          label: 'Service Address',
          type: 'text',
          required: true,
          placeholder: 'Street address',
          order: 7,
          enabled: true,
        },
        {
          id: 'message',
          label: 'Additional Details',
          type: 'textarea',
          required: false,
          placeholder: 'Please describe the issue or service needed',
          order: 8,
          enabled: true,
        },
      ],
      serviceOptions: [
        'Plumbing Repair',
        'Water Heater Service',
        'Drain Cleaning',
        'Fixture Installation',
        'Emergency Service',
        'Bathroom Remodel',
        'Other',
      ],
      availableTimes: [
        '8:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '12:00 PM - 2:00 PM',
        '2:00 PM - 4:00 PM',
        '4:00 PM - 6:00 PM',
      ],
      emailConfiguration: {
        enabled: true,
        recipients: ['info@newportplumbing.com'],
        subject: 'New Service Booking Request',
        fromName: 'Newport Plumbing Website',
        fromEmail: 'noreply@newportplumbing.com',
        includeAllFields: true,
        customMessage: 'You have received a new service booking request.',
      },
      successMessage: 'Thank you for your booking request! We will contact you shortly to confirm your appointment.',
    };

    const config = new FormConfiguration(defaultConfig);
    await config.save();

    console.log('[InitFormConfig] Booking form configuration created successfully');
    console.log('[InitFormConfig] Config ID:', config._id);
    console.log('[InitFormConfig] Form Type:', config.formType);
    console.log('[InitFormConfig] Form Name:', config.formName);
    console.log('[InitFormConfig] Number of fields:', config.fields.length);
    console.log('[InitFormConfig] Email notifications enabled:', config.emailConfiguration.enabled);

    process.exit(0);
  } catch (error) {
    console.error('[InitFormConfig] Error:', error);
    process.exit(1);
  }
}

initializeFormConfig();
