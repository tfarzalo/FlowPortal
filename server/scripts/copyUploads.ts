import fs from 'fs';
import path from 'path';

/**
 * This script copies uploaded files to a specified destination
 * Usage: npm run copy:uploads <destination-path>
 * Example: npm run copy:uploads /path/to/production/uploads
 */

function copyDirectory(src: string, dest: string) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  let fileCount = 0;
  let totalSize = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      const stats = fs.statSync(srcPath);
      fileCount++;
      totalSize += stats.size;
      console.log(`✅ Copied: ${entry.name} (${(stats.size / 1024).toFixed(2)} KB)`);
    }
  }

  return { fileCount, totalSize };
}

async function copyUploads() {
  try {
    const destination = process.argv[2];

    if (!destination) {
      console.error('❌ Error: Please provide the destination path');
      console.log('\nUsage: npm run copy:uploads <destination-path>');
      console.log('Example: npm run copy:uploads /var/www/production/uploads');
      console.log('\nOr for local testing:');
      console.log('Example: npm run copy:uploads ./backup/uploads');
      process.exit(1);
    }

    const sourceDir = path.join(process.cwd(), 'uploads');

    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`❌ Error: Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    console.log('📂 Starting file copy...');
    console.log(`Source: ${sourceDir}`);
    console.log(`Destination: ${destination}\n`);

    const { fileCount, totalSize } = copyDirectory(sourceDir, destination);

    console.log('\n=== Copy Summary ===');
    console.log(`Files copied: ${fileCount}`);
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('===================');
    console.log('\n🎉 Upload files copied successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error copying uploads:', error);
    process.exit(1);
  }
}

copyUploads();
