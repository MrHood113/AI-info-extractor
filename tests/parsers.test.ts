import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import ExcelJS from 'exceljs';
import { parseExcelToMarkdown } from '../src/services/parsers/officeParser.js';
import { extractYouTubeVideoId, extractYouTubeTranscript } from '../src/services/parsers/youtubeParser.js';
import { cleanWebContent, isValidHttpUrl } from '../src/services/parsers/webScraper.js';
import { parsePdf } from '../src/services/parsers/pdfParser.js';

describe('Office & Spreadsheets Parser Unit Tests', () => {
  const testExcelPath = path.resolve(__dirname, 'test_sample.xlsx');

  beforeAll(async () => {
    // Generate a valid Excel file with ExcelJS
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Q1 Revenue');
    sheet.columns = [
      { header: 'Quarter', key: 'quarter', width: 10 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Growth', key: 'growth', width: 10 },
    ];
    sheet.addRow({ quarter: 'Q1', revenue: 1500000, growth: '12%' });
    sheet.addRow({ quarter: 'Q2', revenue: 1850000, growth: '23%' });
    await workbook.xlsx.writeFile(testExcelPath);
  });

  afterAll(async () => {
    if (fs.existsSync(testExcelPath)) {
      await fs.promises.unlink(testExcelPath);
    }
  });

  it('should parse an Excel workbook into clean Markdown table syntax', async () => {
    const mdResult = await parseExcelToMarkdown(testExcelPath);
    expect(mdResult).toContain('### Sheet: Q1 Revenue');
    expect(mdResult).toContain('| Quarter | Revenue | Growth |');
    expect(mdResult).toContain('| --- | --- | --- |');
    expect(mdResult).toContain('| Q1 | 1500000 | 12% |');
    expect(mdResult).toContain('| Q2 | 1850000 | 23% |');
  });

  it('should throw an error when attempting to parse non-existent file', async () => {
    await expect(parseExcelToMarkdown('non_existent_file.xlsx')).rejects.toThrow();
  });
});

describe('YouTube Parser Unit Tests', () => {
  it('should accurately extract video IDs from various YouTube URL formats', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://invalid-url.com/something')).toBeNull();
  });

  it('should throw an error for invalid YouTube URLs', async () => {
    await expect(extractYouTubeTranscript('https://example.com/not-youtube')).rejects.toThrow(
      'Invalid YouTube URL format'
    );
  });
});

describe('Web Scraper Unit Tests', () => {
  it('should validate HTTP and HTTPS URLs', () => {
    expect(isValidHttpUrl('https://google.com')).toBe(true);
    expect(isValidHttpUrl('http://example.org/path?query=1')).toBe(true);
    expect(isValidHttpUrl('ftp://ftp.example.com')).toBe(false);
    expect(isValidHttpUrl('not-a-url')).toBe(false);
  });

  it('should reject invalid web URLs when scraping', async () => {
    await expect(cleanWebContent('ftp://invalid-domain')).rejects.toThrow('Invalid web URL');
  });

  it('should handle 404 or unreachable targets gracefully with error', async () => {
    await expect(
      cleanWebContent('https://httpstat.us/404')
    ).rejects.toThrow();
  });
});

describe('PDF Parser Unit Tests', () => {
  const dummyPdfPath = path.resolve(__dirname, 'small_dummy.pdf');

  beforeAll(async () => {
    // Write minimal dummy binary file
    await fs.promises.writeFile(dummyPdfPath, Buffer.from('%PDF-1.4\n%EOF\n'));
  });

  afterAll(async () => {
    if (fs.existsSync(dummyPdfPath)) {
      await fs.promises.unlink(dummyPdfPath);
    }
  });

  it('should handle small PDF or fallback to File API if unreadable', async () => {
    const result = await parsePdf(dummyPdfPath);
    expect(result).toBeDefined();
    expect(typeof result.useFileApi).toBe('boolean');
  });
});
