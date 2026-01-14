import archiver from 'archiver';
import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExportService {
  /**
   * Creates a zip archive of the application source code
   * Excludes node_modules, .git, dist, and other build artifacts
   */
  async createApplicationZip(res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[ExportService] Starting application export...');

        // Get the root directory of the project
        const rootDir = path.resolve(__dirname, '../../');
        console.log('[ExportService] Root directory:', rootDir);

        // Create archive
        const archive = archiver('zip', {
          zlib: { level: 9 } // Maximum compression
        });

        // Set response headers
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `FlowPortal-export-${timestamp}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe archive data to response
        archive.pipe(res);

        // Error handler
        archive.on('error', (err) => {
          console.error('[ExportService] Archive error:', err);
          reject(err);
        });

        // Success handler
        archive.on('end', () => {
          console.log('[ExportService] Archive creation completed');
          resolve();
        });

        // Progress logging
        archive.on('progress', (progress) => {
          console.log(`[ExportService] Progress: ${progress.entries.processed} files processed`);
        });

        // Define patterns to exclude
        const excludePatterns = [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.next/**',
          '**/coverage/**',
          '**/.env',
          '**/.env.*',
          '**/uploads/**',
          '**/*.log',
          '**/.DS_Store',
          '**/Thumbs.db',
          '**/.vscode/**',
          '**/.idea/**',
          '**/package-lock.json',
          '**/yarn.lock',
          '**/pnpm-lock.yaml'
        ];

        console.log('[ExportService] Adding files to archive, excluding:', excludePatterns);

        // Add all files from root directory with exclusions
        archive.glob('**/*', {
          cwd: rootDir,
          ignore: excludePatterns,
          dot: true // Include hidden files like .gitignore
        });

        // Finalize the archive
        archive.finalize();

      } catch (error) {
        console.error('[ExportService] Error creating zip:', error);
        reject(error);
      }
    });
  }

  /**
   * Gets the estimated size of the export (excluding patterns)
   */
  async getExportSize(): Promise<{ fileCount: number; totalSize: number }> {
    try {
      const rootDir = path.resolve(__dirname, '../../');

      let fileCount = 0;
      let totalSize = 0;

      const excludePatterns = [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        'coverage',
        'uploads',
        '.env'
      ];

      const countFiles = (dir: string) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
          // Skip excluded patterns
          if (excludePatterns.some(pattern => file.includes(pattern))) {
            return;
          }

          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
            countFiles(filePath);
          } else {
            fileCount++;
            totalSize += stats.size;
          }
        });
      };

      countFiles(rootDir);

      return { fileCount, totalSize };
    } catch (error) {
      console.error('[ExportService] Error calculating export size:', error);
      return { fileCount: 0, totalSize: 0 };
    }
  }
}

export default new ExportService();
