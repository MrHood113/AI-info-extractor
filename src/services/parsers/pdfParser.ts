import fs from 'node:fs';
import pdfParse from 'pdf-parse';

export interface PdfParseResult {
  text: string;
  numPages: number;
  useFileApi: boolean;
  reason?: string;
}

const MAX_INLINE_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Parses a PDF file:
 * - If file size >= 20MB: flags for Gemini File API ingestion
 * - If file size < 20MB: extracts text directly using pdf-parse
 * - If extracted text is suspiciously sparse (< 100 chars across multiple pages),
 *   flags as potential scanned/image PDF for Gemini File API OCR ingestion.
 */
export async function parsePdf(filePath: string): Promise<PdfParseResult> {
  const stats = await fs.promises.stat(filePath);

  if (stats.size >= MAX_INLINE_PDF_SIZE_BYTES) {
    return {
      text: '',
      numPages: 0,
      useFileApi: true,
      reason: `File size (${(stats.size / 1024 / 1024).toFixed(2)} MB) exceeds 20MB threshold. Using Gemini File API.`,
    };
  }

  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    const cleanText = (data.text || '').trim();

    // Check if this might be a scanned document (little or no text extracted despite multiple pages)
    if (data.numpages > 1 && cleanText.length < 50 * data.numpages) {
      return {
        text: cleanText,
        numPages: data.numpages,
        useFileApi: true,
        reason: 'Low text density detected (likely scanned or rasterized PDF). Routing to Gemini File API for multimodal OCR.',
      };
    }

    return {
      text: cleanText,
      numPages: data.numpages,
      useFileApi: false,
    };
  } catch (err: any) {
    // If pdf-parse fails on complex or corrupt format, fallback to Gemini File API
    console.warn(`[PdfParser] Direct parsing encountered an issue (${err.message}). Routing to Gemini File API.`);
    return {
      text: '',
      numPages: 0,
      useFileApi: true,
      reason: `Direct parsing failed (${err.message}). Using Gemini File API.`,
    };
  }
}
