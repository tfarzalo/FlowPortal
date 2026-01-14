# Database Migration - Quick Start Guide

A simplified guide for migrating your FlowPortal database from local to production.

## 🚀 Quick Migration (3 Steps)

### Step 1: Export Local Data
```bash
cd server
npm run export:data
```
This creates a file like `exports/database-export-2024-01-15T10-30-00.json`

---

### Step 2: Transfer to Production

**Transfer the export file:**
```bash
scp server/exports/database-export-*.json user@your-server:/path/to/production/server/exports/
```

**Transfer uploaded files:**
```bash
rsync -avz server/uploads/ user@your-server:/path/to/production/server/uploads/
```

---

### Step 3: Import to Production

**SSH to production server:**
```bash
ssh user@your-server
cd /path/to/production/server
npm run import:data database-export-2024-01-15T10-30-00.json
```

---

## ⚠️ Important Warnings

1. **Backup First!** The import will DELETE all existing production data
2. **Test First!** Try this on a staging environment before production
3. **Update .env** Make sure production `.env` has correct DATABASE_URL
4. **Change JWT_SECRET** Use a different secret in production

---

## 📋 Pre-Migration Checklist

- [ ] Export local database
- [ ] Backup production database (if exists)
- [ ] Update production .env file
- [ ] Transfer export file to production
- [ ] Transfer uploads directory to production
- [ ] Verify MongoDB is running on production
- [ ] Run import on production
- [ ] Verify data after import
- [ ] Test application functionality

---

## 🔍 Verify Migration

**Check data counts:**
```bash
# On production server
mongosh
use flowportal-production
db.users.countDocuments()
db.pages.countDocuments()
db.media.countDocuments()
```

**Test the app:**
- Visit your production URL
- Login to admin panel
- Check that images load
- Verify all content is present

---

## 🆘 Emergency Rollback

If something goes wrong:

```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/flowportal-production" /backup/path
```

---

## 📞 Need Help?

See [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) for detailed instructions and troubleshooting.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run export:data` | Export all data from current database |
| `npm run import:data <file>` | Import data from export file |
| `npm run copy:uploads <dest>` | Copy uploads directory to destination |

---

## Example Full Migration

```bash
# 1. Export from local
cd /Users/me/projects/flowportal/server
npm run export:data

# 2. Get the filename
ls -t exports/database-export-*.json | head -1
# Output: exports/database-export-2024-01-15T10-30-00.json

# 3. Transfer files
scp exports/database-export-2024-01-15T10-30-00.json user@myserver.com:/var/www/flowportal/server/exports/
rsync -avz uploads/ user@myserver.com:/var/www/flowportal/server/uploads/

# 4. Import on production
ssh user@myserver.com
cd /var/www/flowportal/server
npm run import:data database-export-2024-01-15T10-30-00.json

# 5. Start the server
npm start

# 6. Test
curl http://myserver.com:3000/ping
```

---

## 💡 Pro Tips

1. **Name your exports:** Include a description in the filename for easy identification
2. **Keep exports:** Don't delete old exports - they're your backup
3. **Test locally first:** Import to a local test database before production
4. **Schedule wisely:** Run migrations during low-traffic hours
5. **Monitor logs:** Watch server logs during and after migration

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot connect to database" | Check DATABASE_URL in .env |
| "Permission denied" on uploads | Run `chmod 755 uploads` |
| Images not loading | Verify uploads directory path matches Media collection URLs |
| Duplicate key error | Database wasn't cleared - manually drop and retry |
| Import takes too long | Normal for large databases - be patient |

---

**Ready to migrate? Start with Step 1!** ☝️
