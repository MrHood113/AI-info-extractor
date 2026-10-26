import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Load environment variables before anything else
dotenv.config();

import {
  ensureTempDir,
  cleanupFile,
  startCleanupCron,
  registerShutdownCleaners,
  TEMP_UPLOAD_DIR,
} from './src/utils/tempCleaner.js';
import {
  initDatabase,
  saveExtraction,
  getExtractions,
  getExtractionById,
  deleteExtraction,
  getPresets,
  isDatabaseConnected,
} from './src/services/dbService.js';
import { parsePdf } from './src/services/parsers/pdfParser.js';
import { parseDocx, parseExcelToMarkdown } from './src/services/parsers/officeParser.js';
import { extractYouTubeTranscript } from './src/services/parsers/youtubeParser.js';
import { cleanWebContent } from './src/services/parsers/webScraper.js';
import { streamExtraction } from './src/services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize temp directory & cleanup workers
ensureTempDir();
startCleanupCron();
registerShutdownCleaners();

// Initialize Database connection
initDatabase();

export const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Security Headers with Helmet
// In development, loosen CSP to allow Vite HMR and inline scripts
app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? undefined
      : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter: 30 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded. Maximum 30 requests per 15 minutes per IP.',
  },
});

app.use('/api/', apiLimiter);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureTempDir();
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB max
  },
});

import {
  generateToken,
  verifyToken,
  findUserByEmail,
  findUserById,
  createUser,
  createPasswordResetToken,
  resetPasswordWithToken,
  comparePassword,
} from './src/services/authService.js';

// JWT Authentication Middleware
function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Token is expired or invalid' });
  }
  (req as any).user = decoded;
  next();
}

/* ==========================================================================
   AUTHENTICATION ROUTES (JWT & GOOGLE)
   ========================================================================== */

// Register new user
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const user = await createUser({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Lỗi đăng ký tài khoản.' });
  }
});

// Login with email and password
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi máy chủ khi đăng nhập.' });
  }
});

