# Database Migration Workflow

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE MIGRATION WORKFLOW                       │
└─────────────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT                    PRODUCTION SERVER
┌──────────────────┐                ┌──────────────────┐
│   MongoDB Local  │                │  MongoDB Prod    │
│   localhost:27017│                │  prod-host:27017 │
└────────┬─────────┘                └────────▲─────────┘
         │                                   │
         │ 1. Export                         │ 3. Import
         ▼                                   │
┌──────────────────┐    2. Transfer    ┌────┴─────────────┐
│  Export File     │ ─────────────────>│  Export File     │
│  (.json)         │     (SCP/SFTP)    │  (.json)         │
└──────────────────┘                   └──────────────────┘

┌──────────────────┐    2. Transfer    ┌──────────────────┐
│  /uploads/       │ ─────────────────>│  /uploads/       │
│  (media files)   │     (rsync/SCP)   │  (media files)   │
└──────────────────┘                   └──────────────────┘
```

---

## Step-by-Step Flow

### Phase 1: Preparation (Local)
```
┌─────────────────────────────────────────────┐
│ 1. PREPARE LOCAL ENVIRONMENT                │
├─────────────────────────────────────────────┤
│ ✓ Ensure all data is up-to-date            │
│ ✓ Test application locally                  │
│ ✓ Create backup: npm run backup:db         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 2. EXPORT DATABASE                          │
├─────────────────────────────────────────────┤
│ Command: npm run export:data                │
│                                             │
│ Creates:                                    │
│ └─ exports/database-export-TIMESTAMP.json   │
│                                             │
│ Contains:                                   │
│ ├─ Site Settings                            │
│ ├─ Users (hashed passwords)                 │
│ ├─ Pages                                    │
│ ├─ Posts                                    │
│ ├─ Media metadata                           │
│ ├─ Form Configurations                      │
│ └─ Form Entries                             │
└─────────────────────────────────────────────┘
```

### Phase 2: Transfer
```
┌─────────────────────────────────────────────┐
│ 3. TRANSFER DATA TO PRODUCTION              │
├─────────────────────────────────────────────┤
│                                             │
│ A. Transfer Export File:                    │
│    scp exports/file.json user@prod:/path/   │
│                                             │
│ B. Transfer Uploads:                        │
│    rsync -avz uploads/ user@prod:/path/     │
│                                             │
└─────────────────────────────────────────────┘
                    │
                    ▼
       ┌────────────────────────┐
       │   Files on Production   │
       │   Ready for Import      │
       └────────────────────────┘
```

### Phase 3: Import (Production)
```
┌─────────────────────────────────────────────┐
│ 4. BACKUP PRODUCTION (If exists)            │
├─────────────────────────────────────────────┤
│ Command: npm run backup:db "pre-import"     │
│                                             │
│ Creates safety backup of current prod data  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 5. IMPORT TO PRODUCTION                     │
├─────────────────────────────────────────────┤
│ Command: npm run import:data file.json      │
│                                             │
│ Process:                                    │
│ ├─ 1. Connect to production database        │
│ ├─ 2. DELETE all existing collections       │
│ ├─ 3. Import all data from export file      │
│ └─ 4. Verify data integrity                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 6. VERIFY & RESTART                         │
├─────────────────────────────────────────────┤
│ ✓ Check database collections                │
│ ✓ Verify uploads directory                  │
│ ✓ Restart application server                │
│ ✓ Test application endpoints                │
│ ✓ Check admin panel                         │
└─────────────────────────────────────────────┘
```

---

## Decision Tree

```
START: Need to migrate database?
          │
          ▼
    ┌─────────┐
    │ Purpose?│
    └────┬────┘
         │
    ┌────┴──────────────────────────┐
    │                               │
    ▼                               ▼
First time?                    Regular sync?
    │                               │
    ▼                               ▼
Full migration                 Incremental update
    │                               │
    │                         Consider using
    │                         separate tools
    │                         (e.g., replication)
    │
    ▼
┌─────────────────────────────────────────┐
│        FULL MIGRATION FLOW              │
├─────────────────────────────────────────┤
│ 1. Export local data                    │
│ 2. Transfer files (data + uploads)      │
│ 3. Backup production (if exists)        │
│ 4. Import to production                 │
│ 5. Verify everything works              │
└─────────────────────────────────────────┘
```

---

## Environment Flow

```
┌──────────────┐    Export    ┌──────────────┐    Export    ┌──────────────┐
│              │  ─────────>   │              │  ─────────>   │              │
│ Development  │               │   Staging    │               │  Production  │
│  (Local)     │  <─────────   │   (Test)     │  <─────────   │   (Live)     │
│              │    Import     │              │    Import     │              │
└──────────────┘               └──────────────┘               └──────────────┘
      │                              │                              │
      │                              │                              │
      ▼                              ▼                              ▼
  MongoDB Local                MongoDB Staging              MongoDB Production
  Dev Database                 Test Database                Live Database
```

---

## Backup Strategy Flow

```
BEFORE ANY MIGRATION:

