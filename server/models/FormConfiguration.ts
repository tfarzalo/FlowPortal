import mongoose, { Document, Schema } from 'mongoose';

export interface IFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date' | 'time' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  order: number;
  enabled: boolean;
}

export interface IEmailConfiguration {
  enabled: boolean;
  recipients: string[]; // Email addresses to send to
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  includeAllFields: boolean;
  customMessage?: string;
}

export interface IFormConfiguration extends Document {
  formType: string; // 'contact', 'booking', etc.
  formName: string;
  fields: IFormField[];
  emailConfiguration: IEmailConfiguration;
  serviceOptions?: string[]; // For booking forms
  availableDates?: {
    startDate?: Date;
    endDate?: Date;
    excludedDates?: Date[];
  };
  availableTimes?: string[];
  successMessage?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const formFieldSchema = new Schema<IFormField>(
  {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'email', 'phone', 'textarea', 'select', 'date', 'time', 'checkbox'],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
    },
    options: [{
      type: String,
    }],
    order: {
      type: Number,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const emailConfigurationSchema = new Schema<IEmailConfiguration>(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    recipients: [{
      type: String,
      required: true,
    }],
    subject: {
      type: String,
      required: true,
    },
    fromName: {
      type: String,
      required: true,
    },
    fromEmail: {
      type: String,
      required: true,
    },
    replyTo: {
      type: String,
    },
    includeAllFields: {
      type: Boolean,
      default: true,
    },
    customMessage: {
      type: String,
    },
  },
  { _id: false }
);

const formConfigurationSchema = new Schema<IFormConfiguration>(
  {
    formType: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    formName: {
      type: String,
      required: true,
    },
    fields: [formFieldSchema],
    emailConfiguration: {
      type: emailConfigurationSchema,
      required: true,
    },
    serviceOptions: [{
      type: String,
    }],
    availableDates: {
      startDate: Date,
      endDate: Date,
      excludedDates: [Date],
    },
    availableTimes: [{
      type: String,
    }],
    successMessage: {
      type: String,
      default: 'Thank you for your submission! We will get back to you soon.',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const FormConfiguration = mongoose.model<IFormConfiguration>('FormConfiguration', formConfigurationSchema);

export default FormConfiguration;
