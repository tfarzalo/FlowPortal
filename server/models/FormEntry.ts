import mongoose, { Document, Schema } from 'mongoose';

export interface IFormEntry extends Document {
  formType: string; // 'contact', 'booking', etc.
  data: Record<string, unknown>; // Dynamic form fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const formEntrySchema = new Schema<IFormEntry>(
  {
    formType: {
      type: String,
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    customerName: {
      type: String,
      index: true,
    },
    customerEmail: {
      type: String,
      index: true,
    },
    customerPhone: {
      type: String,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true,
    },
    notes: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
formEntrySchema.index({ createdAt: -1 });
formEntrySchema.index({ formType: 1, status: 1 });

const FormEntry = mongoose.model<IFormEntry>('FormEntry', formEntrySchema);

export default FormEntry;
