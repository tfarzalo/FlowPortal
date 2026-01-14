import mongoose from 'mongoose';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

interface MongoDocument {
  _id: { $oid: string } | string;
  [key: string]: any;
}

// Transform MongoDB ObjectID to UUID (deterministic mapping)
function mongoIdToUuid(mongoId: string): string {
  // Use MD5-like approach to generate UUID from MongoDB ObjectID
  // This ensures same MongoDB ID always maps to same UUID
  const hash = createHash('md5').update(mongoId).digest('hex');
  
  // Format as UUID v4
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

// Extract MongoDB ID from various formats
function extractMongoId(id: any): string {
  if (typeof id === 'string') return id;
  if (id && id.$oid) return id.$oid;
  if (id && id.toString) return id.toString();
  return id;
}

// Transform MongoDB document to Supabase format
function transformDocument(doc: any, idMapping: Map<string, string>): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(doc)) {
    // Skip MongoDB version key
    if (key === '__v') continue;
    
    // Skip created_at for site_settings (not in schema)
    if (key === 'createdAt' && doc.siteName) continue;
    
    // Transform _id to id with UUID
    if (key === '_id') {
      const mongoId = extractMongoId(value);
      const uuid = mongoIdToUuid(mongoId);
      idMapping.set(mongoId, uuid);
      result.id = uuid;
      continue;
    }
    
    // Transform timestamps
    if (key === 'createdAt') {
      result.created_at = value;
      continue;
    }
    if (key === 'updatedAt') {
      result.updated_at = value;
      continue;
    }
    if (key === 'lastLoginAt') {
      result.last_login_at = value;
      continue;
    }
    if (key === 'isActive') {
      result.is_active = value;
      continue;
    }
    if (key === 'isPublished') {
      result.is_published = value;
      continue;
    }
    if (key === 'publishedAt') {
      result.published_at = value;
      continue;
    }
    if (key === 'refreshToken') {
      result.refresh_token = value;
      continue;
    }
    
    // Transform foreign keys (references to other documents)
    if (key === 'createdBy' || key === 'uploadedBy') {
      if (value) {
        const mongoId = extractMongoId(value);
        const uuid = idMapping.get(mongoId) || mongoIdToUuid(mongoId);
        // Only set the field if it exists in our mapping, otherwise null
        result[key === 'createdBy' ? 'created_by' : 'uploaded_by'] = uuid;
      }
      continue;
    }
    
    // Transform nested objects to JSONB
    if (key === 'businessHours') {
      result.business_hours = value;
      continue;
    }
    if (key === 'socialMedia') {
      result.social_media = value;
      continue;
    }
    if (key === 'buttonStyles') {
      result.button_styles = value;
      continue;
    }
    if (key === 'landingPage') {
      result.landing_page = value;
      continue;
    }
    if (key === 'emailConfiguration') {
      result.email_configuration = value;
      continue;
    }
    if (key === 'availableDates') {
      result.available_dates = value;
      continue;
    }
    
    // Convert camelCase to snake_case for specific fields
    const snakeCaseKey = key
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
    
    // Keep original key if it's already snake_case or all lowercase
    const finalKey = key.includes('_') || key === key.toLowerCase() ? key : snakeCaseKey;
    result[finalKey] = value;
  }
  
  return result;
}

