import Media, { IMedia } from '../models/Media';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

export class MediaService {
  /**
   * Create a new media record in the database
   */
  static async createMedia(mediaData: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    category: string;
    description?: string;
    uploadedBy?: mongoose.Types.ObjectId;
  }): Promise<IMedia> {
    console.log(`[MediaService] Creating media record: ${mediaData.originalName}`);
    const media = new Media(mediaData);
    await media.save();
    console.log(`[MediaService] Media record created with ID: ${media._id}`);
    return media;
  }

  /**
   * Get all media records with optional filtering
   */
  static async getAllMedia(filter: {
    category?: string;
    uploadedBy?: mongoose.Types.ObjectId;
  } = {}): Promise<IMedia[]> {
    console.log(`[MediaService] Fetching media with filter:`, filter);
    const query: any = {};

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.uploadedBy) {
      query.uploadedBy = filter.uploadedBy;
    }

    const media = await Media.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'email');
    console.log(`[MediaService] Found ${media.length} media records`);
    return media;
  }

  /**
   * Get a single media record by ID
   */
  static async getMediaById(id: string): Promise<IMedia | null> {
    console.log(`[MediaService] Fetching media by ID: ${id}`);
    const media = await Media.findById(id).populate('uploadedBy', 'email');
    if (!media) {
      console.log(`[MediaService] Media not found with ID: ${id}`);
    }
    return media;
  }

  /**
   * Update a media record
   */
  static async updateMedia(id: string, updates: {
    description?: string;
    category?: string;
  }): Promise<IMedia | null> {
    console.log(`[MediaService] Updating media ID: ${id}`);
    const media = await Media.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (media) {
      console.log(`[MediaService] Media updated successfully: ${id}`);
    }
    return media;
  }

  /**
   * Delete a media record and its file
   */
  static async deleteMedia(id: string, uploadsDir: string): Promise<boolean> {
    console.log(`[MediaService] Deleting media ID: ${id}`);
    const media = await Media.findById(id);

    if (!media) {
      console.log(`[MediaService] Media not found for deletion: ${id}`);
      return false;
    }

    // Delete the physical file
    const filePath = path.join(uploadsDir, media.filename);
    try {
      await fs.unlink(filePath);
      console.log(`[MediaService] File deleted: ${filePath}`);
    } catch (error) {
      console.error(`[MediaService] Error deleting file: ${filePath}`, error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the database record
    await Media.findByIdAndDelete(id);
    console.log(`[MediaService] Media record deleted: ${id}`);
    return true;
  }

  /**
   * Get media by category
   */
  static async getMediaByCategory(category: string): Promise<IMedia[]> {
    console.log(`[MediaService] Fetching media by category: ${category}`);
    const media = await Media.find({ category }).sort({ createdAt: -1 });
    console.log(`[MediaService] Found ${media.length} media in category: ${category}`);
    return media;
  }
}
