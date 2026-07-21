import { logger } from '../../utils/logger';

// Standard fallback rates relative to USD if network is offline or unserviceable
const DEFAULT_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  ILS: 3.65,
  EUR: 0.92,
  GBP: 0.78,
  GEL: 2.70,
  CAD: 1.36,
  AUD: 1.50,
  JPY: 155.0,
  CHF: 0.90,
  AED: 3.67,
};

interface CacheEntry {
  rate: number;
  timestamp: number;
}

export class CurrencyService {
  private static cache: Map<string, CacheEntry> = new Map();
  private static CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour TTL for live rates

  /**
   * Retrieves the conversion rate to convert 1 unit of `from` currency into `to` currency.
   * Example: from USD to ILS -> 3.65 (1 USD = 3.65 ILS)
   */
  public static async getExchangeRate(from: string, to: string, date?: string): Promise<{ rate: number; date: string; source: 'api' | 'cache' | 'fallback' }> {
    const fromCurr = from.toUpperCase();
    const toCurr = to.toUpperCase();
    const rateDate = date || new Date().toISOString().split('T')[0];

    if (fromCurr === toCurr) {
      return { rate: 1.0, date: rateDate, source: 'cache' };
    }

    const cacheKey = `${fromCurr}_${toCurr}_${rateDate}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL_MS)) {
      return { rate: cached.rate, date: rateDate, source: 'cache' };
    }

    try {
      // Fetch rates relative to `fromCurr` from open.er-api.com
      const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurr}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates && typeof data.rates[toCurr] === 'number') {
          const fetchedRate = data.rates[toCurr];
          this.cache.set(cacheKey, { rate: fetchedRate, timestamp: Date.now() });
          return { rate: fetchedRate, date: rateDate, source: 'api' };
        }
      }
    } catch (err) {
      logger.warn(`CurrencyService: External exchange rate lookup failed for ${fromCurr}->${toCurr}, using fallback. Error:`, err);
    }

    // Fallback calculation using standard USD relative rates
    const fromInUsd = DEFAULT_RATES_TO_USD[fromCurr] || 1.0;
    const toInUsd = DEFAULT_RATES_TO_USD[toCurr] || 1.0;

    // rate = (1 / fromInUsd) * toInUsd
    const fallbackRate = Number(((1 / fromInUsd) * toInUsd).toFixed(6));
    this.cache.set(cacheKey, { rate: fallbackRate, timestamp: Date.now() });

    return { rate: fallbackRate, date: rateDate, source: 'fallback' };
  }

  /**
   * Helper to set rate in cache directly (useful for tests or custom manual overrides)
   */
  public static setMockRate(from: string, to: string, rate: number, date?: string): void {
    const fromCurr = from.toUpperCase();
    const toCurr = to.toUpperCase();
    const rateDate = date || new Date().toISOString().split('T')[0];
    const cacheKey = `${fromCurr}_${toCurr}_${rateDate}`;
    this.cache.set(cacheKey, { rate, timestamp: Date.now() });
  }

  /**
   * Clears the exchange rate cache.
   */
  public static clearCache(): void {
    this.cache.clear();
  }
}
