import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';

export interface StreamGenerationOptions {
  prompt: string;
  systemInstruction?: string;
  contextText?: string;
  filePath?: string;
  mimeType?: string;
  outputFormat?: 'markdown' | 'table' | 'json';
  onChunk: (text: string) => void;
  onFirstToken?: (ttftMs: number) => void;
}

export interface StreamGenerationResult {
  fullText: string;
  latencyMs: number;
  ttftMs: number;
  tokensEstimated: number;
}

let genAiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is missing or invalid in server environment. Please set GEMINI_API_KEY in your .env file.'
    );
  }

  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return genAiClient;
}

/**
 * Uploads a file (video, audio, or large PDF) to Gemini File API and waits for ACTIVE state
 */
export async function uploadToGeminiFileApi(filePath: string, mimeType: string): Promise<any> {
  const ai = getGeminiClient();

  console.log(`[GeminiFileAPI] Uploading file to Gemini File API: ${filePath} (${mimeType})...`);
  const uploadResponse = await ai.files.upload({
    file: filePath,
    config: {
      mimeType: mimeType || 'application/octet-stream',
    },
  });

  console.log(`[GeminiFileAPI] Uploaded. File Name: ${uploadResponse.name}, State: ${uploadResponse.state}`);

  // If the file is still processing (common for video/audio), poll until it becomes ACTIVE
  let fileInfo = uploadResponse;
  let attempts = 0;
  const maxAttempts = 30; // 30 * 2s = 60s max wait

  while (fileInfo.state === 'PROCESSING' && attempts < maxAttempts && uploadResponse.name) {
    attempts++;
    console.log(`[GeminiFileAPI] Processing file... attempt ${attempts}/${maxAttempts}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    fileInfo = await ai.files.get({ name: uploadResponse.name });
  }

  if (fileInfo.state === 'FAILED') {
    throw new Error('Gemini File API processing failed for uploaded media.');
  }

  return fileInfo;
}

/**
 * Generates streaming content using Gemini 3.8 Flash with multi-source ingestion
 */
export async function streamExtraction(options: StreamGenerationOptions): Promise<StreamGenerationResult> {
  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const startTime = Date.now();
  let firstTokenTime: number | null = null;
  let fullAccumulatedText = '';
  let uploadedGeminiFile: any = null;

  try {
    const contents: any[] = [];

    // If a media or large document file is provided, upload it to File API
    if (options.filePath && fs.existsSync(options.filePath)) {
      uploadedGeminiFile = await uploadToGeminiFileApi(
        options.filePath,
        options.mimeType || 'application/octet-stream'
      );
      contents.push(uploadedGeminiFile);
    }

    // Prepare context prompt
    let userPromptWithContext = '';
    if (options.contextText) {
      userPromptWithContext += `--- BEGIN EXTRACTED SOURCE CONTENT ---\n${options.contextText}\n--- END EXTRACTED SOURCE CONTENT ---\n\n`;
    }

    // Directives based on output format
    let formatDirectives = '';
    if (options.outputFormat === 'json') {
      formatDirectives =
        '\n\nBẮT BUỘC: Trả về kết quả hoàn toàn bằng định dạng JSON hợp lệ (Valid RFC 8259 JSON). Tuyệt đối không bọc trong markdown code fence, không thêm bất kỳ văn bản giải thích nào ngoài chuỗi JSON.';
    } else if (options.outputFormat === 'table') {
      formatDirectives =
        '\n\nBẮT BUỘC: Trình bày dữ liệu chính dưới dạng một hoặc nhiều Bảng Markdown (Markdown Table chuẩn) với các cột rõ ràng, tiêu đề trực quan, kèm phần giải thích ngắn gọn bên dưới.';
    }

    userPromptWithContext += `${options.prompt}${formatDirectives}`;
    contents.push(userPromptWithContext);

    // Build configuration
    const config: any = {
      temperature: options.outputFormat === 'json' ? 0.1 : 0.4,
    };

    if (options.outputFormat === 'json') {
      config.responseMimeType = 'application/json';
    }

    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    console.log(`[GeminiService] Initiating streaming with model: ${modelName}`);

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config,
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text || '';
      if (chunkText) {
        if (firstTokenTime === null) {
          firstTokenTime = Date.now();
          const ttft = firstTokenTime - startTime;
          console.log(`[GeminiService] TTFT: ${ttft}ms`);
          if (options.onFirstToken) {
            options.onFirstToken(ttft);
          }
        }
        fullAccumulatedText += chunkText;
        options.onChunk(chunkText);
      }
    }

    const endTime = Date.now();
    const totalLatency = endTime - startTime;
    const ttftMs = firstTokenTime ? firstTokenTime - startTime : totalLatency;

    return {
      fullText: fullAccumulatedText,
      latencyMs: totalLatency,
      ttftMs,
      tokensEstimated: Math.ceil(fullAccumulatedText.length / 4),
    };
  } finally {
    // Clean up Gemini File API resource to avoid quota leak
    if (uploadedGeminiFile && uploadedGeminiFile.name) {
      try {
        await ai.files.delete({ name: uploadedGeminiFile.name });
        console.log(`[GeminiFileAPI] Deleted remote file ${uploadedGeminiFile.name}`);
      } catch (err) {
        console.warn(`[GeminiFileAPI] Warning: could not delete remote file ${uploadedGeminiFile.name}:`, err);
      }
    }
  }
}