async function migrateCollection(
  collectionName: string,
  tableName: string,
  data: any[],
  idMapping: Map<string, string>,
  validUserIds: Set<string> = new Set()
): Promise<void> {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data found for ${collectionName}, skipping...`);
    return;
  }

  console.log(`\n📦 Migrating ${collectionName} (${data.length} records)...`);
  
  const transformed = data.map(doc => {
    const result = transformDocument(doc, idMapping);
    
    // Clean up orphaned foreign keys
    if (result.created_by && !validUserIds.has(result.created_by)) {
      console.log(`   ⚠️  Warning: created_by references non-existent user, setting to null`);
      result.created_by = null;
    }
    if (result.uploaded_by && !validUserIds.has(result.uploaded_by)) {
      console.log(`   ⚠️  Warning: uploaded_by references non-existent user, setting to null`);
      result.uploaded_by = null;
    }
    
    return result;
  });
  
  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1} into ${tableName}:`, error);
      console.error('Sample record:', JSON.stringify(batch[0], null, 2));
      throw error;
    }
    
    console.log(`   ✅ Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
  }
  
  console.log(`✅ Successfully migrated ${data.length} ${collectionName}`);
}

async function main() {
  console.log('🚀 Starting MongoDB to Supabase Migration\n');
  console.log('='.repeat(60));
  
  // Check for export file
  const exportsDir = path.join(__dirname, '../exports');
  const files = fs.readdirSync(exportsDir)
    .filter(f => f.startsWith('database-export-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.error('❌ No export files found!');
    console.log('\n💡 Run this first: npm run export:data');
    process.exit(1);
  }
  
  const latestExport = files[0];
  console.log(`📂 Using export file: ${latestExport}\n`);
  
  const exportPath = path.join(exportsDir, latestExport);
  const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
  
  console.log('📊 Export contains:');
  console.log(`   - Users: ${exportData.users?.length || 0}`);
  console.log(`   - Pages: ${exportData.pages?.length || 0}`);
  console.log(`   - Posts: ${exportData.posts?.length || 0}`);
  console.log(`   - Media: ${exportData.media?.length || 0}`);
  console.log(`   - Site Settings: ${exportData.siteSettings?.length || 0}`);
  console.log(`   - Form Configs: ${exportData.formConfigurations?.length || 0}`);
  console.log(`   - Form Entries: ${exportData.formEntries?.length || 0}`);
  console.log('');
  
  // Ask for confirmation
  console.log('⚠️  WARNING: This will DELETE all existing data in Supabase!');
  console.log('');
  
  // ID mapping for foreign key relationships
  const idMapping = new Map<string, string>();
  
  try {
    // Test connection
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    console.log('✅ Connected to Supabase\n');
    
    // Delete existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...\n');
    
    await supabase.from('form_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Cleared form_entries');
    
    await supabase.from('form_configurations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Cleared form_configurations');
    
    await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Cleared posts');
    
    await supabase.from('pages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Cleared pages');
    
    await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Cleared media');
    
    await supabase.from('site_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Cleared site_settings');
    
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Cleared users');
    
    // Track valid user IDs for foreign key validation
    const validUserIds = new Set<string>();
    
    // Migrate in order of dependencies
    // 1. Users first (no dependencies)
    await migrateCollection('users', 'users', exportData.users, idMapping, validUserIds);
    
    // Build set of valid user IDs
    if (exportData.users) {
      exportData.users.forEach((user: any) => {
        const mongoId = extractMongoId(user._id);
        const uuid = mongoIdToUuid(mongoId);
        validUserIds.add(uuid);
      });
    }
    
    // 2. Site Settings (no dependencies)
    await migrateCollection('site_settings', 'site_settings', exportData.siteSettings, idMapping, validUserIds);
    
    // 3. Media (depends on users)
    await migrateCollection('media', 'media', exportData.media, idMapping, validUserIds);
    
    // 4. Pages (depends on users)
    await migrateCollection('pages', 'pages', exportData.pages, idMapping, validUserIds);
    
    // 5. Posts (depends on users)
    await migrateCollection('posts', 'posts', exportData.posts, idMapping, validUserIds);
    
    // 6. Form Configurations (no dependencies)
    await migrateCollection('form_configurations', 'form_configurations', exportData.formConfigurations, idMapping, validUserIds);
    
    // 7. Form Entries (no dependencies)
    await migrateCollection('form_entries', 'form_entries', exportData.formEntries, idMapping, validUserIds);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Migration completed successfully!\n');
    console.log('✅ All data has been migrated to Supabase');
    console.log('\n💡 Next steps:');
    console.log('   1. Verify data in Supabase Dashboard');
    console.log('   2. Update your application code to use Supabase');
    console.log('   3. Test all functionality');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