┌─────────────────────────────────────────────┐
│          BACKUP DECISION TREE               │
└─────────────────────────────────────────────┘
                    │
                    ▼
            Is this production?
                 /    \
               YES     NO
                │       │
                │       └─> Optional backup
                │           (but recommended)
                │
                ▼
        ┌──────────────────┐
        │ MANDATORY BACKUP │
        └──────────────────┘
                │
                ▼
    npm run backup:db "pre-migration"
                │
                ▼
        ┌──────────────────┐
        │ Backup created   │
        │ in backups/      │
        └──────────────────┘
                │
                ▼
        Safe to proceed with import
```

---

## Rollback Flow

```
PROBLEM DETECTED AFTER IMPORT:

┌─────────────────────────────────────────────┐
│         ROLLBACK PROCEDURE                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
          Have recent backup?
                 /    \
               YES     NO
                │       │
                │       └─> Manual recovery
                │           (contact support)
                │
                ▼
    Find latest backup in backups/
                │
                ▼
    npm run import:data backups/backup-xxx.json
                │
                ▼
    Verify data restored correctly
                │
                ▼
         Restart application
                │
                ▼
            ┌────────┐
            │ FIXED! │
            └────────┘
```

---

## File Relationship Diagram

```
PROJECT ROOT
│
├── server/
│   ├── exports/                    ← Export location
│   │   ├── database-export-*.json  ← One-time exports
│   │   ├── backups/                ← Managed backups
│   │   │   └── backup-*.json       ← Auto-cleanup (keeps 10)
│   │   └── README.md
│   │
│   ├── uploads/                    ← Media files
│   │   ├── file-123.png           ← Must copy separately
│   │   ├── logo-456.jpg
│   │   └── document-789.pdf
│   │
│   └── scripts/
│       ├── exportData.ts           ← Creates export file
│       ├── importData.ts           ← Imports from file
│       ├── backupDatabase.ts       ← Smart backup with cleanup
│       └── copyUploads.ts          ← Copies media files

┌─────────────────────────────────────────────┐
│ Export File Contents (JSON)                 │
├─────────────────────────────────────────────┤
│ {                                           │
│   "siteSettings": [...],      ← App config │
│   "users": [...],             ← User accounts│
│   "pages": [...],             ← CMS pages  │
│   "posts": [...],             ← Blog posts │
│   "media": [...],             ← File metadata│
│   "formConfigurations": [...],← Form setup │
│   "formEntries": [...],       ← Submissions│
│   "exportedAt": "...",        ← Timestamp  │
│   "version": "1.0.0"          ← Version    │
│ }                                           │
└─────────────────────────────────────────────┘
```

---

## Timeline Example

```
DAY 1: PREPARATION
├─ 09:00 - Create development backup
├─ 10:00 - Export local database
├─ 10:15 - Review export file
└─ 11:00 - Transfer files to staging

DAY 2: STAGING TEST
├─ 09:00 - Import to staging
├─ 09:30 - Test application on staging
├─ 14:00 - Fix any issues found
└─ 16:00 - Approve for production

DAY 3: PRODUCTION (Low-traffic window)
├─ 22:00 - Create production backup
├─ 22:10 - Transfer files to production
├─ 22:20 - Import to production
├─ 22:40 - Verify application
├─ 23:00 - Monitor for issues
└─ 23:30 - Migration complete ✓
```

---

## Data Integrity Checks

```
AFTER IMPORT - VERIFICATION CHECKLIST:

┌─ Database Level ────────────────────────┐
│ ✓ Count documents in each collection   │
│ ✓ Verify indexes exist                 │
│ ✓ Check foreign key relationships      │
└─────────────────────────────────────────┘

┌─ Application Level ─────────────────────┐
│ ✓ Can login to admin panel             │
│ ✓ Pages load correctly                 │
│ ✓ Images display properly              │
│ ✓ Forms can be submitted               │
│ ✓ API endpoints respond                │
└─────────────────────────────────────────┘

┌─ File System Level ─────────────────────┐
│ ✓ Uploads directory exists             │
│ ✓ File permissions correct (755)       │
│ ✓ Media files accessible               │
│ ✓ Correct file counts match database   │
└─────────────────────────────────────────┘
```

---

## Summary Command Flow

```bash
# On Local Development Machine
cd server

# Step 1: Export
npm run export:data
# Output: exports/database-export-2024-01-15T10-30-00.json

# Step 2: Transfer to Production
scp exports/database-export-*.json user@prod:/path/to/server/exports/
rsync -avz uploads/ user@prod:/path/to/server/uploads/

# Step 3: SSH to Production
ssh user@prod
cd /path/to/server

# Step 4: Backup Production (if exists)
npm run backup:db "pre-migration"

# Step 5: Import Data
npm run import:data database-export-2024-01-15T10-30-00.json

# Step 6: Restart & Verify
npm start
curl http://localhost:3000/ping
```

---

## Quick Reference

| Task | Command | Location |
|------|---------|----------|
| Export data | `npm run export:data` | Local |
| Create backup | `npm run backup:db "desc"` | Any |
| Import data | `npm run import:data file.json` | Production |
| Copy uploads | `npm run copy:uploads /dest` | Any |
| Verify DB | `mongosh` + `db.stats()` | Production |

---

For complete instructions, see:
- **[MIGRATION_QUICK_START.md](./MIGRATION_QUICK_START.md)** - Quick reference
- **[DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)** - Detailed guide
- **[DATABASE_MIGRATION_README.md](./DATABASE_MIGRATION_README.md)** - Overview
