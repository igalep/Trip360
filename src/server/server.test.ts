import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from './server';

describe('Express Server Health', () => {
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
