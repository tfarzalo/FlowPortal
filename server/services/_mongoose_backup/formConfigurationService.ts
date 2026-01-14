import FormConfiguration, { IFormConfiguration, IFormField, IEmailConfiguration } from '../models/FormConfiguration';

export class FormConfigurationService {
  /**
   * Get form configuration by type
   */
  static async getConfigByType(formType: string): Promise<IFormConfiguration | null> {
    console.log(`[FormConfigurationService] Fetching config for form type: ${formType}`);
    const config = await FormConfiguration.findOne({ formType });

    if (!config) {
      console.log('[FormConfigurationService] Config not found, returning default');
      return null;
    }

    return config;
  }

  /**
   * Get all form configurations
   */
  static async getAllConfigs(): Promise<IFormConfiguration[]> {
    console.log('[FormConfigurationService] Fetching all form configurations');
    const configs = await FormConfiguration.find().sort({ createdAt: -1 });
    console.log(`[FormConfigurationService] Found ${configs.length} configurations`);
    return configs;
  }

  /**
   * Create or update form configuration
   */
  static async upsertConfig(data: {
    formType: string;
    formName: string;
    fields: IFormField[];
    emailConfiguration: IEmailConfiguration;
    serviceOptions?: string[];
    availableDates?: {
      startDate?: Date;
      endDate?: Date;
      excludedDates?: Date[];
    };
    availableTimes?: string[];
    successMessage?: string;
    enabled?: boolean;
  }): Promise<IFormConfiguration> {
    console.log(`[FormConfigurationService] Upserting config for form type: ${data.formType}`);

    const config = await FormConfiguration.findOneAndUpdate(
      { formType: data.formType },
      { $set: data },
      { new: true, upsert: true }
    );

    console.log('[FormConfigurationService] Config saved successfully');
    return config;
  }

  /**
   * Delete form configuration
   */
  static async deleteConfig(formType: string): Promise<boolean> {
    console.log(`[FormConfigurationService] Deleting config for form type: ${formType}`);

    const result = await FormConfiguration.findOneAndDelete({ formType });

    if (!result) {
      console.log('[FormConfigurationService] Config not found for deletion');
      return false;
    }

    console.log('[FormConfigurationService] Config deleted successfully');
    return true;
  }

  /**
   * Get default booking form configuration
   */
  static getDefaultBookingConfig(): Partial<IFormConfiguration> {
    return {
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
  }
}

export default FormConfigurationService;
