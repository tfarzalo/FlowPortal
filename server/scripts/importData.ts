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

interface ImportData {
  siteSettings: any[];
  users: any[];
  pages: any[];
  posts: any[];
  media: any[];
  formConfigurations: any[];
  formEntries: any[];
  exportedAt: string;
  version: string;
}

async function importData() {
  try {
    // Get filename from command line argument
    const filename = process.argv[2];
    if (!filename) {
      console.error('❌ Error: Please provide the export file name');
      console.log('Usage: npm run import:data <filename>');
      console.log('Example: npm run import:data database-export-2024-01-15T10-30-00.json');
      process.exit(1);
    }

    const filepath = path.join(process.cwd(), 'exports', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error(`❌ Error: File not found: ${filepath}`);
      process.exit(1);
    }

    console.log(`📂 Reading data from: ${filepath}`);

    // Read and parse the export file
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    const importData: ImportData = JSON.parse(fileContent);

    console.log(`📅 Export date: ${importData.exportedAt}`);
    console.log(`📦 Export version: ${importData.version}`);

    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will replace all existing data in the database!');
    console.log('\n=== Import Summary ===');
    console.log(`Site Settings: ${importData.siteSettings.length}`);
    console.log(`Users: ${importData.users.length}`);
    console.log(`Pages: ${importData.pages.length}`);
    console.log(`Posts: ${importData.posts.length}`);
    console.log(`Media: ${importData.media.length}`);
    console.log(`Form Configurations: ${importData.formConfigurations.length}`);
    console.log(`Form Entries: ${importData.formEntries.length}`);
    console.log('======================\n');

    // In production, you might want to add a confirmation prompt here
    // For now, we'll proceed automatically

    console.log('Starting import...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await SiteSettings.deleteMany({});
    await User.deleteMany({});
    await Page.deleteMany({});
    await Post.deleteMany({});
    await Media.deleteMany({});
    await FormConfiguration.deleteMany({});
    await FormEntry.deleteMany({});
    console.log('✅ Existing data cleared');

    // Import data
    console.log('\n📥 Importing data...');

    if (importData.siteSettings.length > 0) {
      await SiteSettings.insertMany(importData.siteSettings);
      console.log(`✅ Site Settings imported: ${importData.siteSettings.length}`);
    }

    if (importData.users.length > 0) {
      await User.insertMany(importData.users);
      console.log(`✅ Users imported: ${importData.users.length}`);
    }

    if (importData.pages.length > 0) {
      await Page.insertMany(importData.pages);
      console.log(`✅ Pages imported: ${importData.pages.length}`);
    }

    if (importData.posts.length > 0) {
      await Post.insertMany(importData.posts);
      console.log(`✅ Posts imported: ${importData.posts.length}`);
    }

    if (importData.media.length > 0) {
      await Media.insertMany(importData.media);
      console.log(`✅ Media imported: ${importData.media.length}`);
    }

    if (importData.formConfigurations.length > 0) {
      await FormConfiguration.insertMany(importData.formConfigurations);
      console.log(`✅ Form Configurations imported: ${importData.formConfigurations.length}`);
    }

    if (importData.formEntries.length > 0) {
      await FormEntry.insertMany(importData.formEntries);
      console.log(`✅ Form Entries imported: ${importData.formEntries.length}`);
    }

    console.log('\n🎉 Data import completed successfully!');
    console.log('⚠️  Note: Remember to copy the /uploads folder manually to the production server');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importData();
