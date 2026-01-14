import { Router, Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import FormEntryService from '../services/formEntryService';
import FormConfigurationService, { IFormConfiguration } from '../services/formConfigurationService';
import EmailService from '../services/emailService';
import { SiteSettingsService } from '../services/siteSettingsService';
import { transformKeysToCamel, transformKeysToSnake } from '../utils/dataTransformers';

const router = Router();

// ============================================
// Form Entry Routes
// ============================================

// Description: Get all form entries with optional filtering
// Endpoint: GET /api/forms/entries
// Request: { formType?, status?, startDate?, endDate?, searchQuery? }
// Response: { entries: Array<IFormEntry> }
router.get('/entries', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log('[FormRoutes] GET /entries - Fetching form entries');

    const { formType, status, startDate, endDate, searchQuery } = req.query;

    const filters: Record<string, string | Date> = {};
    if (formType) filters.formType = formType as string;
    if (status) filters.status = status as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (searchQuery) filters.searchQuery = searchQuery as string;

    const entries = await FormEntryService.getAllEntries(filters);

    res.status(200).json({ entries: transformKeysToCamel(entries) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error fetching entries:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get a single form entry by ID
// Endpoint: GET /api/forms/entries/:id
// Request: {}
// Response: { entry: IFormEntry }
router.get('/entries/:id', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log(`[FormRoutes] GET /entries/${req.params.id} - Fetching form entry`);

    const entry = await FormEntryService.getEntryById(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Form entry not found' });
    }

    res.status(200).json({ entry: transformKeysToCamel(entry) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error fetching entry:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Update form entry status and notes
// Endpoint: PATCH /api/forms/entries/:id
// Request: { status?, notes? }
// Response: { entry: IFormEntry }
router.patch('/entries/:id', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log(`[FormRoutes] PATCH /entries/${req.params.id} - Updating form entry`);

    const { status, notes } = req.body;

    const entry = await FormEntryService.updateEntry(req.params.id, { status, notes });

    if (!entry) {
      return res.status(404).json({ error: 'Form entry not found' });
    }

    res.status(200).json({ entry: transformKeysToCamel(entry) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error updating entry:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Delete a form entry
// Endpoint: DELETE /api/forms/entries/:id
// Request: {}
// Response: { success: boolean }
router.delete('/entries/:id', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log(`[FormRoutes] DELETE /entries/${req.params.id} - Deleting form entry`);

    const success = await FormEntryService.deleteEntry(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Form entry not found' });
    }

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error deleting entry:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get form entry statistics
// Endpoint: GET /api/forms/entries/stats
// Request: {}
// Response: { total, byStatus, byFormType, recentCount }
router.get('/entries-stats', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log('[FormRoutes] GET /entries-stats - Fetching statistics');

    const stats = await FormEntryService.getStats();

    res.status(200).json(stats);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error fetching stats:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================
// Form Configuration Routes
// ============================================

// Description: Get all form configurations
// Endpoint: GET /api/forms/configurations
// Request: {}
// Response: { configurations: Array<IFormConfiguration> }
router.get('/configurations', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log('[FormRoutes] GET /configurations - Fetching all configurations');

    const configurations = await FormConfigurationService.getAllConfigs();

    res.status(200).json({ configurations });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error fetching configurations:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get form configuration by type
// Endpoint: GET /api/forms/configurations/:formType
// Request: {}
// Response: { configuration: IFormConfiguration }
router.get('/configurations/:formType', async (req: Request, res: Response) => {
  try {
    console.log(`[FormRoutes] GET /configurations/${req.params.formType} - Fetching configuration`);

    let configuration = await FormConfigurationService.getConfigByType(req.params.formType);

    // If no config exists and it's booking form, return default
    if (!configuration && req.params.formType === 'booking') {
      const defaultConfig = FormConfigurationService.getDefaultBookingConfig();
      configuration = defaultConfig as IFormConfiguration;
    }

    if (!configuration) {
      return res.status(404).json({ error: 'Form configuration not found' });
    }

    res.status(200).json({ configuration });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error fetching configuration:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Create or update form configuration
// Endpoint: POST /api/forms/configurations
// Request: { formType, formName, fields, emailConfiguration, serviceOptions?, availableDates?, availableTimes?, successMessage?, enabled? }
// Response: { configuration: IFormConfiguration }
router.post('/configurations', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log('[FormRoutes] POST /configurations - Creating/updating configuration');

    const configuration = await FormConfigurationService.upsertConfig(req.body);

    res.status(200).json({ configuration });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error saving configuration:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Delete form configuration
// Endpoint: DELETE /api/forms/configurations/:formType
// Request: {}
// Response: { success: boolean }
router.delete('/configurations/:formType', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log(`[FormRoutes] DELETE /configurations/${req.params.formType} - Deleting configuration`);

    const success = await FormConfigurationService.deleteConfig(req.params.formType);

    if (!success) {
      return res.status(404).json({ error: 'Form configuration not found' });
    }

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error deleting configuration:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Test email configuration
// Endpoint: POST /api/forms/test-email
// Request: { emailConfiguration: IEmailConfiguration }
// Response: { success: boolean, messageId?, testUrl?, error? }
router.post('/test-email', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log('[FormRoutes] POST /test-email - Testing email configuration');

    const { emailConfiguration } = req.body;

    if (!emailConfiguration) {
      return res.status(400).json({ error: 'Email configuration is required' });
    }

    const result = await EmailService.testEmailConfig(emailConfiguration);

    res.status(200).json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error testing email:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Initialize default form configurations
// Endpoint: POST /api/forms/initialize
// Request: {}
// Response: { success: boolean, configurations: Array<IFormConfiguration> }
router.post('/initialize', requireUser(['admin']), async (req: Request, res: Response) => {
  try {
    console.log('[FormRoutes] POST /initialize - Initializing default configurations');

    // Check if booking config already exists
    const existingConfig = await FormConfigurationService.getConfigByType('booking');

    if (existingConfig) {
      return res.status(200).json({
        success: true,
        message: 'Configurations already initialized',
        configurations: [existingConfig],
      });
    }

    // Create default booking configuration
    const defaultConfig = FormConfigurationService.getDefaultBookingConfig();
    const configuration = await FormConfigurationService.upsertConfig(defaultConfig);

    res.status(200).json({
      success: true,
      message: 'Default configurations initialized',
      configurations: [configuration],
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FormRoutes] Error initializing configurations:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================
// Public Form Submission Routes
// ============================================

// Description: Submit a booking request
// Endpoint: POST /api/forms/booking
// Request: { fullName, phone, email, service, preferredDate, preferredTime, message, address }
// Response: { success: boolean, message: string, bookingId: string }
router.post('/booking', async (req: Request, res: Response) => {
  try {
    console.log('[FormRoutes] POST /booking - Receiving booking request');

    const { fullName, phone, email, service, preferredDate, preferredTime, message, address } = req.body;

    // Validate required fields
    if (!fullName || !phone || !email || !service || !preferredDate || !preferredTime || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Get client IP and user agent
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Create form entry
    const entry = await FormEntryService.createEntry({
      form_type: 'booking',
      data: {
        service,
        preferredDate,
        preferredTime,
        address,
        message: message || '',
      },
      customer_name: fullName,
      customer_email: email,
      customer_phone: phone,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    console.log('[FormRoutes] Form entry created:', entry.id);

    // Get form configuration for email settings
    const config = await FormConfigurationService.getByFormType('booking');

    // Get site settings for site URL
    const siteSettings = await SiteSettingsService.get();
    const siteUrl = siteSettings?.site_url || undefined;
    console.log('[FormRoutes] Using site URL for email:', siteUrl);

    // Send email notification if configured
    if (config && config.email_configuration.enabled) {
      console.log('[FormRoutes] Sending email notification');
      const emailResult = await EmailService.sendFormNotification(entry, config.email_configuration, siteUrl);

      if (emailResult.success) {
        console.log('[FormRoutes] Email sent successfully');
        if (emailResult.testUrl) {
          console.log('[FormRoutes] Email preview URL:', emailResult.testUrl);
        }
      } else {
        console.error('[FormRoutes] Failed to send email:', emailResult.error);
      }
    }

    res.status(201).json({
      success: true,
      message: config?.success_message || 'Thank you! We will contact you within 24 hours to confirm your appointment.',
      bookingId: String(entry.id),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
    console.error('[FormRoutes] Error processing booking:', errorMessage);
    console.error('[FormRoutes] Error details:', errorDetails);
    res.status(500).json({
      success: false,
      error: 'Failed to process booking request. Please try again.',
    });
  }
});

export default router;
