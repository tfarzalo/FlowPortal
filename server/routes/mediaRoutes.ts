import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { MediaService } from '../services/mediaService';
import { requireUser } from './middlewares/auth';
import { IUser } from '../services/userService';
import { transformKeysToCamel, transformKeysToSnake } from '../utils/dataTransformers';

interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Configure multer for file uploads
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
(async () => {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    console.log(`[MediaRoutes] Created uploads directory: ${UPLOADS_DIR}`);
  }
})();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

// Helper function to determine category from mime type
function getCategoryFromMimeType(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else if (
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet') ||
    mimeType === 'text/plain'
  ) {
    return 'document';
  }
  return 'other';
}

// Description: Upload a new media file
// Endpoint: POST /api/media/upload
// Request: multipart/form-data with file field and optional category, description
// Response: { media: IMedia }
router.post('/upload', requireUser(), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      console.log('[MediaRoutes] Upload failed: No file provided');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[MediaRoutes] Processing upload: ${req.file.originalname}`);

    const category = req.body.category || getCategoryFromMimeType(req.file.mimetype);
    const description = req.body.description || '';

    const mediaData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      category,
      description,
      uploadedBy: req.user?.id,
    };

    const media = await MediaService.createMedia(mediaData);

    console.log(`[MediaRoutes] File uploaded successfully: ${media.id}`);
    res.status(201).json({ media: transformKeysToCamel(media) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MediaRoutes] Error uploading file: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get all media files with optional filtering
// Endpoint: GET /api/media
// Request: { category?: string }
// Response: { media: Array<IMedia> }
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const filter: Record<string, string> = {};
    if (category && typeof category === 'string') {
      filter.category = category;
    }

    const media = await MediaService.getAllMedia(filter);

    console.log(`[MediaRoutes] Retrieved ${media.length} media files`);
    res.status(200).json({ media: transformKeysToCamel(media) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MediaRoutes] Error fetching media: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get a single media file by ID
// Endpoint: GET /api/media/:id
// Request: { id: string }
// Response: { media: IMedia }
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const media = await MediaService.getMediaById(id);

    if (!media) {
      console.log(`[MediaRoutes] Media not found: ${id}`);
      return res.status(404).json({ error: 'Media not found' });
    }

    console.log(`[MediaRoutes] Retrieved media: ${id}`);
    res.status(200).json({ media: transformKeysToCamel(media) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MediaRoutes] Error fetching media: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Update media metadata
// Endpoint: PATCH /api/media/:id
// Request: { description?: string, category?: string }
// Response: { media: IMedia }
router.patch('/:id', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, category } = req.body;

    const updates: Record<string, string> = {};
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;

    const media = await MediaService.updateMedia(id, updates);

    if (!media) {
      console.log(`[MediaRoutes] Media not found for update: ${id}`);
      return res.status(404).json({ error: 'Media not found' });
    }

    console.log(`[MediaRoutes] Updated media: ${id}`);
    res.status(200).json({ media: transformKeysToCamel(media) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MediaRoutes] Error updating media: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Delete a media file
// Endpoint: DELETE /api/media/:id
// Request: { id: string }
// Response: { success: boolean }
router.delete('/:id', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const success = await MediaService.deleteMedia(id, UPLOADS_DIR);

    if (!success) {
      console.log(`[MediaRoutes] Media not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Media not found' });
    }

    console.log(`[MediaRoutes] Deleted media: ${id}`);
    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MediaRoutes] Error deleting media: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
