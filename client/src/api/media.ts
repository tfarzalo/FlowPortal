import api from './api';

export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mimeType?: string;
  size: number;
  url: string;
  category: 'image' | 'logo' | 'pdf' | 'document' | 'other';
  description?: string;
  uploadedBy?: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Description: Upload a new media file
// Endpoint: POST /api/media/upload
// Request: FormData with file field and optional category, description
// Response: { media: Media }
export const uploadMedia = async (file: File, category?: string, description?: string): Promise<Media> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);

    const response = await api.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.media;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get all media files with optional filtering
// Endpoint: GET /api/media
// Request: { category?: string }
// Response: { media: Array<Media> }
export const getMedia = async (category?: string): Promise<Media[]> => {
  try {
    const params = category ? { category } : {};
    const response = await api.get('/api/media', { params });
    return response.data.media;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get a single media file by ID
// Endpoint: GET /api/media/:id
// Request: { id: string }
// Response: { media: Media }
export const getMediaById = async (id: string): Promise<Media> => {
  try {
    const response = await api.get(`/api/media/${id}`);
    return response.data.media;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Update media metadata
// Endpoint: PATCH /api/media/:id
// Request: { description?: string, category?: string }
// Response: { media: Media }
export const updateMedia = async (
  id: string,
  updates: { description?: string; category?: string }
): Promise<Media> => {
  try {
    const response = await api.patch(`/api/media/${id}`, updates);
    return response.data.media;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Delete a media file
// Endpoint: DELETE /api/media/:id
// Request: { id: string }
// Response: { success: boolean }
export const deleteMedia = async (id: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/api/media/${id}`);
    return response.data.success;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};
