import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';

describe('Authentication API Integration Tests (JWT & Google)', () => {
  const testUser = {
    name: 'Student Tester',
    email: `tester_${Date.now()}@manabi.edu`,
    password: 'SecurePassword123!',
  };

  it('POST /api/auth/register should create user and return JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.name).toBe(testUser.name);
  });

  it('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('đã được sử dụng');
  });

  it('POST /api/auth/login should authenticate valid credentials and return JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('POST /api/auth/login should reject invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/google should authenticate and issue JWT token', async () => {
    const res = await request(app).post('/api/auth/google').send({
      name: 'Google Student',
      email: 'student_google@gmail.com',
      avatar: 'https://example.com/avatar.png',
      googleId: 'g_123456789',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('student_google@gmail.com');
  });

  it('POST /api/auth/forgot-password should generate reset token', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: testUser.email,
    });
    expect(res.status).toBe(200);
    expect(res.body.resetToken).toBeDefined();
  });

  it('GET /api/auth/me should return user profile with valid JWT Bearer header', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(testUser.email.toLowerCase());
  });

  it('GET /api/auth/me should return 401 without Bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
