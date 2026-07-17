import { describe, expect, it, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { readFileSync } from 'fs';
import { join } from 'path';
import app from '../../src/server/server';
import { db } from '../../src/server/db';
import { initLoaders } from '../../src/server/loaders';

describe('Trips Routes API', () => {
  beforeAll(async () => {
    await initLoaders({ app });
    // Run schema.sql to ensure test DB structure is clean
    const schemaSql = readFileSync(join(process.cwd(), 'schema.sql'), 'utf8');
    await db.executeMultiple(schemaSql);
  });

  beforeEach(async () => {
    // Clean trips and expenses
    await db.execute('DELETE FROM expenses');
    await db.execute('DELETE FROM categories');
    await db.execute('DELETE FROM trips');
  });

  describe('POST /api/trips', () => {
    it('should create a new trip and return 201 with seeded default categories', async () => {
      const payload = {
        name: 'Baku Tour 2026',
        destination: 'Baku, Azerbaijan',
        start_date: '2026-08-01',
        end_date: '2026-08-08',
        budget_limit: 2000,
        base_currency: 'USD',
      };

      const response = await request(app)
        .post('/api/trips')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Baku Tour 2026');
      expect(response.body.data.nights).toBe(7); // 8 - 1 = 7 nights

      // Check if categories are seeded
      const tripId = response.body.data.id;
      const categoriesResult = await db.execute({
        sql: 'SELECT * FROM categories WHERE trip_id = ?',
        args: [String(tripId)],
      });
      expect(categoriesResult.rows.length).toBe(6); // Default sections
    });

    it('should return 400 validation error if payload is invalid', async () => {
      const payload = {
        name: '', // invalid
        destination: 'Baku',
        start_date: 'invalid-date',
      };

      const response = await request(app)
        .post('/api/trips')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/trips', () => {
    it('should return a list of trips', async () => {
      // Seed a trip manually
      await db.execute({
        sql: 'INSERT INTO trips (id, name, destination, start_date, end_date, nights, base_currency, budget_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: ['trip-1', 'Georgia Trip', 'Georgia', '2026-09-01', '2026-09-05', 4, 'USD', 1200],
      });

      const response = await request(app).get('/api/trips');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Georgia Trip');
    });
  });
});
