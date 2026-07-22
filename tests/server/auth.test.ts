import { describe, expect, it, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server/server';
import { initLoaders } from '../../src/server/loaders';
import { hashPasswordInBrowser } from '../../src/utils/crypto';

describe('User Authentication & Management API', () => {
  beforeAll(async () => {
    process.env.TURSO_DATABASE_URL = 'file:test.db';
    await initLoaders({ app });
  });

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    rawPassword: 'MySecurePassword123!',
    name: 'Alex Developer',
  };

  let sessionToken = '';
  let preHashedPassword = '';

  it('should register a new user successfully with pre-hashed password', async () => {
    preHashedPassword = await hashPasswordInBrowser(testUser.rawPassword);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: testUser.email,
        password: preHashedPassword,
        name: testUser.name,
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(response.body.data.user.name).toBe(testUser.name);
    expect(response.body.data.token).toBeDefined();

    sessionToken = response.body.data.token;
  });

  it('should fail registering with duplicate email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: testUser.email,
        password: preHashedPassword,
        name: 'Another Name',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already exists');
  });

  it('should fetch profile of logged-in user via GET /api/auth/me', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${sessionToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(response.body.data.user.name).toBe(testUser.name);
  });

  it('should reject unauthenticated request to /api/auth/me without token', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('should login user successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: preHashedPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    const wrongHash = await hashPasswordInBrowser('WrongPassword');

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: wrongHash,
      });

    expect(response.status).toBe(401);
  });

  it('should logout user and invalidate token', async () => {
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${sessionToken}`);

    expect(logoutResponse.status).toBe(200);

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${sessionToken}`);

    expect(meResponse.status).toBe(401);
  });
});
