# Media Management System

## Overview

The FlowPortal application now includes a comprehensive media management system for storing and managing images, logos, PDFs, documents, and other file types. The system provides both backend API endpoints and a frontend interface for managing media assets.

## Features

- **File Upload**: Upload various file types (images, PDFs, documents) up to 10MB
- **Category Management**: Organize media by category (image, logo, pdf, document, other)
- **Metadata Storage**: Store filename, original name, mime type, size, description, and uploader information
- **CRUD Operations**: Create, read, update, and delete media files
- **Authentication**: Protected routes requiring user authentication for uploads, updates, and deletions
- **File Serving**: Static file serving for accessing uploaded media

## Database Schema

### Media Model (`server/models/Media.ts`)

```typescript
{
  filename: string;           // System-generated unique filename
  originalName: string;       // Original filename from upload
  mimeType: string;           // File MIME type
  size: number;               // File size in bytes
  url: string;                // Access URL for the file
  category: string;           // Category: image, logo, pdf, document, other
  description?: string;       // Optional description
  uploadedBy?: ObjectId;      // Reference to User who uploaded
  createdAt: Date;            // Auto-generated timestamp
  updatedAt: Date;            // Auto-generated timestamp
}
```

## API Endpoints

### Public Endpoints

#### GET /api/media
Get all media files with optional category filtering.

**Query Parameters:**
- `category` (optional): Filter by category (image, logo, pdf, document, other)

**Response:**
```json
{
  "media": [
    {
      "_id": "...",
      "filename": "file-1234567890.jpg",
      "originalName": "my-image.jpg",
      "mimeType": "image/jpeg",
      "size": 204800,
      "url": "/uploads/file-1234567890.jpg",
      "category": "image",
      "description": "Sample image",
      "uploadedBy": { "_id": "...", "email": "user@example.com" },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/media/:id
Get a single media file by ID.

**Response:**
```json
{
  "media": { /* media object */ }
}
```

#### GET /uploads/:filename
Access uploaded files directly (static file serving).

### Protected Endpoints (Require Authentication)

#### POST /api/media/upload
Upload a new media file.

**Request:** `multipart/form-data`
- `file` (required): The file to upload
- `category` (optional): Category (auto-detected from MIME type if not provided)
- `description` (optional): File description

**Response:**
```json
{
  "media": { /* created media object */ }
}
```

#### PATCH /api/media/:id
Update media metadata.

**Request Body:**
```json
{
  "description": "Updated description",
  "category": "logo"
}
```

**Response:**
```json
{
  "media": { /* updated media object */ }
}
```

#### DELETE /api/media/:id
Delete a media file.

**Response:**
```json
{
  "success": true
}
```

## Supported File Types

The system accepts the following MIME types:
- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- **Documents**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Spreadsheets**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Text**: `text/plain`

## File Size Limits

- Maximum file size: **10MB** per file
- This can be adjusted in `server/routes/mediaRoutes.ts` in the multer configuration

## Storage

Files are stored in the `server/uploads/` directory with unique filenames to prevent collisions.

## Scripts

### Seed Media Data
```bash
npm run seed:media
```
Creates 5 sample media records in the database for testing purposes.

### Test Media API
```bash
npm run test:media
```
Runs tests to verify the media API is working correctly.

## Frontend Interface

### Media Management Page

Access the media management interface at: **http://localhost:5173/media**

Features:
- **Upload Form**: Upload new files with category and description
- **Media Library**: Browse all uploaded media with filtering
- **Category Filter**: Filter media by category
- **Edit Mode**: Update media metadata (description, category)
- **Delete**: Remove media files
- **Download**: Access/download media files
- **Authentication**: Login required for upload, edit, and delete operations

### Frontend API (`client/src/api/media.ts`)

```typescript
// Upload media
uploadMedia(file: File, category?: string, description?: string): Promise<Media>

// Get all media
getMedia(category?: string): Promise<Media[]>

// Get media by ID
getMediaById(id: string): Promise<Media>

// Update media
updateMedia(id: string, updates: { description?: string; category?: string }): Promise<Media>

// Delete media
deleteMedia(id: string): Promise<boolean>
```

## Usage Examples

### Backend (Express Route)
```typescript
import { MediaService } from '../services/mediaService';

// Get all images
const images = await MediaService.getMediaByCategory('image');

// Get media by ID
const media = await MediaService.getMediaById(mediaId);
```

### Frontend (React Component)
```typescript
import { getMedia, uploadMedia } from '@/api/media';

// Fetch all media
const mediaList = await getMedia();

// Upload a file
const file = fileInputRef.current.files[0];
const media = await uploadMedia(file, 'image', 'My uploaded image');
```

## Security Considerations

1. **Authentication**: Upload, update, and delete operations require authentication
2. **File Type Validation**: Only allowed MIME types can be uploaded
3. **File Size Limits**: 10MB maximum file size
4. **Unique Filenames**: System-generated filenames prevent conflicts and potential attacks

## Future Enhancements

Potential improvements for the media system:
- Image resizing and thumbnail generation
- Cloud storage integration (AWS S3, Cloudinary, etc.)
- Advanced search and filtering
- Bulk operations
- Image optimization
- Access control and permissions
- Usage tracking and analytics
