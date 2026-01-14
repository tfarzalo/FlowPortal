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

interface ExportData {
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

async function exportData() {
  try {
    console.log('Starting data export...');

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Fetch all data
    console.log('Fetching site settings...');
    const siteSettings = await SiteSettings.find({}).lean();

    console.log('Fetching users...');
    const users = await User.find({}).lean();

    console.log('Fetching pages...');
    const pages = await Page.find({}).lean();

    console.log('Fetching posts...');
    const posts = await Post.find({}).lean();

    console.log('Fetching media...');
    const media = await Media.find({}).lean();

    console.log('Fetching form configurations...');
    const formConfigurations = await FormConfiguration.find({}).lean();

    console.log('Fetching form entries...');
    const formEntries = await FormEntry.find({}).lean();

    // Prepare export data
    const exportData: ExportData = {
      siteSettings,
      users,
      pages,
      posts,
      media,
      formConfigurations,
      formEntries,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `database-export-${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log('\n=== Export Summary ===');
    console.log(`Site Settings: ${siteSettings.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Pages: ${pages.length}`);
    console.log(`Posts: ${posts.length}`);
    console.log(`Media: ${media.length}`);
    console.log(`Form Configurations: ${formConfigurations.length}`);
    console.log(`Form Entries: ${formEntries.length}`);
    console.log('\n======================');
    console.log(`✅ Data exported successfully to: ${filepath}`);
    console.log(`Total file size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  }
}

exportData();
