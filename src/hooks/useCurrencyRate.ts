import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

interface UseCurrencyRateResult {
  rate: number;
  setRate: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  error: string | null;
}

export function useCurrencyRate(from: string, to: string, date?: string): UseCurrencyRateResult {
  const [rate, setRate] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to || from.toUpperCase() === to.toUpperCase()) {
      setRate(1.0);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const fetchRate = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/api/currencies/rate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${date ? `&date=${encodeURIComponent(date)}` : ''}`;
        const response = await fetch(url, { signal: controller.signal });
        const json = await response.json();

        if (json.status === 'success' && typeof json.data.rate === 'number') {
          setRate(json.data.rate);
        } else {
          setError(json.message || 'Failed to retrieve exchange rate');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Clean cancellation on quick parameter changes
          return;
        }
        logger.error('useCurrencyRate error:', err);
        setError('Error fetching exchange rate');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRate();

    return () => {
      controller.abort();
    };
  }, [from, to, date]);

  return { rate, setRate, loading, error };
}
