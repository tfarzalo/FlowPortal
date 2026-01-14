# Database Migration System

## Overview

FlowPortal now includes a complete database migration system to help you move data between environments (local → staging → production).

## 📚 Documentation

We've created comprehensive documentation for database migration:

1. **[MIGRATION_QUICK_START.md](./MIGRATION_QUICK_START.md)** - Quick reference for fast migrations (start here!)
2. **[DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)** - Complete detailed guide with troubleshooting
3. **[server/exports/README.md](./server/exports/README.md)** - Information about export files

## 🛠️ Available Commands

| Command | Description | Usage Example |
|---------|-------------|---------------|
| `npm run export:data` | Export all database data to JSON | `npm run export:data` |
| `npm run import:data <file>` | Import data from export file | `npm run import:data backup.json` |
| `npm run backup:db <desc>` | Create labeled backup with auto-cleanup | `npm run backup:db "before migration"` |
| `npm run copy:uploads <dest>` | Copy uploaded files to destination | `npm run copy:uploads /backup/path` |

All commands should be run from the `server` directory.

## 🚀 Quick Start

### Scenario 1: Export Local Database

```bash
cd server
npm run export:data
```

This creates: `server/exports/database-export-2024-01-15T10-30-00.json`

---

### Scenario 2: Create a Labeled Backup

```bash
cd server
npm run backup:db "Before major update"
```

This creates: `server/exports/backups/backup-2024-01-15T10-30-00-before-major-update.json`

**Benefits:**
- Automatic cleanup (keeps last 10 backups)
- Descriptive naming
- Stored in dedicated backups folder

---

### Scenario 3: Migrate to Production

```bash
# Step 1: Export from local
cd server
npm run export:data

# Step 2: Transfer to production server
scp exports/database-export-*.json user@prod:/path/to/server/exports/
rsync -avz uploads/ user@prod:/path/to/server/uploads/

# Step 3: SSH to production and import
ssh user@prod
cd /path/to/server
npm run import:data database-export-2024-01-15T10-30-00.json
```

---

## 📦 What Gets Exported

Each export includes:
- ✅ Site Settings (logo, colors, contact info, etc.)
- ✅ Users (with hashed passwords)
- ✅ Pages (CMS content)
- ✅ Posts (blog posts)
- ✅ Media metadata (file records)
- ✅ Form Configurations
- ✅ Form Entries (submissions)

**Note:** Actual uploaded files (images, PDFs) are NOT included in exports. Use `npm run copy:uploads` to transfer them separately.

---

## ⚠️ Important Warnings

1. **Destructive Import:** `import:data` DELETES all existing data before importing
2. **Backup First:** Always backup production database before importing
3. **Test First:** Try imports on staging before production
4. **JWT Secret:** Change `JWT_SECRET` in production .env file
5. **Environment Variables:** Verify production .env points to correct database

---

## 📁 File Locations

```
server/
├── exports/                          # Export files location
│   ├── database-export-*.json       # Timestamped exports
│   ├── backups/                     # Labeled backups
│   │   └── backup-*.json           # Auto-managed backups
│   └── README.md                    # Export directory info
├── uploads/                         # Media files (copy separately)
└── scripts/                         # Migration scripts
    ├── exportData.ts               # Export script
    ├── importData.ts               # Import script
    ├── backupDatabase.ts           # Backup with auto-cleanup
    └── copyUploads.ts              # Copy uploaded files
```

---

## 🔍 Verifying Migration

After importing to production:

```bash
# Check database
mongosh
use flowportal-production
db.users.countDocuments()
db.pages.countDocuments()

# Test the application
curl http://your-server.com:3000/ping

# Check uploads
ls -la uploads/
```

---

## 💡 Common Use Cases

### Use Case 1: Regular Backups
```bash
# Create daily backup with description
npm run backup:db "Daily backup $(date +%Y-%m-%d)"
```

### Use Case 2: Pre-Deployment Backup
```bash
# Before deploying changes
npm run backup:db "Pre-deployment v2.0"
```

### Use Case 3: Clone to Staging
```bash
# Export from production
npm run export:data

# Import to staging
npm run import:data database-export-latest.json
```

### Use Case 4: Disaster Recovery
```bash
# Import from most recent backup
cd server/exports/backups
ls -t backup-*.json | head -1  # Find latest
cd ../..
npm run import:data backups/backup-latest.json
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check `DATABASE_URL` in `.env` file |
| "File not found" | Verify file path and that export completed |
| "Permission denied" on uploads | Run `chmod 755 uploads` |
| Images not loading after migration | Verify uploads directory was copied |
| Duplicate key error | Import script should clear data first - check logs |

---

## 🔒 Security Considerations

1. **Export Files:** Contain sensitive data - never commit to git
2. **Passwords:** Exported as hashes (secure)
3. **JWT Tokens:** Invalidated when you change JWT_SECRET
4. **Transfer:** Use secure methods (SCP, SFTP, rsync over SSH)
5. **Production .env:** Use different secrets than development

---

## 📊 Export File Structure

```json
{
  "siteSettings": [...],
  "users": [...],
  "pages": [...],
  "posts": [...],
  "media": [...],
  "formConfigurations": [...],
  "formEntries": [...],
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "description": "Optional description"
}
```

---

## 🎯 Best Practices

1. ✅ **Regular Backups:** Use `backup:db` before major changes
2. ✅ **Test Imports:** Always test on staging first
3. ✅ **Keep History:** Don't delete old backups immediately
4. ✅ **Document Changes:** Use descriptive backup names
5. ✅ **Verify After Import:** Check data integrity after migration
6. ✅ **Schedule Wisely:** Migrate during low-traffic periods
7. ✅ **Monitor Logs:** Watch application logs during migration

---

## 🔄 Automated Migration Example

Create a shell script for automated migrations:

```bash
#!/bin/bash
# migrate-to-production.sh

set -e  # Exit on error

echo "🚀 Starting production migration..."

# Step 1: Create backup of current production
echo "📦 Creating production backup..."
ssh user@prod "cd /path/to/server && npm run backup:db 'Pre-migration backup'"

# Step 2: Export from local
echo "📤 Exporting local database..."
cd server
npm run export:data
EXPORT_FILE=$(ls -t exports/database-export-*.json | head -1)

# Step 3: Transfer files
echo "🚚 Transferring files to production..."
scp $EXPORT_FILE user@prod:/path/to/server/exports/
rsync -avz uploads/ user@prod:/path/to/server/uploads/

# Step 4: Import on production
echo "📥 Importing to production..."
ssh user@prod "cd /path/to/server && npm run import:data $(basename $EXPORT_FILE)"

# Step 5: Restart production server
echo "🔄 Restarting production server..."
ssh user@prod "cd /path/to/server && pm2 restart all"

echo "✅ Migration complete!"
```

---

## 📞 Need Help?

- Read the [Quick Start Guide](./MIGRATION_QUICK_START.md) for simple migrations
- Check the [Detailed Guide](./DATABASE_MIGRATION_GUIDE.md) for advanced topics
- Review logs for error messages
- Verify environment variables in `.env`

---

## 🎉 Summary

You now have a complete database migration system that allows you to:
- Export data from any environment
- Import data to any environment
- Create labeled backups with auto-cleanup
- Transfer uploaded files between servers
- Verify data integrity after migration

**Ready to migrate? Start with the [Quick Start Guide](./MIGRATION_QUICK_START.md)!**

---

**Last Updated:** January 2025
**Version:** 1.0.0
