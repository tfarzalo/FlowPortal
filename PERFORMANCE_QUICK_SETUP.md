# Quick Setup: Performance Optimization

## Apply Database Indexes

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/performance_optimization.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. Verify success message: "Success. No rows returned"

### Option 2: Supabase CLI

```bash
# Make sure you're in the project directory
cd /path/to/FlowPortal-export-2026-01-13

# Link to your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Run the migration
npx supabase db execute --file supabase/performance_optimization.sql
```

### Option 3: psql (Advanced)

```bash
# Connect to your database
psql postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Run the SQL file
\i supabase/performance_optimization.sql

# Exit
\q
```

## Verify Indexes Were Created

Run this query in the SQL Editor to see all indexes:

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

You should see indexes for:
- `idx_pages_slug`
- `idx_pages_published_slug`
- `idx_pages_created_at`
- `idx_pages_updated_at`
- And many more...

## Test the Performance

1. **Clear your browser cache and sessionStorage**:
   ```javascript
   // In browser console
   sessionStorage.clear();
   localStorage.clear();
   ```

2. **Hard refresh** the page (`Ctrl/Cmd + Shift + R`)

3. **Navigate to a custom page** (e.g., `/page/about`)

4. **Check the console** for performance logs:
   ```
   [PageView] Page loaded in 87.45ms: About Us
   [Supabase] Query completed in 45.67ms
   ```

5. **Navigate away and back**:
   ```
   [PageView] Loaded from memory cache in 0.52ms
   ```

## Expected Performance

### Before Optimization
- First visit: 800ms - 2000ms ⏳
- Cached visit: 300ms - 800ms ⏳
- Frequent timeouts

### After Optimization
- First visit: 50ms - 200ms ⚡
- Cached visit: <2ms ⚡⚡⚡
- Rare timeouts

## Troubleshooting

### "Permission denied" error
- Make sure you're logged in to Supabase CLI
- Run: `npx supabase login`

### "Relation does not exist" error
- Make sure all tables exist (pages, posts, form_entries, etc.)
- Run the schema fixes first if needed

### "Column does not exist" error
- The SQL file only creates indexes for columns that exist
- If you see this error, the SQL may need updating for your specific schema
- Check which columns exist in your tables and adjust accordingly

### Indexes already exist
- This is fine! The script uses `IF NOT EXISTS`
- Indexes will only be created if they don't exist

### No performance improvement
1. Check that indexes were created (see verification query above)
2. Clear all caches (sessionStorage, localStorage, browser cache)
3. Check Supabase dashboard → Database → Query Performance
4. Look for slow queries and missing indexes

## Rollback (if needed)

If you need to remove the indexes:

```sql
-- Drop all custom indexes
DROP INDEX IF EXISTS idx_pages_slug;
DROP INDEX IF EXISTS idx_pages_published_slug;
DROP INDEX IF EXISTS idx_pages_created_at;
DROP INDEX IF EXISTS idx_pages_updated_at;
-- ... etc for all indexes
```

## Next Steps

After applying the indexes:

1. ✅ Verify indexes created
2. ✅ Test page loading performance
3. ✅ Check console logs for timing
4. ✅ Test on mobile/slow connections
5. ✅ Monitor Supabase dashboard for query performance

## Additional Resources

- Full documentation: `PAGE_LOADING_OPTIMIZATION.md`
- SQL file: `supabase/performance_optimization.sql`
- Complete fixes: `COMPLETE_FIXES_SUMMARY.md`
