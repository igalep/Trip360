import { describe, expect, it } from '@jest/globals';
import { CreateTripSchema } from '../../src/server/schemas/trip.schema';
import { CreateExpenseSchema } from '../../src/server/schemas/expense.schema';

describe('Validation Schemas', () => {
  describe('CreateTripSchema', () => {
    it('should validate valid trip payloads', () => {
      const payload = {
        name: 'Baku Summer Trip',
        destination: 'Azerbaijan',
        start_date: '2026-08-01',
        end_date: '2026-08-10',
        budget_limit: 1500,
        base_currency: 'USD',
      };
      const result = CreateTripSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should fail validation on invalid start_date format', () => {
      const payload = {
        name: 'Baku Summer Trip',
        destination: 'Azerbaijan',
        start_date: '08/01/2026',
        end_date: '2026-08-10',
        budget_limit: 1500,
        base_currency: 'USD',
      };
      const result = CreateTripSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should fail validation on missing name or destination', () => {
      const payload = {
        start_date: '2026-08-01',
        end_date: '2026-08-10',
      };
      const result = CreateTripSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateExpenseSchema', () => {
    it('should validate valid expense payloads', () => {
      const payload = {
        trip_id: 'trip-123',
        category_id: 'cat-456',
        amount: 50.5,
        original_amount: 170,
        original_currency: 'AZN',
        conversion_rate: 0.29,
        payment_method: 'card',
        description: 'Dinner at Baku restaurant',
        date: '2026-08-02',
      };
      const result = CreateExpenseSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should fail validation on invalid payment_method', () => {
      const payload = {
        trip_id: 'trip-123',
        category_id: 'cat-456',
        amount: 50.5,
        original_amount: 170,
        original_currency: 'AZN',
        conversion_rate: 0.29,
        payment_method: 'bitcoin', // invalid
        date: '2026-08-02',
      };
      const result = CreateExpenseSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
