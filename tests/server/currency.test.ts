import { describe, expect, it, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server/server';
import { initLoaders } from '../../src/server/loaders';
import { CurrencyService } from '../../src/server/services/currency.service';

describe('Currency Service & Exchange Rates API', () => {
  beforeAll(async () => {
    await initLoaders({ app });
  });

  beforeEach(() => {
    CurrencyService.clearCache();
  });

  describe('CurrencyService.getExchangeRate()', () => {
    it('should return rate 1.0 when converting currency to itself', async () => {
      const result = await CurrencyService.getExchangeRate('USD', 'USD');
      expect(result.rate).toBe(1.0);
      expect(result.source).toBe('cache');
    });

    it('should return fallback rate when offline or API call fails', async () => {
      // Test conversion USD to ILS (Shekel)
      const result = await CurrencyService.getExchangeRate('USD', 'ILS');
      expect(typeof result.rate).toBe('number');
      expect(result.rate).toBeGreaterThan(0);
    });

    it('should utilize in-memory caching on subsequent calls', async () => {
      CurrencyService.setMockRate('EUR', 'ILS', 4.0, '2026-07-21');
      const result = await CurrencyService.getExchangeRate('EUR', 'ILS', '2026-07-21');
      expect(result.rate).toBe(4.0);
      expect(result.source).toBe('cache');
    });
  });

  describe('GET /api/currencies/rate', () => {
    it('should return exchange rate between two currencies', async () => {
      CurrencyService.setMockRate('USD', 'ILS', 3.70, '2026-07-21');

      const response = await request(app)
        .get('/api/currencies/rate')
        .query({ from: 'USD', to: 'ILS', date: '2026-07-21' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.from).toBe('USD');
      expect(response.body.data.to).toBe('ILS');
      expect(response.body.data.rate).toBe(3.70);
    });

    it('should return 400 validation error if query params are missing or invalid', async () => {
      const response = await request(app)
        .get('/api/currencies/rate')
        .query({ from: 'INVALID_CODE', to: 'ILS' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});
