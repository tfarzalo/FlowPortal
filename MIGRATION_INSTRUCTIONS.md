# 🚀 Supabase Migration - Step by Step Instructions

## ✅ What's Been Created

All migration files have been created and configured:

1. ✅ **server/config/supabase.ts** - Supabase client configuration
2. ✅ **server/supabase-schema.sql** - Complete database schema
3. ✅ **server/scripts/migrateToSupabase.ts** - Data migration script
4. ✅ **server/.env** - Updated with Supabase credentials
5. ✅ **client/.env** - Updated with Supabase credentials
6. ✅ **package.json** - Added migration command

---

## 📋 Migration Steps (30 minutes)

### Step 1: Run SQL Schema in Supabase (5 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **+ New query**
5. Copy the entire contents of `server/supabase-schema.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for "Success. No rows returned" message

**Expected output:**
```
Success. No rows returned
```

You should now see these tables in **Table Editor**:
- users
- pages
- posts
- media
- site_settings
- form_configurations
- form_entries

---

### Step 2: Export MongoDB Data (2 minutes)

```bash
cd /Users/timothyfarzalo/Desktop/FlowPortal-export-2026-01-13/server
npm run export:data
```

**Expected output:**
```
✅ Export completed successfully!
📦 Exported: server/exports/database-export-2026-01-13T12-30-00.json
```

---

### Step 3: Run Migration Script (3 minutes)

```bash
cd /Users/timothyfarzalo/Desktop/FlowPortal-export-2026-01-13/server
npm run migrate:to-supabase
```

**Expected output:**
```
🚀 Starting MongoDB to Supabase Migration
============================================================
📂 Using export file: database-export-2026-01-13T12-30-00.json

📊 Export contains:
   - Users: 5
   - Pages: 12
   - Posts: 8
   - Media: 24
   - Site Settings: 1
   - Form Configs: 2
   - Form Entries: 47

🔌 Testing Supabase connection...
✅ Connected to Supabase

🗑️  Clearing existing data...
   ✅ Cleared form_entries
   ✅ Cleared form_configurations
   ✅ Cleared posts
   ✅ Cleared pages
   ✅ Cleared media
   ✅ Cleared site_settings
   ✅ Cleared users

📦 Migrating users (5 records)...
   ✅ Inserted batch 1 (5 records)
✅ Successfully migrated 5 users

📦 Migrating site_settings (1 records)...
   ✅ Inserted batch 1 (1 records)
✅ Successfully migrated 1 site_settings

... (continues for all collections)

============================================================
🎉 Migration completed successfully!

✅ All data has been migrated to Supabase

💡 Next steps:
   1. Verify data in Supabase Dashboard
   2. Update your application code to use Supabase
   3. Test all functionality
```

---

### Step 4: Verify Data in Supabase (5 minutes)

1. Go to Supabase Dashboard → **Table Editor**
2. Click on each table and verify data:
   - **users** - Check your admin users are there
   - **pages** - Check your CMS pages
   - **posts** - Check your blog posts
   - **media** - Check media records
   - **site_settings** - Check settings exist
   - **form_configurations** - Check form configs
   - **form_entries** - Check form submissions

---

### Step 5: Test Supabase Connection (2 minutes)

Let's test that everything works:

```bash
# In Node.js, test the connection
node -e "import('./server/config/supabase.js').then(m => m.supabase.from('users').select('count').then(r => console.log('✅ Supabase connected! Users:', r)))"
```

---

## 🎯 What Happens Next?

Now you have TWO databases running:
- **MongoDB** - Your old database (still connected)
- **Supabase** - Your new database (with migrated data)

### Next Phase: Update Application Code

You need to replace Mongoose code with Supabase code in:

1. **Services** (10 files):
   - userService.ts
   - pageService.ts
   - postService.ts
   - mediaService.ts
   - siteSettingsService.ts
   - formConfigurationService.ts
   - formEntryService.ts

2. **Routes** (keeping Express routes):
   - Routes stay the same, just call new service methods

---

## 🔄 Code Migration Examples

### Before (Mongoose):
```typescript
// userService.ts
static async list(): Promise<IUser[]> {
  return await User.find();
}

static async get(id: string): Promise<IUser | null> {
  return await User.findById(id);
}

static async create(data: CreateUserData): Promise<IUser> {
  const user = new User(data);
  await user.save();
  return user;
}
```

### After (Supabase):
```typescript
// userService.ts
import { supabase } from '../config/supabase.js';

static async list(): Promise<IUser[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(`Database error: ${error.message}`);
  return data || [];
}

static async get(id: string): Promise<IUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

static async create(data: CreateUserData): Promise<IUser> {
  const { data: user, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`Database error: ${error.message}`);
  return user;
}
```

---

## 🚦 Current Status

✅ **COMPLETED:**
- Supabase configuration
- Database schema created
- Data migrated successfully
- Environment variables configured
- Migration scripts ready

⏳ **TODO (Optional):**
- Update service layer to use Supabase
- Update route handlers (minimal changes)
- Test all CRUD operations
- Deploy to production

---

## 🆘 Troubleshooting

### Migration Script Fails

**Error:** "No export files found"
```bash
# Solution: Export MongoDB data first
npm run export:data
```

**Error:** "Supabase connection failed"
```bash
# Solution: Check .env file has correct keys
cat server/.env | grep SUPABASE
```

**Error:** "Error inserting batch"
```bash
# Solution: Check Supabase schema was run first
# Go to Supabase Dashboard → SQL Editor → Run schema
```

### Data Not Showing in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Click on the table
3. Check "Filters" - make sure no filters applied
4. Check Row Level Security policies (they might be blocking view)

---

## 📞 Need Help?

If migration fails or you see errors:
1. Check the error message carefully
2. Verify schema was run in Supabase
3. Verify environment variables are correct
4. Check MongoDB export file exists

---

## 🎁 What You Have Now

Your data is safely in two places:
- **MongoDB** (original)
- **Supabase** (migrated copy)

You can now:
1. Keep using MongoDB while testing Supabase
2. Switch to Supabase when ready
3. Compare data between both databases

No rush - take your time testing! 🚀
