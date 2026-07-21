/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCurrencyRate } from '../../src/hooks/useCurrencyRate';
import { useLedger } from '../../src/hooks/useLedger';

const mockTripData = {
  trip: {
    id: 'trip-100',
    name: 'Tel Aviv Trip',
    destination: 'Tel Aviv',
    start_date: '2026-08-01',
    end_date: '2026-08-08',
    nights: 7,
    base_currency: 'ILS',
    budget_limit: 2000,
    image_url: '',
  },
  categories: [
    { id: 'cat-1', trip_id: 'trip-100', name: 'Food', icon: 'restaurant', group_name: 'living', is_default: 1 },
  ],
  expenses: [
    {
      id: 'exp-1',
      trip_id: 'trip-100',
      category_id: 'cat-1',
      amount: 100,
      original_amount: 100,
      original_currency: 'ILS',
      conversion_rate: 1.0,
      payment_method: 'card',
      description: 'Dinner',
      date: '2026-08-01',
    },
  ],
};

describe('Custom Hooks Architecture Tests', () => {
  beforeEach(() => {
    const mockFetch = jest.fn().mockImplementation((url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/currencies/rate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success', data: { rate: 3.65 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: mockTripData }),
      });
    });
    (window as any).fetch = mockFetch;
    (globalThis as any).fetch = mockFetch;
  });

  describe('useCurrencyRate()', () => {
    it('should return rate 1.0 immediately if from and to currencies are identical', () => {
      const { result } = renderHook(() => useCurrencyRate('ILS', 'ILS'));
      expect(result.current.rate).toBe(1.0);
      expect(result.current.loading).toBe(false);
    });

    it('should fetch exchange rate dynamically when currencies differ', async () => {
      const { result } = renderHook(() => useCurrencyRate('USD', 'ILS', '2026-08-01'));
      
      await waitFor(() => {
        expect(result.current.rate).toBe(3.65);
      });
    });
  });

  describe('useLedger()', () => {
    it('should fetch ledger data and compute memoized metrics', async () => {
      const { result } = renderHook(() => useLedger('trip-100'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.trip?.name).toBe('Tel Aviv Trip');
      expect(result.current.totalSpent).toBe(100);
      expect(result.current.budgetPercent).toBe(5); // 100 / 2000 * 100 = 5%
      expect(result.current.categoryAggregates[0].total).toBe(100);
    });
  });
});
