/**
 * Supabase Media Service
 * Direct Supabase queries and storage operations for media management
 * Replaces backend API calls with direct Supabase storage and database queries
 */

import { supabase } from '../lib/supabase';

// ==================== UTILITY FUNCTIONS ====================

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
}

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
}

// ==================== TYPES ====================

export interface Media {
  _id?: string;
  id?: string;
  filename: string;
  originalName: string;
  mimeType?: string;
  size: number;
  url: string;
  category: 'image' | 'logo' | 'pdf' | 'document' | 'other';
  description?: string;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== MEDIA FUNCTIONS ====================

const STORAGE_BUCKET = 'media';

/**
 * Upload a file to Supabase Storage and create a media record
 */
export async function uploadMedia(
  file: File, 
  category?: string, 
  description?: string
): Promise<Media> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${sanitizedName}`;
  const filePath = `uploads/${filename}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('[Supabase] Error uploading file:', uploadError);
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  // Create media record in database
  const mediaData = {
    filename,
    original_name: file.name,
    mime_type: file.type,
    size: file.size,
    url: publicUrl,
    category: category || 'other',
    description: description || '',
    uploaded_by: user.id,
  };

  const { data, error } = await supabase
    .from('media')
    .insert(mediaData)
    .select()
    .single();

  if (error) {
    // Cleanup: delete uploaded file if database insert fails
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);
    
    console.error('[Supabase] Error creating media record:', error);
    throw new Error(error.message);
  }

  const camelMedia = toCamelCase(data);
  return { ...camelMedia, _id: camelMedia.id };
}

/**
 * Get all media files with optional category filter
 */
export async function getMedia(category?: string): Promise<Media[]> {
  let query = supabase.from('media').select('*');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching media:', error);
    throw new Error(error.message);
  }

  return (data || []).map(media => {
    const camelMedia = toCamelCase(media);
    return { ...camelMedia, _id: camelMedia.id };
  });
}

/**
 * Get a single media file by ID
 */
export async function getMediaById(id: string): Promise<Media> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching media:', error);
    throw new Error(error.message);
  }

  const camelMedia = toCamelCase(data);
  return { ...camelMedia, _id: camelMedia.id };
}

/**
 * Update media metadata
 */
export async function updateMedia(
  id: string,
  updates: { description?: string; category?: string }
): Promise<Media> {
  // Transform to snake_case
  const snakeUpdates = toSnakeCase(updates);

  const { data, error } = await supabase
    .from('media')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating media:', error);
    throw new Error(error.message);
  }

  const camelMedia = toCamelCase(data);
  return { ...camelMedia, _id: camelMedia.id };
}

/**
 * Delete a media file (both from storage and database)
 */
export async function deleteMedia(id: string): Promise<boolean> {
  // First, get the media record to know the filename
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('filename')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('[Supabase] Error fetching media for deletion:', fetchError);
    throw new Error(fetchError.message);
  }

  // Delete from storage
  const filePath = `uploads/${media.filename}`;
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (storageError) {
    console.error('[Supabase] Error deleting file from storage:', storageError);
    // Continue with database deletion even if storage deletion fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error('[Supabase] Error deleting media record:', dbError);
    throw new Error(dbError.message);
  }

  return true;
}
