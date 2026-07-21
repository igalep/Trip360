import { describe, expect, it, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { readFileSync } from 'fs';
import { join } from 'path';
import app from '../../src/server/server';
import { db } from '../../src/server/db';
import { initLoaders } from '../../src/server/loaders';

describe('Expenses & Categories Routes API', () => {
  beforeAll(async () => {
    await initLoaders({ app });
    // Run schema.sql to ensure test DB structure is clean
    const schemaSql = readFileSync(join(process.cwd(), 'schema.sql'), 'utf8');
    await db.executeMultiple(schemaSql);
  });

  beforeEach(async () => {
    // Clean trips, categories, and expenses
    await db.execute('DELETE FROM expenses');
    await db.execute('DELETE FROM categories');
    await db.execute('DELETE FROM trips');

    // Seed a trip and its categories for the tests
    await db.execute({
      sql: 'INSERT INTO trips (id, name, destination, start_date, end_date, nights, base_currency, budget_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: ['trip-1', 'Baku Summer', 'Baku', '2026-08-01', '2026-08-08', 7, 'USD', 1500],
    });

    await db.execute({
      sql: 'INSERT INTO categories (id, trip_id, name, icon, group_name, is_default) VALUES (?, ?, ?, ?, ?, 1)',
      args: ['cat-flight', 'trip-1', 'Flight', 'flight', 'fixed'],
    });

    await db.execute({
      sql: 'INSERT INTO categories (id, trip_id, name, icon, group_name, is_default) VALUES (?, ?, ?, ?, ?, 1)',
      args: ['cat-shopping', 'trip-1', 'Shopping', 'shopping', 'leisure'],
    });
  });

  describe('GET /api/trips/:id', () => {
    it('should return trip details, categories, and expenses', async () => {
      // Seed an expense
      await db.execute({
        sql: 'INSERT INTO expenses (id, trip_id, category_id, amount, original_amount, original_currency, conversion_rate, payment_method, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: ['exp-1', 'trip-1', 'cat-flight', 350.0, 350.0, 'USD', 1.0, 'card', 'Flight to Baku', '2026-08-01'],
      });

      const response = await request(app).get('/api/trips/trip-1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.trip.name).toBe('Baku Summer');
      expect(response.body.data.categories.length).toBe(2);
      expect(response.body.data.expenses.length).toBe(1);
      expect(response.body.data.expenses[0].description).toBe('Flight to Baku');
    });

    it('should return 404 if trip is not found', async () => {
      const response = await request(app).get('/api/trips/trip-nonexistent');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/expenses', () => {
    it('should create an expense and return 201', async () => {
      const payload = {
        trip_id: 'trip-1',
        category_id: 'cat-shopping',
        amount: 29.0,
        original_amount: 100.0,
        original_currency: 'GEL',
        conversion_rate: 0.29,
        payment_method: 'cash',
        description: 'Souvernirs',
        date: '2026-08-03',
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.amount).toBe(29.0);

      // Verify in DB
      const result = await db.execute({
        sql: 'SELECT id FROM expenses WHERE id = ?',
        args: [response.body.data.id],
      });
      expect(result.rows.length).toBe(1);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update conversion rate and recalculate amount', async () => {
      // Seed a foreign expense
      await db.execute({
        sql: 'INSERT INTO expenses (id, trip_id, category_id, amount, original_amount, original_currency, conversion_rate, payment_method, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: ['exp-3', 'trip-1', 'cat-flight', 365.0, 100.0, 'USD', 3.65, 'card', 'Flight', '2026-08-01'],
      });

      const response = await request(app)
        .put('/api/expenses/exp-3')
        .send({ conversion_rate: 3.70 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.conversion_rate).toBe(3.70);
      expect(response.body.data.amount).toBe(370.0);

      // Verify in DB
      const result = await db.execute({
        sql: 'SELECT conversion_rate, amount FROM expenses WHERE id = ?',
        args: ['exp-3'],
      });
      expect(result.rows[0].conversion_rate).toBe(3.70);
      expect(result.rows[0].amount).toBe(370.0);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete the expense and return 200', async () => {
      // Seed an expense
      await db.execute({
        sql: 'INSERT INTO expenses (id, trip_id, category_id, amount, original_amount, original_currency, conversion_rate, payment_method, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: ['exp-2', 'trip-1', 'cat-shopping', 45.0, 45.0, 'USD', 1.0, 'card', 'Dinner', '2026-08-04'],
      });

      const response = await request(app).delete('/api/expenses/exp-2');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify in DB
      const result = await db.execute({
        sql: 'SELECT id FROM expenses WHERE id = ?',
        args: ['exp-2'],
      });
      expect(result.rows.length).toBe(0);
    });
  });
});