// Google Sign-In endpoint
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    const targetEmail = (email || 'google_user@gmail.com').toLowerCase().trim();
    const targetName = name || 'Google User';

    let user = await findUserByEmail(targetEmail);
    if (!user) {
      user = await createUser({
        email: targetEmail,
        name: targetName,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}`,
        googleId: googleId || `g_${Date.now()}`,
      });
    }

    const token = generateToken(user);
    res.json({
      message: 'Đăng nhập với Google thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi đăng nhập với Google.' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Vui lòng nhập địa chỉ email.' });
    }

    const { token } = await createPasswordResetToken(email);
    // In production, send via Nodemailer/SendGrid. For testing/demo, return token & simulated link
    res.json({
      message: 'Yêu cầu khôi phục mật khẩu đã được xử lý thành công.',
      resetToken: token,
      resetLink: `/reset-password?token=${token}`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Lỗi khi yêu cầu đặt lại mật khẩu.' });
  }
});

// Reset Password with token
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mã token và mật khẩu mới.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await resetPasswordWithToken(token, newPassword);
    const newToken = generateToken(user);
    res.json({
      message: 'Đổi mật khẩu thành công. Bạn có thể sử dụng mật khẩu mới ngay bây giờ.',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Mã khôi phục không hợp lệ.' });
  }
});

// Current User Profile
app.get('/api/auth/me', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại.' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   API ROUTES
   ========================================================================== */

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    databaseConnected: isDatabaseConnected(),
    tempDir: TEMP_UPLOAD_DIR,
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  });
});

// Presets list
app.get('/api/presets', async (_req: Request, res: Response) => {
  try {
    const presets = await getPresets();
    res.json(presets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// History list
app.get('/api/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const history = await getExtractions(limit);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// History detail
app.get('/api/history/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const record = await getExtractionById(id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// History delete
app.delete('/api/history/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await deleteExtraction(id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SSE Streaming Extraction Endpoint
app.post('/api/extract/stream', upload.single('file'), async (req: Request, res: Response) => {
  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const uploadedFile = req.file;
  const filePath = uploadedFile ? uploadedFile.path : null;

  let isAborted = false;
  req.on('close', () => {
    isAborted = true;
  });

  const {
    sourceType,
    prompt = 'Hãy phân tích và tóm tắt toàn bộ nội dung chính.',
    presetId = 'custom',
    outputFormat = 'markdown',
    url,
    youtubeUrl,
  } = req.body;

  let sourceName = uploadedFile ? uploadedFile.originalname : url || youtubeUrl || 'Direct Input';
  let contextText = '';
  let fileForGemini: string | undefined = undefined;
  let fileMimeType: string | undefined = undefined;

  try {
    sendEvent({ type: 'status', message: `Initializing pipeline for ${sourceType.toUpperCase()}...` });

    switch (sourceType) {
      case 'pdf': {
        if (!filePath) throw new Error('No PDF file uploaded.');
        sendEvent({ type: 'status', message: 'Analyzing PDF structure...' });
        const pdfResult = await parsePdf(filePath);
        if (pdfResult.useFileApi) {
          sendEvent({ type: 'status', message: 'Routing large/scanned PDF to Gemini File API...' });
          fileForGemini = filePath;
          fileMimeType = 'application/pdf';
        } else {
          contextText = pdfResult.text;
          sendEvent({
            type: 'status',
            message: `Extracted ${pdfResult.numPages} pages (${contextText.length} characters) directly.`,
          });
        }
        break;
      }

      case 'docx': {
        if (!filePath) throw new Error('No Word document (.docx) uploaded.');
        sendEvent({ type: 'status', message: 'Parsing Microsoft Word document hierarchies...' });
        contextText = await parseDocx(filePath);
        sendEvent({ type: 'status', message: `Parsed Word text (${contextText.length} characters).` });
        break;
      }

      case 'excel': {
        if (!filePath) throw new Error('No Excel/CSV spreadsheet uploaded.');
        sendEvent({ type: 'status', message: 'Extracting sheets into Markdown tables...' });
        contextText = await parseExcelToMarkdown(filePath);
        sendEvent({ type: 'status', message: 'Extracted tabular sheets into Markdown format.' });
        break;
      }

      case 'video': {
        if (!filePath) throw new Error('No video file uploaded.');
        sendEvent({ type: 'status', message: 'Preparing video file for Gemini Multimodal File API...' });
        fileForGemini = filePath;
        fileMimeType = uploadedFile?.mimetype || 'video/mp4';
        break;
      }

      case 'audio': {
        if (!filePath) throw new Error('No audio file uploaded.');
        sendEvent({ type: 'status', message: 'Preparing audio file for Gemini Speech & Sound processing...' });
        fileForGemini = filePath;
        fileMimeType = uploadedFile?.mimetype || 'audio/mp3';
        break;
      }

      case 'youtube': {
        const targetLink = youtubeUrl || url;
        if (!targetLink) throw new Error('Please provide a valid YouTube video URL.');
        sendEvent({ type: 'status', message: 'Extracting YouTube transcripts...' });
        const ytResult = await extractYouTubeTranscript(targetLink);
        sourceName = `YouTube Video [${ytResult.videoId}]`;
        contextText = `Video ID: ${ytResult.videoId}\nDuration: ~${ytResult.durationApproxSeconds}s\n\nTranscript:\n${ytResult.transcript}`;
        sendEvent({
          type: 'status',
          message: `Retrieved ${ytResult.itemCount} transcript segments (~${ytResult.durationApproxSeconds}s).`,
        });
        break;
      }

      case 'web': {
        if (!url) throw new Error('Please provide a valid web article URL.');
        sendEvent({ type: 'status', message: `Scraping & cleaning article via Mozilla Readability: ${url}...` });
        const webResult = await cleanWebContent(url);
        sourceName = webResult.title;
        contextText = `Article Title: ${webResult.title}\nSource: ${webResult.siteName || url}\n${
          webResult.byline ? `Byline: ${webResult.byline}\n` : ''
        }\nContent:\n${webResult.textContent}`;
        sendEvent({
          type: 'status',
          message: `Isolated article content (${webResult.length} characters). Stripped clutter.`,
        });
        break;
      }

      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }

    if (isAborted) {
      return;
    }

    sendEvent({ type: 'status', message: 'Streaming extraction with Gemini 3.8 Flash...' });

    const streamResult = await streamExtraction({
      prompt,
      contextText,
      filePath: fileForGemini,
      mimeType: fileMimeType,
      outputFormat: outputFormat as any,
      onFirstToken: (ttftMs) => {
        sendEvent({ type: 'ttft', ttftMs });
      },
      onChunk: (chunkText) => {
        if (!isAborted) {
          sendEvent({ type: 'chunk', text: chunkText });
        }
      },
    });

    // Save record to database
    let savedRecord;
    try {
      savedRecord = await saveExtraction({
        sourceType,
        sourceName,
        presetId,
        prompt,
        outputText: streamResult.fullText,
        outputFormat,
        latencyMs: streamResult.latencyMs,
        tokensUsed: streamResult.tokensEstimated,
      });
    } catch (saveErr) {
      console.warn('[Server] Could not persist extraction to DB:', saveErr);
    }

    // Done signal
    sendEvent({
      type: 'done',
      id: savedRecord?.id,
      latencyMs: streamResult.latencyMs,
      ttftMs: streamResult.ttftMs,
      tokensEstimated: streamResult.tokensEstimated,
    });
  } catch (error: any) {
    console.error('[Server] Extraction pipeline error:', error);
    sendEvent({
      type: 'error',
      error: error.message || 'An unexpected error occurred during extraction.',
    });
  } finally {
    // Zero-Disk-Leak: Clean up local uploaded file
    await cleanupFile(filePath);
    res.end();
  }
});

/* ==========================================================================
   STATIC & VITE DEV SERVER INTEGRATION
   ========================================================================== */

async function startServer() {
  if (!isProd) {
    // Development mode: Mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite dev middleware attached.');
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log(`[Server] Serving production assets from ${distPath}`);
    }
  }

  // Only start listening if run directly (not in vitest supertest import)
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 AI Information Extractor running at: http://localhost:${PORT}`);
      console.log(`🧠 Powered by Gemini 3.8 Flash (2M Context Window)`);
      console.log(`📂 Upload Temp Dir: ${TEMP_UPLOAD_DIR}`);
      console.log(`======================================================\n`);
    });
  }
}

startServer().catch((err) => {
  console.error('[Server] Failed to initialize server:', err);
  process.exit(1);
});
