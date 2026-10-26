import { Pool } from 'pg';

export interface ExtractionRecord {
  id?: string;
  sourceType: string;
  sourceName: string;
  presetId?: string;
  prompt: string;
  outputText: string;
  outputFormat: string;
  latencyMs: number;
  tokensUsed?: number;
  createdAt?: string;
}

export interface PresetItem {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  format: string;
}

// In-memory fallback in case PostgreSQL is temporarily unavailable
const inMemoryExtractions: ExtractionRecord[] = [];

const DEFAULT_PRESETS: PresetItem[] = [
  {
    id: 'insights',
    name: 'Key Insights & Core Meaning',
    description: 'Tóm tắt 3-5 Key Insights và ý nghĩa cốt lõi từ tài liệu hoặc dữ liệu đầu vào.',
    promptTemplate:
      'Trích xuất và tóm tắt 3-5 Key Insights cốt lõi nhất từ nội dung được cung cấp. Đối với mỗi insight, giải thích rõ: (1) Bản chất insight, (2) Bằng chứng/Dữ liệu minh chứng từ nguồn, (3) Ý nghĩa chiến lược hoặc bài học rút ra.',
    format: 'markdown',
  },
  {
    id: 'actions',
    name: 'Action Items & Priority',
    description: 'Rút ra Action Items, người phụ trách và mức độ ưu tiên theo ma trận hành động.',
    promptTemplate:
      'Hãy phân tích tài liệu và lập danh sách tất cả các Action Items (nhiệm vụ cần thực hiện) một cách chi tiết. Với mỗi Action Item, trình bày dạng bảng gồm các cột: Số thứ tự (No), Nhiệm vụ cụ thể (Action Item), Người/Bộ phận phụ trách (Assignee), Mức độ ưu tiên (High/Medium/Low), Deadline/Mốc thời gian dự kiến (nếu có), và Tiêu chí hoàn thành (Done Definition).',
    format: 'table',
  },
  {
    id: 'json_entities',
    name: 'Structured Entities & Parameters (JSON)',
    description: 'Trích xuất thực thể & thông số có cấu trúc dạng JSON chuẩn Schema.',
    promptTemplate:
      'Trích xuất toàn bộ các thực thể, thông số kỹ thuật, số liệu định lượng, ngày tháng, tên riêng và các thuộc tính quan trọng từ tài liệu dưới định dạng JSON hợp lệ tuân thủ schema chuẩn: { "title": string, "summary": string, "entities": [{"name": string, "type": string, "value": string, "confidence": number}], "metrics": [{"metric": string, "value": string, "unit": string}], "key_takeaways": [string] }.',
    format: 'json',
  },
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'Tóm tắt điều hành (Executive Summary) cô đọng cho ban lãnh đạo.',
    promptTemplate:
      'Soạn thảo một bản Tóm tắt Điều hành (Executive Summary) chuyên nghiệp dành cho Ban Lãnh đạo (C-level). Cấu trúc gồm: 1. Tổng quan tình hình (Context), 2. Các điểm nóng và cơ hội chính (Key Highlights), 3. Rủi ro & Thách thức cần lưu tâm (Risks & Bottlenecks), 4. Khuyến nghị hành động chiến lược (Strategic Recommendations). Phong cách chuyên nghiệp, súc tích, định hướng kết quả.',
    format: 'markdown',
  },
  {
    id: 'swot',
    name: 'SWOT Matrix Analysis',
    description: 'Phân tích ma trận SWOT (Strengths, Weaknesses, Opportunities, Threats).',
    promptTemplate:
      'Thực hiện phân tích ma trận SWOT toàn diện dựa trên nội dung được cung cấp. Phân bổ rõ 4 nhóm: Điểm mạnh (Strengths), Điểm yếu (Weaknesses), Cơ hội (Opportunities), và Thách thức (Threats). Với mỗi mục, đưa ra ít nhất 3-4 luận điểm sâu sắc kèm khuyến nghị chiến lược kết hợp (SO, WO, ST, WT).',
    format: 'markdown',
  },
];

