import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';

describe('Server API Integration Tests', () => {
  it('GET /api/health should return 200 with service health telemetry', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.model).toBeDefined();
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });

  it('GET /api/presets should return default presets list', async () => {
    const res = await request(app).get('/api/presets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);

    const presetIds = res.body.map((p: any) => p.id);
    expect(presetIds).toContain('insights');
    expect(presetIds).toContain('actions');
    expect(presetIds).toContain('json_entities');
    expect(presetIds).toContain('executive');
    expect(presetIds).toContain('swot');
  });

  it('GET /api/history should return 200 with history array', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/extract/stream should respond with SSE content-type headers', async () => {
    const res = await request(app)
      .post('/api/extract/stream')
      .field('sourceType', 'web')
      .field('url', 'https://example.com')
      .field('prompt', 'Tóm tắt bài viết này.');

    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
  });

  it('POST /api/extract/stream should handle missing files gracefully in SSE stream', async () => {
    const res = await request(app)
      .post('/api/extract/stream')
      .field('sourceType', 'pdf')
      .field('prompt', 'Tóm tắt.');

    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
    expect(res.text).toContain('"type":"error"');
    expect(res.text).toContain('No PDF file uploaded');
  });
});
