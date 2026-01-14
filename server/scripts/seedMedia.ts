import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from the server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { connectDB } from '../config/database';
import Media from '../models/Media';
import fs from 'fs/promises';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function seedMedia() {
  try {
    console.log('[SeedMedia] Starting media seed script...');

    // Connect to database
    await connectDB();

    // Ensure uploads directory exists
    try {
      await fs.access(UPLOADS_DIR);
      console.log(`[SeedMedia] Uploads directory exists: ${UPLOADS_DIR}`);
    } catch {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      console.log(`[SeedMedia] Created uploads directory: ${UPLOADS_DIR}`);
    }

    // Clear existing media
    const deleteResult = await Media.deleteMany({});
    console.log(`[SeedMedia] Cleared ${deleteResult.deletedCount} existing media records`);

    // Create sample media records (without actual files)
    const sampleMedia = [
      {
        filename: 'sample-logo.png',
        originalName: 'company-logo.png',
        mimeType: 'image/png',
        size: 15360,
        url: '/uploads/sample-logo.png',
        category: 'logo',
        description: 'Company logo for website header',
      },
      {
        filename: 'sample-banner.jpg',
        originalName: 'homepage-banner.jpg',
        mimeType: 'image/jpeg',
        size: 204800,
        url: '/uploads/sample-banner.jpg',
        category: 'image',
        description: 'Homepage hero banner image',
      },
      {
        filename: 'sample-brochure.pdf',
        originalName: 'company-brochure.pdf',
        mimeType: 'application/pdf',
        size: 512000,
        url: '/uploads/sample-brochure.pdf',
        category: 'pdf',
        description: 'Company information brochure',
      },
      {
        filename: 'sample-icon.svg',
        originalName: 'service-icon.svg',
        mimeType: 'image/svg+xml',
        size: 2048,
        url: '/uploads/sample-icon.svg',
        category: 'image',
        description: 'Service category icon',
      },
      {
        filename: 'sample-doc.docx',
        originalName: 'terms-and-conditions.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 25600,
        url: '/uploads/sample-doc.docx',
        category: 'document',
        description: 'Terms and conditions document',
      },
    ];

    const insertedMedia = await Media.insertMany(sampleMedia);
    console.log(`[SeedMedia] Inserted ${insertedMedia.length} sample media records:`);

    insertedMedia.forEach((media) => {
      console.log(`  - ${media.originalName} (${media.category}): ${media._id}`);
    });

    console.log('\n[SeedMedia] ✅ Media seeding completed successfully!');
    console.log('\n[SeedMedia] Note: These are placeholder records. Actual files are not created.');
    console.log('[SeedMedia] To upload real files, use the POST /api/media/upload endpoint.\n');

    process.exit(0);
  } catch (error) {
    console.error('[SeedMedia] ❌ Error seeding media:', error);
    process.exit(1);
  }
}

seedMedia();
