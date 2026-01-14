import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  category: string;
  tags: string[];
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
  },
  featuredImageUrl: {
    type: String,
  },
  category: {
    type: String,
    default: 'uncategorized',
  },
  tags: [{
    type: String,
  }],
  metaDescription: {
    type: String,
  },
  metaKeywords: {
    type: String,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  versionKey: false,
  timestamps: true,
});

const Post = mongoose.model<IPost>('Post', schema);

export default Post;
