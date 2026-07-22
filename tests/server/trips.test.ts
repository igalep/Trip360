import { describe, expect, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { readFileSync } from 'fs';
import { join } from 'path';
import app from '../../src/server/server';
import { db } from '../../src/server/db';
import { initLoaders } from '../../src/server/loaders';
import { hashPasswordInBrowser } from '../../src/utils/crypto';

describe('Trips Routes API', () => {
  const testUser = {
    email: `test_trips_${Date.now()}@example.com`,
    rawPassword: 'Password123!',
    name: 'Trips Tester',
  };
  let sessionToken = '';
  let userId = '';

  beforeAll(async () => {
    await initLoaders({ app });
    // Run schema.sql to ensure test DB structure is clean
    const schemaSql = readFileSync(join(process.cwd(), 'schema.sql'), 'utf8');
    await db.executeMultiple(schemaSql);

    // Register a test user
    const preHashedPassword = await hashPasswordInBrowser(testUser.rawPassword, testUser.email.toLowerCase());
    const regResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: testUser.email,
        password: preHashedPassword,
        name: testUser.name,
      });
    
    sessionToken = regResponse.body.data.token;
    userId = regResponse.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup test user
    await db.execute({
      sql: 'DELETE FROM users WHERE email = ?',
      args: [testUser.email.toLowerCase()],
    });
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
        .set('Authorization', `Bearer ${sessionToken}`)
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
        start_date: '2026-08-01',
        end_date: '2026-08-08',
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${sessionToken}`)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/trips', () => {
    it('should return a list of trips', async () => {
      // Seed a trip manually linked to test user
      await db.execute({
        sql: 'INSERT INTO trips (id, user_id, name, destination, start_date, end_date, nights, base_currency, budget_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: ['trip-1', userId, 'Georgia Trip', 'Georgia', '2026-09-01', '2026-09-05', 4, 'USD', 1200],
      });

      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Georgia Trip');
    });
  });

  describe('DELETE /api/trips/:id', () => {
    it('should delete the trip and cascade delete categories/expenses', async () => {
      // Seed a trip linked to test user
      await db.execute({
        sql: 'INSERT INTO trips (id, user_id, name, destination, start_date, end_date, nights, base_currency, budget_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: ['trip-del', userId, 'Delete Me', 'Nowhere', '2026-09-01', '2026-09-05', 4, 'USD', 1000],
      });
      // Seed a category
      await db.execute({
        sql: 'INSERT INTO categories (id, trip_id, name, icon, group_name) VALUES (?, ?, ?, ?, ?)',
        args: ['cat-del', 'trip-del', 'Flights', 'flight', 'fixed'],
      });

      const response = await request(app)
        .delete('/api/trips/trip-del')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify trip is deleted
      const tripResult = await db.execute({
        sql: 'SELECT id FROM trips WHERE id = ?',
        args: ['trip-del'],
      });
      expect(tripResult.rows.length).toBe(0);

      // Verify category is cascade deleted
      const catResult = await db.execute({
        sql: 'SELECT id FROM categories WHERE id = ?',
        args: ['cat-del'],
      });
      expect(catResult.rows.length).toBe(0);
    });

    it('should return 404 if trip to delete is not found', async () => {
      const response = await request(app)
        .delete('/api/trips/trip-non-existent')
        .set('Authorization', `Bearer ${sessionToken}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
});
