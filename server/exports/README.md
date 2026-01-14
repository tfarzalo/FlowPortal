# Database Exports Directory

This directory contains exported database snapshots in JSON format.

## What's Stored Here

When you run `npm run export:data`, a timestamped JSON file is created containing:
- Site settings
- Users (with hashed passwords)
- Pages
- Posts
- Media metadata
- Form configurations
- Form entries

## File Naming Convention

Files are automatically named with timestamps:
```
database-export-YYYY-MM-DDTHH-MM-SS.json
```

Example: `database-export-2024-01-15T10-30-00.json`

## Usage

**To export:**
```bash
npm run export:data
```

**To import (on target server):**
```bash
npm run import:data database-export-2024-01-15T10-30-00.json
```

## Important Notes

1. **Security:** These files contain sensitive data including user information. Do not commit to version control or share publicly.

2. **Backup:** Keep these files as backups of your database state at different points in time.

3. **Size:** File size depends on your database content. Typical range: 10KB - 10MB.

4. **Uploads Not Included:** Media files from `/uploads` directory are NOT included in these exports. They must be copied separately using `npm run copy:uploads`.

## File Structure

Each export file contains:
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
  "version": "1.0.0"
}
```

## Best Practices

- Keep at least 3 recent exports as rolling backups
- Name exports descriptively if doing manual exports (e.g., `database-export-pre-migration.json`)
- Delete very old exports to save space (keep at least the most recent 5)
- Before major changes, create a labeled backup

## Git Ignore

This directory is included in `.gitignore` to prevent accidentally committing database exports to version control.
