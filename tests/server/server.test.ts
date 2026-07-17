import { describe, expect, it, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server/server';
import { initLoaders } from '../../src/server/loaders';

describe('Express Server Health', () => {
  beforeAll(async () => {
    await initLoaders({ app });
  });
  it('should return 200 OK on health check', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
      })
    );
  });
});
