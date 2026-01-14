import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Media from '../models/Media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadNewportLogo() {
  try {
    console.log('[UploadNewportLogo] Starting newport logo upload...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowportal';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    // Check if newport logo already exists
    const existingLogo = await Media.findOne({ originalName: 'newport-plumbing-logo.png' });
    if (existingLogo) {
      console.log('[UploadNewportLogo] ✓ Newport logo already exists in database');
      console.log(`  ID: ${existingLogo._id}`);
      console.log(`  URL: ${existingLogo.url}`);
      await mongoose.connection.close();
      return;
    }

    // Create the uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('[UploadNewportLogo] Created uploads directory');
    }

    // Create a sample newport logo file (you can replace this with actual file later)
    const logoFilename = `newport-plumbing-logo-${Date.now()}.png`;
    const logoPath = path.join(uploadsDir, logoFilename);

    // For now, copy from the existing uploaded file as a placeholder
    const existingFile = path.join(uploadsDir, 'file-1762221290643-611627211.png');
    if (fs.existsSync(existingFile)) {
      fs.copyFileSync(existingFile, logoPath);
      console.log('[UploadNewportLogo] Created logo file from existing sample');
    } else {
      // Create a minimal placeholder if no sample exists
      fs.writeFileSync(logoPath, 'PNG placeholder');
      console.log('[UploadNewportLogo] Created placeholder logo file');
    }

    // Get file stats
    const stats = fs.statSync(logoPath);

    // Create media record
    const newLogo = await Media.create({
      filename: logoFilename,
      originalName: 'newport-plumbing-logo.png',
      mimeType: 'image/png',
      size: stats.size,
      url: `/uploads/${logoFilename}`,
      category: 'logo',
      description: 'Newport Plumbing Company Logo'
    });

    console.log('[UploadNewportLogo] ✓ Successfully created newport logo media record');
    console.log(`  ID: ${newLogo._id}`);
    console.log(`  Filename: ${newLogo.filename}`);
    console.log(`  Original Name: ${newLogo.originalName}`);
    console.log(`  URL: ${newLogo.url}`);
    console.log(`  Category: ${newLogo.category}`);
    console.log(`  Size: ${(newLogo.size / 1024).toFixed(2)} KB`);

    await mongoose.connection.close();
    console.log('[UploadNewportLogo] ✅ Upload completed successfully!');
  } catch (error) {
    console.error('[UploadNewportLogo] ❌ Error:', error);
    process.exit(1);
  }
}

uploadNewportLogo();
