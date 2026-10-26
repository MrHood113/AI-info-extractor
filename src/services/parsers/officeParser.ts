import fs from 'node:fs';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';

/**
 * Extracts structured text and headers from Microsoft Word (.docx) files
 */
export async function parseDocx(filePath: string): Promise<string> {
  const fileBuffer = await fs.promises.readFile(filePath);

  // Convert to clean markdown-like text preserving headings and structural hierarchy
  const options = {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Title'] => h1:fresh",
      "p[style-name='Subtitle'] => h2:fresh",
    ],
  };

  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  const rawText = result.value.trim();

  if (result.messages && result.messages.length > 0) {
    console.log('[OfficeParser] Mammoth notices:', result.messages.map((m) => m.message).join('; '));
  }

  if (!rawText) {
    throw new Error('Document is empty or contains no readable text content.');
  }

  return rawText;
}

/**
 * Extracts and formats all worksheets from Excel (.xlsx) or CSV files into clean Markdown tables
 */
export async function parseExcelToMarkdown(filePath: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();

  const isCsv = filePath.toLowerCase().endsWith('.csv');
  if (isCsv) {
    await workbook.csv.readFile(filePath);
  } else {
    await workbook.xlsx.readFile(filePath);
  }

  const markdownSheets: string[] = [];

  workbook.eachSheet((worksheet, sheetId) => {
    const sheetName = worksheet.name || `Sheet ${sheetId}`;
    const rowCount = worksheet.rowCount;

    if (rowCount === 0) {
      markdownSheets.push(`### Sheet: ${sheetName}\n*(Sheet is empty)*\n`);
      return;
    }

    const rows: string[][] = [];
    let maxCols = 0;

    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values: string[] = [];
      const rowValues = Array.isArray(row.values) ? row.values.slice(1) : []; // ExcelJS row.values is 1-indexed

      for (const val of rowValues) {
        if (val === null || val === undefined) {
          values.push('');
        } else if (typeof val === 'object') {
          // Handle formulas, rich text, or dates
          if ('result' in (val as any)) {
            values.push(String((val as any).result ?? ''));
          } else if ('text' in (val as any)) {
            values.push(String((val as any).text ?? ''));
          } else if (val instanceof Date) {
            values.push(val.toISOString().split('T')[0]);
          } else {
            values.push(JSON.stringify(val));
          }
        } else {
          // Clean pipes and newlines for markdown table compatibility
          values.push(String(val).replace(/\|/g, '\\|').replace(/\r?\n/g, ' '));
        }
      }

      if (values.length > maxCols) {
        maxCols = values.length;
      }
      rows.push(values);
    });

    if (rows.length === 0 || maxCols === 0) {
      markdownSheets.push(`### Sheet: ${sheetName}\n*(No data rows found)*\n`);
      return;
    }

    // Pad each row to maxCols
    const normalizedRows = rows.map((r) => {
      while (r.length < maxCols) {
        r.push('');
      }
      return r;
    });

    // Treat row 0 as header
    const headers = normalizedRows[0].map((h, i) => (h.trim() ? h.trim() : `Col ${i + 1}`));
    const separator = headers.map(() => '---');

    const tableLines: string[] = [
      `### Sheet: ${sheetName}`,
      `| ${headers.join(' | ')} |`,
      `| ${separator.join(' | ')} |`,
    ];

    // Data rows
    for (let i = 1; i < normalizedRows.length; i++) {
      tableLines.push(`| ${normalizedRows[i].join(' | ')} |`);
    }

    markdownSheets.push(tableLines.join('\n'));
  });

  if (markdownSheets.length === 0) {
    throw new Error('No readable spreadsheets found in workbook.');
  }

  return markdownSheets.join('\n\n---\n\n');
}
