# Form Management System

## Overview

The Form Management System provides a complete solution for managing contact and booking forms, including:
- Dynamic form configuration
- Form submission logging
- Email notifications
- Admin management interface

## Features

### 1. Form Entries Management
- View all form submissions in a centralized admin interface
- Filter by status (new, read, replied, archived)
- Filter by form type (booking, contact, etc.)
- Search by customer name, email, or phone
- View detailed submission information
- Add internal notes to submissions
- Update submission status
- Delete submissions
- Statistics dashboard showing total entries, new entries, and recent activity

### 2. Form Configuration
- Customize form fields (add, edit, remove, reorder)
- Configure service options for booking forms
- Set available time slots
- Customize success messages
- Enable/disable forms
- Full email notification configuration

### 3. Email Notifications
- Automatic email notifications on form submission
- Configurable recipients (multiple email addresses)
- Customizable email templates
- HTML and plain text formatting
- Reply-to configuration
- Test email functionality
- Falls back to test email service (Ethereal) if SMTP is not configured

## API Endpoints

### Form Entries

#### Get All Entries
```
GET /api/forms/entries
Query Parameters:
  - formType: string (optional)
  - status: string (optional) - new, read, replied, archived
  - startDate: string (optional)
  - endDate: string (optional)
  - searchQuery: string (optional)
Response: { entries: FormEntry[] }
```

#### Get Single Entry
```
GET /api/forms/entries/:id
Response: { entry: FormEntry }
```

#### Update Entry
```
PATCH /api/forms/entries/:id
Body: { status?, notes? }
Response: { entry: FormEntry }
```

#### Delete Entry
```
DELETE /api/forms/entries/:id
Response: { success: boolean }
```

#### Get Statistics
```
GET /api/forms/entries-stats
Response: { total, byStatus, byFormType, recentCount }
```

### Form Configuration

#### Get All Configurations
```
GET /api/forms/configurations
Response: { configurations: FormConfiguration[] }
```

#### Get Configuration by Type
```
GET /api/forms/configurations/:formType
Response: { configuration: FormConfiguration }
```

#### Save Configuration
```
POST /api/forms/configurations
Body: FormConfiguration
Response: { configuration: FormConfiguration }
```

#### Delete Configuration
```
DELETE /api/forms/configurations/:formType
Response: { success: boolean }
```

#### Test Email
```
POST /api/forms/test-email
Body: { emailConfiguration: EmailConfiguration }
Response: { success, messageId?, testUrl?, error? }
```

#### Initialize Default Config
```
POST /api/forms/initialize
Response: { success, configurations }
```

### Public Form Submission

#### Submit Booking
```
POST /api/forms/booking
Body: {
  fullName: string
  phone: string
  email: string
  service: string
  preferredDate: string
  preferredTime: string
  address: string
  message?: string
}
Response: { success, message, bookingId }
```

## Database Models

### FormEntry
```typescript
{
  formType: string              // 'contact', 'booking', etc.
  data: Record<string, any>     // Dynamic form fields
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  status: 'new' | 'read' | 'replied' | 'archived'
  notes?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}
```

### FormConfiguration
```typescript
{
  formType: string                      // Unique identifier
  formName: string                      // Display name
  fields: FormField[]                   // Array of form fields
  emailConfiguration: EmailConfiguration
  serviceOptions?: string[]             // For booking forms
  availableTimes?: string[]            // For booking forms
  availableDates?: {
    startDate?: Date
    endDate?: Date
    excludedDates?: Date[]
  }
  successMessage?: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### FormField
```typescript
{
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date' | 'time' | 'checkbox'
  required: boolean
  placeholder?: string
  options?: string[]    // For select fields
  order: number
  enabled: boolean
}
```

### EmailConfiguration
```typescript
{
  enabled: boolean
  recipients: string[]           // Email addresses
  subject: string
  fromName: string
  fromEmail: string
  replyTo?: string
  includeAllFields: boolean
  customMessage?: string
}
```

## Admin Interface

### Form Entries Page
Location: `/admin/form-entries`

Features:
- Statistics cards showing totals and breakdowns
- Filtering by status and form type
- Search functionality
- Detailed view modal with:
  - Customer information
  - Status management
  - Internal notes
  - All form data
- Delete functionality with confirmation

### Form Configuration Page
Location: `/admin/form-configuration`

Features:
- General settings tab
- Service options management
- Time slots configuration
- Email notification settings with:
  - Multiple recipients
  - Custom email content
  - Test email functionality
- Real-time save and test capabilities

## Email Configuration

### SMTP Setup
Add to `server/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Development Mode
If SMTP is not configured, the system uses Ethereal (a fake SMTP service for development).
Test email preview URLs are logged to the console.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Initialize Form Configuration
```bash
npm run init-forms
# or
npx tsx scripts/initializeFormConfig.ts
```

### 3. Configure Email (Optional)
Edit `server/.env` to add SMTP credentials.

### 4. Access Admin Interface
1. Login to admin panel
2. Navigate to "Form Entries" to view submissions
3. Navigate to "Form Config" to customize forms

## Usage Example

### Submitting a Form (Frontend)
```typescript
import { submitBooking } from '@/api/booking';

const data = {
  fullName: 'John Doe',
  phone: '(555) 123-4567',
  email: 'john@example.com',
  service: 'Plumbing Repair',
  preferredDate: '2024-01-15',
  preferredTime: '10:00 AM - 12:00 PM',
  address: '123 Main St',
  message: 'Kitchen sink is leaking'
};

const result = await submitBooking(data);
// Result: { success: true, message: '...', bookingId: '...' }
```

### Managing Entries (Frontend)
```typescript
import { getFormEntries, updateFormEntry } from '@/api/forms';

// Get all entries
const { entries } = await getFormEntries({ status: 'new' });

// Update status
await updateFormEntry(entryId, { status: 'replied' });
```

## Customization

### Adding New Form Types
1. Create form configuration via admin interface or API
2. Define fields, email settings, and options
3. Create submission endpoint in `server/routes/formRoutes.ts`
4. Create frontend form component
5. Use `FormEntryService.createEntry()` to log submissions

### Customizing Email Templates
Edit `EmailService.buildFormEmailHtml()` in `server/services/emailService.ts` to customize email appearance.

## Security Notes

- All admin endpoints require authentication with admin role
- Public form endpoints have rate limiting (recommended to add)
- Form data is sanitized before storage
- Email addresses are validated
- IP addresses and user agents are logged for security

## Troubleshooting

### Emails Not Sending
1. Check SMTP credentials in `.env`
2. Verify firewall allows SMTP port
3. Check console for test email URLs (in development mode)
4. Use "Test Email" button in Form Configuration

### Forms Not Appearing
1. Check if form is enabled in configuration
2. Verify form configuration exists: `GET /api/forms/configurations/booking`
3. Run initialization script: `npx tsx scripts/initializeFormConfig.ts`

### Database Errors
1. Ensure MongoDB is running
2. Check DATABASE_URL in `.env`
3. Verify models are properly imported in server startup

## Future Enhancements

Potential improvements:
- File upload support for form submissions
- Form analytics and reporting
- Custom validation rules
- Conditional field visibility
- Integration with CRM systems
- SMS notifications
- Auto-responder emails to customers
- Form templates library
