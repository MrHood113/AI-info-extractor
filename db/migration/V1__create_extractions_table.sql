-- V1__create_extractions_table.sql
-- Flyway migration for All-in-One AI Information Extractor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    preset_id VARCHAR(50) NOT NULL DEFAULT 'custom',
    prompt TEXT NOT NULL,
    output_text TEXT NOT NULL,
    output_format VARCHAR(20) NOT NULL DEFAULT 'markdown',
    latency_ms INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_extractions_created_at ON extractions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extractions_source_type ON extractions (source_type);

CREATE TABLE IF NOT EXISTS presets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    format VARCHAR(20) NOT NULL DEFAULT 'markdown',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO presets (id, name, description, prompt_template, format) VALUES
(
    'insights',
    'Key Insights & Core Meaning',
    'Tóm tắt 3-5 Key Insights và ý nghĩa cốt lõi từ tài liệu hoặc dữ liệu đầu vào.',
    'Trích xuất và tóm tắt 3-5 Key Insights cốt lõi nhất từ nội dung được cung cấp. Đối với mỗi insight, giải thích rõ: (1) Bản chất insight, (2) Bằng chứng/Dữ liệu minh chứng từ nguồn, (3) Ý nghĩa chiến lược hoặc bài học rút ra.',
    'markdown'
),
(
    'actions',
    'Action Items & Priority',
    'Rút ra Action Items, người phụ trách và mức độ ưu tiên theo ma trận hành động.',
    'Hãy phân tích tài liệu và lập danh sách tất cả các Action Items (nhiệm vụ cần thực hiện) một cách chi tiết. Với mỗi Action Item, trình bày dạng bảng gồm các cột: Số thứ tự (No), Nhiệm vụ cụ thể (Action Item), Người/Bộ phận phụ trách (Assignee), Mức độ ưu tiên (High/Medium/Low), Deadline/Mốc thời gian dự kiến (nếu có), và Tiêu chí hoàn thành (Done Definition).',
    'table'
),
(
    'json_entities',
    'Structured Entities & Parameters (JSON)',
    'Trích xuất thực thể & thông số có cấu trúc dạng JSON chuẩn Schema.',
    'Trích xuất toàn bộ các thực thể, thông số kỹ thuật, số liệu định lượng, ngày tháng, tên riêng và các thuộc tính quan trọng từ tài liệu dưới định dạng JSON hợp lệ tuân thủ schema chuẩn: { "title": string, "summary": string, "entities": [{"name": string, "type": string, "value": string, "confidence": number}], "metrics": [{"metric": string, "value": string, "unit": string}], "key_takeaways": [string] }.',
    'json'
),
(
    'executive',
    'Executive Summary',
    'Tóm tắt điều hành (Executive Summary) cô đọng cho ban lãnh đạo.',
    'Soạn thảo một bản Tóm tắt Điều hành (Executive Summary) chuyên nghiệp dành cho Ban Lãnh đạo (C-level). Cấu trúc gồm: 1. Tổng quan tình hình (Context), 2. Các điểm nóng và cơ hội chính (Key Highlights), 3. Rủi ro & Thách thức cần lưu tâm (Risks & Bottlenecks), 4. Khuyến nghị hành động chiến lược (Strategic Recommendations). Phong cách chuyên nghiệp, súc tích, định hướng kết quả.',
    'markdown'
),
(
    'swot',
    'SWOT Matrix Analysis',
    'Phân tích ma trận SWOT (Strengths, Weaknesses, Opportunities, Threats).',
    'Thực hiện phân tích ma trận SWOT toàn diện dựa trên nội dung được cung cấp. Phân bổ rõ 4 nhóm: Điểm mạnh (Strengths), Điểm yếu (Weaknesses), Cơ hội (Opportunities), và Thách thức (Threats). Với mỗi mục, đưa ra ít nhất 3-4 luận điểm sâu sắc kèm khuyến nghị chiến lược kết hợp (SO, WO, ST, WT).',
    'markdown'
)
ON CONFLICT (id) DO NOTHING;
