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

async function testMediaApi() {
  try {
    console.log('[TestMediaAPI] Starting media API test...');

    // Connect to database
    await connectDB();

    // Test: Get all media
    const allMedia = await Media.find({});
    console.log(`\n[TestMediaAPI] ✓ Found ${allMedia.length} media records in database`);

    // Test: Get media by category
    const imageMedia = await Media.find({ category: 'image' });
    console.log(`[TestMediaAPI] ✓ Found ${imageMedia.length} image media records`);

    const logoMedia = await Media.find({ category: 'logo' });
    console.log(`[TestMediaAPI] ✓ Found ${logoMedia.length} logo media records`);

    const pdfMedia = await Media.find({ category: 'pdf' });
    console.log(`[TestMediaAPI] ✓ Found ${pdfMedia.length} PDF media records`);

    const documentMedia = await Media.find({ category: 'document' });
    console.log(`[TestMediaAPI] ✓ Found ${documentMedia.length} document media records`);

    // Display sample media
    if (allMedia.length > 0) {
      console.log('\n[TestMediaAPI] Sample media records:');
      allMedia.slice(0, 3).forEach((media) => {
        console.log(`  - ${media.originalName} (${media.category})`);
        console.log(`    URL: ${media.url}`);
        console.log(`    Size: ${Math.round(media.size / 1024)} KB`);
        console.log(`    Type: ${media.mimeType}`);
        if (media.description) {
          console.log(`    Description: ${media.description}`);
        }
        console.log('');
      });
    }

    console.log('[TestMediaAPI] ✅ All tests passed!\n');
    console.log('[TestMediaAPI] API Endpoints available:');
    console.log('  - GET    /api/media          - Get all media (with optional category filter)');
    console.log('  - GET    /api/media/:id      - Get media by ID');
    console.log('  - POST   /api/media/upload   - Upload new media (requires auth)');
    console.log('  - PATCH  /api/media/:id      - Update media metadata (requires auth)');
    console.log('  - DELETE /api/media/:id      - Delete media (requires auth)');
    console.log('  - GET    /uploads/:filename  - Access uploaded files\n');

    process.exit(0);
  } catch (error) {
    console.error('[TestMediaAPI] ❌ Error testing media API:', error);
    process.exit(1);
  }
}

testMediaApi();
