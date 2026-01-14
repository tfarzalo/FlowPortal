# Database Migration Guide

This guide explains how to migrate data from your local development database to a production database instance.

## Overview

The migration process involves three main steps:
1. **Export data** from the local database to a JSON file
2. **Copy uploaded files** from the local uploads directory
3. **Import data** into the production database

## Prerequisites

- Access to both local and production environments
- MongoDB running on both environments
- SSH/FTP access to production server (for file transfer)
- Node.js and npm installed on production server

## Migration Scripts

Three migration scripts have been created:

### 1. `exportData.ts` - Export Database
Exports all database collections to a JSON file in the `/server/exports` directory.

### 2. `importData.ts` - Import Database
Imports data from a JSON export file into the target database.

### 3. `copyUploads.ts` - Copy Media Files
Copies all uploaded files from the `/server/uploads` directory to a target location.

---

## Step-by-Step Migration Process

### Step 1: Export Data from Local Database

From your local development environment:

```bash
cd server
npm run export:data
```

**What happens:**
- Connects to your local MongoDB database
- Exports all collections (users, pages, posts, media, site settings, forms, etc.)
- Creates a timestamped JSON file in `/server/exports/`
- Example filename: `database-export-2024-01-15T10-30-00.json`

**Output:**
```
=== Export Summary ===
Site Settings: 1
Users: 2
Pages: 5
Posts: 3
Media: 10
Form Configurations: 1
Form Entries: 15
======================
✅ Data exported successfully to: /path/to/exports/database-export-2024-01-15T10-30-00.json
```

---

### Step 2: Transfer Files to Production

You need to transfer two things to your production server:

#### A. Transfer the Export File

Transfer the JSON export file from `/server/exports/` to your production server.

**Using SCP (Secure Copy):**
```bash
scp server/exports/database-export-2024-01-15T10-30-00.json user@production-server:/path/to/production/server/exports/
```

**Using SFTP:**
```bash
sftp user@production-server
put server/exports/database-export-2024-01-15T10-30-00.json /path/to/production/server/exports/
```

#### B. Transfer Uploaded Files

Transfer the entire `/server/uploads/` directory to your production server.

**Option 1: Using rsync (recommended for large files):**
```bash
rsync -avz server/uploads/ user@production-server:/path/to/production/server/uploads/
```

**Option 2: Using the copy script (local to local):**
```bash
npm run copy:uploads /backup/uploads
```

**Option 3: Using SCP:**
```bash
scp -r server/uploads/* user@production-server:/path/to/production/server/uploads/
```

---

### Step 3: Configure Production Database

On your production server, ensure the `.env` file points to your production database:

```bash
# Production .env file
DATABASE_URL=mongodb://production-host:27017/flowportal-production
PORT=3000
JWT_SECRET=your-production-secret-here
```

**Important:** Use a different, secure JWT_SECRET for production!

---

### Step 4: Import Data to Production Database

SSH into your production server and run:

```bash
cd /path/to/production/server
npm run import:data database-export-2024-01-15T10-30-00.json
```

**What happens:**
- Connects to the production MongoDB database
- **⚠️ CLEARS all existing data** in the production database
- Imports all data from the JSON file
- Shows progress for each collection

**Output:**
```
⚠️  WARNING: This will replace all existing data in the database!

=== Import Summary ===
Site Settings: 1
Users: 2
Pages: 5
Posts: 3
Media: 10
Form Configurations: 1
Form Entries: 15
======================

🗑️  Clearing existing data...
✅ Existing data cleared

📥 Importing data...
✅ Site Settings imported: 1
✅ Users imported: 2
✅ Pages imported: 5
✅ Posts imported: 3
✅ Media imported: 10
✅ Form Configurations imported: 1
✅ Form Entries imported: 15

🎉 Data import completed successfully!
```

---

### Step 5: Verify Migration

After importing, verify that everything is working:

1. **Check Database Collections:**
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/flowportal-production

