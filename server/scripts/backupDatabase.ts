import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import fs from 'fs';
import path from 'path';
import SiteSettings from '../models/SiteSettings';
import User from '../models/User';
import Page from '../models/Page';
import Post from '../models/Post';
import Media from '../models/Media';
import FormConfiguration from '../models/FormConfiguration';
import FormEntry from '../models/FormEntry';

dotenv.config();

interface BackupData {
  siteSettings: any[];
  users: any[];
  pages: any[];
  posts: any[];
  media: any[];
  formConfigurations: any[];
  formEntries: any[];
  exportedAt: string;
  version: string;
  environment: string;
  description?: string;
}

async function backupDatabase() {
  try {
    // Get optional description from command line
    const description = process.argv[2];

    console.log('🔄 Starting database backup...');
    if (description) {
      console.log(`📝 Backup description: ${description}`);
    }

    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Fetch all data
    console.log('\n📦 Fetching data...');
    const [
      siteSettings,
      users,
      pages,
      posts,
      media,
      formConfigurations,
      formEntries
    ] = await Promise.all([
      SiteSettings.find({}).lean(),
      User.find({}).lean(),
      Page.find({}).lean(),
      Post.find({}).lean(),
      Media.find({}).lean(),
      FormConfiguration.find({}).lean(),
      FormEntry.find({}).lean()
    ]);

    // Prepare backup data
    const backupData: BackupData = {
      siteSettings,
      users,
      pages,
      posts,
      media,
      formConfigurations,
      formEntries,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      description: description || undefined
    };

    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'exports', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Generate filename with timestamp and optional description
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const descriptionSlug = description
      ? `-${description.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      : '';
    const filename = `backup-${timestamp}${descriptionSlug}.json`;
    const filepath = path.join(backupsDir, filename);

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    // Calculate statistics
    const totalRecords =
      siteSettings.length +
      users.length +
      pages.length +
      posts.length +
      media.length +
      formConfigurations.length +
      formEntries.length;

    console.log('\n=== Backup Summary ===');
    console.log(`Environment: ${backupData.environment}`);
    console.log(`Timestamp: ${backupData.exportedAt}`);
    if (description) {
      console.log(`Description: ${description}`);
    }
    console.log('\nCollections:');
    console.log(`  Site Settings: ${siteSettings.length}`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Pages: ${pages.length}`);
    console.log(`  Posts: ${posts.length}`);
    console.log(`  Media: ${media.length}`);
    console.log(`  Form Configurations: ${formConfigurations.length}`);
    console.log(`  Form Entries: ${formEntries.length}`);
    console.log(`\nTotal Records: ${totalRecords}`);
    console.log('======================');
    console.log(`\n✅ Backup created successfully!`);
    console.log(`📁 Location: ${filepath}`);
    console.log(`📊 File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    // Clean up old backups (keep last 10)
    cleanupOldBackups(backupsDir, 10);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    process.exit(1);
  }
}

function cleanupOldBackups(backupsDir: string, keepCount: number) {
  try {
    const files = fs.readdirSync(backupsDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupsDir, file),
        time: fs.statSync(path.join(backupsDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first

    if (files.length > keepCount) {
      console.log(`\n🧹 Cleaning up old backups (keeping ${keepCount} most recent)...`);
      const filesToDelete = files.slice(keepCount);

      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`   Deleted: ${file.name}`);
      });

      console.log(`✅ Cleanup complete. Deleted ${filesToDelete.length} old backup(s).`);
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not clean up old backups:', error);
  }
}

backupDatabase();
