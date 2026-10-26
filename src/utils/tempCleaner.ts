import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Default temp folder path per specification: /tmp/extract_uploads
// On Windows platforms without a root /tmp, gracefully fall back to local or os temp dir
function resolveTempDirPath(): string {
  const envPath = process.env.TEMP_DIR;
  if (envPath) {
    return path.resolve(envPath);
  }

  if (process.platform === 'win32') {
    return path.resolve(process.cwd(), 'tmp', 'extract_uploads');
  }

  return '/tmp/extract_uploads';
}

export const TEMP_UPLOAD_DIR = resolveTempDirPath();

/**
 * Ensure the temporary upload directory exists
 */
export function ensureTempDir(): string {
  if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
    fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
  }
  return TEMP_UPLOAD_DIR;
}

/**
 * Clean up a single temporary file safely in finally blocks
 */
export async function cleanupFile(filePath: string | null | undefined): Promise<void> {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`[TempCleaner] Removed temporary file: ${filePath}`);
    }
  } catch (error) {
    console.error(`[TempCleaner] Failed to delete file ${filePath}:`, error);
  }
}

/**
 * Scan the temporary upload directory and remove files older than maxAgeMs (default 30 mins)
 */
export async function cleanupOldFiles(maxAgeMs: number = 30 * 60 * 1000): Promise<number> {
  let cleanedCount = 0;
  try {
    ensureTempDir();
    const files = await fs.promises.readdir(TEMP_UPLOAD_DIR);
    const now = Date.now();

    for (const file of files) {
      const fullPath = path.join(TEMP_UPLOAD_DIR, file);
      try {
        const stats = await fs.promises.stat(fullPath);
        if (stats.isFile() && now - stats.mtimeMs > maxAgeMs) {
          await fs.promises.unlink(fullPath);
          cleanedCount++;
          console.log(`[TempCleaner] Pruned stale file (>30m): ${file}`);
        }
      } catch (fileErr) {
        // Ignored if file was already removed by another worker
      }
    }
  } catch (error) {
    console.error('[TempCleaner] Error during cleanup cycle:', error);
  }
  return cleanedCount;
}

/**
 * Clean up all files in the temporary directory during shutdown
 */
export async function cleanupAllTempFiles(): Promise<void> {
  try {
    if (fs.existsSync(TEMP_UPLOAD_DIR)) {
      const files = await fs.promises.readdir(TEMP_UPLOAD_DIR);
      for (const file of files) {
        const fullPath = path.join(TEMP_UPLOAD_DIR, file);
        try {
          await fs.promises.unlink(fullPath);
        } catch {}
      }
      console.log(`[TempCleaner] Cleared all temporary files from ${TEMP_UPLOAD_DIR}`);
    }
  } catch (error) {
    console.error('[TempCleaner] Error during shutdown cleanup:', error);
  }
}

let cronIntervalHandle: NodeJS.Timeout | null = null;

/**
 * Start the background TTL cleanup worker (runs every 15 minutes)
 */
export function startCleanupCron(intervalMs: number = 15 * 60 * 1000): NodeJS.Timeout {
  ensureTempDir();
  console.log(`[TempCleaner] Initialized temporary directory: ${TEMP_UPLOAD_DIR}`);
  console.log(`[TempCleaner] Background TTL cleanup worker scheduled every ${intervalMs / 60000} minutes`);

  // Run an initial quick cleanup
  cleanupOldFiles().catch(console.error);

  cronIntervalHandle = setInterval(() => {
    cleanupOldFiles().catch(console.error);
  }, intervalMs);

  // Prevent interval from holding the node process open if unref'd
  if (cronIntervalHandle.unref) {
    cronIntervalHandle.unref();
  }

  return cronIntervalHandle;
}

/**
 * Register SIGINT and SIGTERM handlers to purge temp directory upon shutdown
 */
export function registerShutdownCleaners(): void {
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Purging temporary uploads before exit...`);
    if (cronIntervalHandle) {
      clearInterval(cronIntervalHandle);
    }
    await cleanupAllTempFiles();
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}