# Verify data
use flowportal-production
db.users.countDocuments()
db.pages.countDocuments()
db.media.countDocuments()
```

2. **Test the Application:**
- Start the production server: `npm start`
- Access the admin panel and verify data
- Check that images are loading correctly
- Test login functionality

3. **Verify Uploaded Files:**
```bash
ls -la /path/to/production/server/uploads/
```

---

## Important Notes

### Security Considerations

1. **Password Hashes:** User passwords are exported as hashed values, which is secure.

2. **JWT Tokens:** Change your `JWT_SECRET` in production to invalidate any old tokens.

3. **Sensitive Data:** Review the export file before transferring to ensure no sensitive data is exposed.

4. **File Permissions:** Ensure the uploads directory has proper permissions:
```bash
chmod 755 /path/to/production/server/uploads
```

### Database Considerations

1. **Backup First:** Always backup the production database before importing:
```bash
mongodump --uri="mongodb://production-host:27017/flowportal-production" --out=/backup/mongo-backup-$(date +%Y%m%d)
```

2. **ObjectId Preservation:** The import preserves all MongoDB ObjectIds, maintaining relationships between collections.

3. **Indexes:** MongoDB indexes are automatically recreated based on your schema definitions.

### File Upload Considerations

1. **File Paths:** The Media collection stores relative paths (e.g., `/uploads/file.png`), so files must maintain the same structure.

2. **Large Files:** For large uploads directories, use `rsync` which can resume interrupted transfers.

3. **CDN Option:** Consider using a CDN for media files in production instead of local storage.

---

## Troubleshooting

### Export Fails

**Problem:** Cannot connect to local database
```
Solution: Verify DATABASE_URL in .env and ensure MongoDB is running
```

### Import Fails

**Problem:** Duplicate key error during import
```
Solution: The import script clears data first. If this fails, manually clear collections:
mongo
use flowportal-production
db.dropDatabase()
```

### Files Not Loading

**Problem:** Images show 404 errors
```
Solution:
1. Verify uploads directory exists and has correct permissions
2. Check that Media collection URLs match file locations
3. Ensure Express static file serving is configured correctly
```

### Production Environment Variables

**Problem:** Application connects to wrong database
```
Solution: Verify .env file on production server points to production database
```

---

## Automated Migration Script (Advanced)

For frequent migrations, create a shell script:

```bash
#!/bin/bash
# migrate.sh

echo "Starting migration process..."

# Step 1: Export local data
echo "Exporting local data..."
cd server
npm run export:data

# Get the latest export file
EXPORT_FILE=$(ls -t exports/database-export-*.json | head -1)
echo "Export file: $EXPORT_FILE"

# Step 2: Transfer to production
echo "Transferring to production..."
scp $EXPORT_FILE user@production:/path/to/server/exports/
rsync -avz uploads/ user@production:/path/to/server/uploads/

# Step 3: Import on production
echo "Importing to production..."
ssh user@production "cd /path/to/server && npm run import:data $(basename $EXPORT_FILE)"

echo "Migration complete!"
```

---

## Rollback Plan

If something goes wrong, you can rollback:

1. **Restore from MongoDB backup:**
```bash
mongorestore --uri="mongodb://production-host:27017/flowportal-production" /backup/mongo-backup-20240115/
```

2. **Re-import previous export:**
```bash
npm run import:data database-export-previous.json
```

---

## Best Practices

1. ✅ **Always test in a staging environment first**
2. ✅ **Create backups before any production import**
3. ✅ **Verify data integrity after migration**
4. ✅ **Document any manual changes needed**
5. ✅ **Schedule migrations during low-traffic periods**
6. ✅ **Keep export files versioned and dated**
7. ✅ **Monitor application logs after migration**

---

## Continuous Deployment Alternative

For ongoing synchronization, consider:

1. **MongoDB Atlas:** Use MongoDB Atlas with replica sets for automatic replication
2. **Database Migrations:** Use migration tools like `migrate-mongo` for incremental changes
3. **CI/CD Pipeline:** Automate migrations as part of your deployment pipeline
4. **Separate Environments:** Keep development, staging, and production databases separate

---

## Support

If you encounter issues during migration:

1. Check the console output for error messages
2. Verify database connectivity on both ends
3. Ensure all dependencies are installed (`npm install`)
4. Review MongoDB logs for connection issues
5. Verify file permissions on uploads directory

---

## Summary Commands

```bash
# On Local Machine:
cd server
npm run export:data
scp exports/database-export-*.json user@prod:/path/to/server/exports/
rsync -avz uploads/ user@prod:/path/to/server/uploads/

# On Production Server:
cd /path/to/server
npm run import:data database-export-2024-01-15T10-30-00.json
npm start
```

---

**Last Updated:** January 2025
**Version:** 1.0.0
