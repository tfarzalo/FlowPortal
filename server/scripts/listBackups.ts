import fs from 'fs';
import path from 'path';

interface BackupInfo {
  filename: string;
  filepath: string;
  size: number;
  created: Date;
  type: 'export' | 'backup';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

function listBackups() {
  try {
    console.log('📋 Listing all database exports and backups\n');

    const exportsDir = path.join(process.cwd(), 'exports');
    const backupsDir = path.join(exportsDir, 'backups');

    const backups: BackupInfo[] = [];

    // Check if exports directory exists
    if (!fs.existsSync(exportsDir)) {
      console.log('⚠️  No exports directory found. Run "npm run export:data" to create your first export.');
      return;
    }

    // Get export files
    const exportFiles = fs.readdirSync(exportsDir)
      .filter(file => file.startsWith('database-export-') && file.endsWith('.json'));

    exportFiles.forEach(filename => {
      const filepath = path.join(exportsDir, filename);
      const stats = fs.statSync(filepath);
      backups.push({
        filename,
        filepath,
        size: stats.size,
        created: stats.mtime,
        type: 'export'
      });
    });

    // Get backup files
    if (fs.existsSync(backupsDir)) {
      const backupFiles = fs.readdirSync(backupsDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'));

      backupFiles.forEach(filename => {
        const filepath = path.join(backupsDir, filename);
        const stats = fs.statSync(filepath);
        backups.push({
          filename,
          filepath,
          size: stats.size,
          created: stats.mtime,
          type: 'backup'
        });
      });
    }

    if (backups.length === 0) {
      console.log('📭 No exports or backups found.');
      console.log('\nCreate one with:');
      console.log('  npm run export:data        # Create timestamped export');
      console.log('  npm run backup:db "note"   # Create labeled backup');
      return;
    }

    // Sort by date (newest first)
    backups.sort((a, b) => b.created.getTime() - a.created.getTime());

    // Display exports
    const exports = backups.filter(b => b.type === 'export');
    if (exports.length > 0) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('📤 EXPORTS (One-time exports)');
      console.log('═══════════════════════════════════════════════════════════════\n');

      exports.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.filename}`);
        console.log(`   Created: ${formatDate(backup.created)}`);
        console.log(`   Size:    ${formatBytes(backup.size)}`);
        console.log(`   Path:    ${path.relative(process.cwd(), backup.filepath)}`);
        console.log('');
      });
    }

    // Display backups
    const labeledBackups = backups.filter(b => b.type === 'backup');
    if (labeledBackups.length > 0) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('💾 BACKUPS (Labeled backups with auto-cleanup)');
      console.log('═══════════════════════════════════════════════════════════════\n');

      labeledBackups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.filename}`);
        console.log(`   Created: ${formatDate(backup.created)}`);
        console.log(`   Size:    ${formatBytes(backup.size)}`);
        console.log(`   Path:    ${path.relative(process.cwd(), backup.filepath)}`);
        console.log('');
      });
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Total Exports: ${exports.length}`);
    console.log(`Total Backups: ${labeledBackups.length}`);
    console.log(`Total Files:   ${backups.length}`);

    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    console.log(`Total Size:    ${formatBytes(totalSize)}`);

    const latest = backups[0];
    console.log(`\nLatest: ${latest.filename}`);
    console.log(`        ${formatDate(latest.created)}`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('💡 USAGE TIPS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('To import a file:');
    console.log(`  npm run import:data ${latest.filename}`);
    console.log('\nTo create a new export:');
    console.log('  npm run export:data');
    console.log('\nTo create a labeled backup:');
    console.log('  npm run backup:db "description"');
    console.log('');

  } catch (error) {
    console.error('❌ Error listing backups:', error);
    process.exit(1);
  }
}

listBackups();