let pool: Pool | null = null;
let isConnected = false;

export function initDatabase(): void {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const database = process.env.DB_NAME || 'ai_info_extractor';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';

  try {
    pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 10000,
      max: 10,
    });

    pool.query('SELECT 1')
      .then(() => {
        isConnected = true;
        console.log(`[Database] Successfully connected to PostgreSQL at ${host}:${port}/${database}`);
      })
      .catch((err) => {
        isConnected = false;
        console.warn(`[Database] PostgreSQL unavailable (${err.message}). Using in-memory store for session.`);
      });
  } catch (error) {
    isConnected = false;
    console.warn('[Database] Initializing in-memory fallback mode.');
  }
}

export async function saveExtraction(record: ExtractionRecord): Promise<ExtractionRecord> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const completeRecord: ExtractionRecord = {
    ...record,
    id,
    createdAt,
  };

  if (isConnected && pool) {
    try {
      const query = `
        INSERT INTO extractions (
          id, source_type, source_name, preset_id, prompt, output_text, output_format, latency_ms, tokens_used, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const values = [
        id,
        record.sourceType,
        record.sourceName,
        record.presetId || 'custom',
        record.prompt,
        record.outputText,
        record.outputFormat || 'markdown',
        record.latencyMs || 0,
        record.tokensUsed || 0,
        createdAt,
      ];
      await pool.query(query, values);
      return completeRecord;
    } catch (err) {
      console.error('[Database] Failed to insert extraction record to PG, falling back to memory:', err);
    }
  }

  // Fallback to in-memory store
  inMemoryExtractions.unshift(completeRecord);
  if (inMemoryExtractions.length > 100) {
    inMemoryExtractions.pop();
  }
  return completeRecord;
}

export async function getExtractions(limit: number = 20): Promise<ExtractionRecord[]> {
  if (isConnected && pool) {
    try {
      const res = await pool.query(
        'SELECT id, source_type as "sourceType", source_name as "sourceName", preset_id as "presetId", prompt, output_text as "outputText", output_format as "outputFormat", latency_ms as "latencyMs", tokens_used as "tokensUsed", created_at as "createdAt" FROM extractions ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      return res.rows;
    } catch (err) {
      console.error('[Database] Failed to fetch extractions from PG:', err);
    }
  }
  return inMemoryExtractions.slice(0, limit);
}

export async function getExtractionById(id: string): Promise<ExtractionRecord | null> {
  if (isConnected && pool) {
    try {
      const res = await pool.query(
        'SELECT id, source_type as "sourceType", source_name as "sourceName", preset_id as "presetId", prompt, output_text as "outputText", output_format as "outputFormat", latency_ms as "latencyMs", tokens_used as "tokensUsed", created_at as "createdAt" FROM extractions WHERE id = $1',
        [id]
      );
      return res.rows[0] || null;
    } catch (err) {
      console.error('[Database] Error fetching record by id:', err);
    }
  }
  return inMemoryExtractions.find((r) => r.id === id) || null;
}

export async function deleteExtraction(id: string): Promise<boolean> {
  if (isConnected && pool) {
    try {
      const res = await pool.query('DELETE FROM extractions WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error('[Database] Error deleting record:', err);
    }
  }
  const idx = inMemoryExtractions.findIndex((r) => r.id === id);
  if (idx !== -1) {
    inMemoryExtractions.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getPresets(): Promise<PresetItem[]> {
  if (isConnected && pool) {
    try {
      const res = await pool.query(
        'SELECT id, name, description, prompt_template as "promptTemplate", format FROM presets ORDER BY created_at ASC'
      );
      if (res.rows.length > 0) {
        return res.rows;
      }
    } catch (err) {
      console.error('[Database] Error fetching presets from PG:', err);
    }
  }
  return DEFAULT_PRESETS;
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}
