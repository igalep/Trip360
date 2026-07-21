import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '../utils/logger';

export interface Category {
  id: string;
  trip_id: string;
  name: string;
  icon: string;
  group_name: string;
  is_default: number;
}

export interface Expense {
  id: string;
  trip_id: string;
  category_id: string;
  amount: number;
  original_amount: number;
  original_currency: string;
  conversion_rate: number;
  payment_method: string;
  description: string;
  date: string;
  category_name?: string;
  category_icon?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  nights: number;
  base_currency: string;
  budget_limit: number;
  image_url: string;
}

export interface CreateExpensePayload {
  trip_id: string;
  category_id: string;
  amount: number;
  original_amount: number;
  original_currency: string;
  conversion_rate: number;
  payment_method: 'card' | 'cash';
  description: string;
  date: string;
}

export function useLedger(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedgerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/trips/${tripId}`);
      const json = await response.json();

      if (json.status === 'success') {
        setTrip(json.data.trip);
        setCategories(json.data.categories);
        setExpenses(json.data.expenses);
      } else {
        setError(json.message || 'Failed to load trip data');
      }
    } catch (err: any) {
      logger.error('useLedger fetchLedgerData error:', err);
      setError('Network error fetching ledger data');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const addExpense = useCallback(async (payload: CreateExpensePayload): Promise<boolean> => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (json.status === 'success') {
        await fetchLedgerData();
        return true;
      }
      return false;
    } catch (err: any) {
      logger.error('useLedger addExpense error:', err);
      return false;
    }
  }, [fetchLedgerData]);

  const deleteExpense = useCallback(async (expenseId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (json.status === 'success') {
        await fetchLedgerData();
        return true;
      }
      return false;
    } catch (err: any) {
      logger.error('useLedger deleteExpense error:', err);
      return false;
    }
  }, [fetchLedgerData]);

  const updateExpenseRate = useCallback(async (expenseId: string, newRate: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversion_rate: newRate }),
      });
      const json = await response.json();
      if (json.status === 'success') {
        await fetchLedgerData();
        return true;
      }
      return false;
    } catch (err: any) {
      logger.error('useLedger updateExpenseRate error:', err);
      return false;
    }
  }, [fetchLedgerData]);

  const addCategory = useCallback(async (name: string, icon: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/trips/${tripId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon }),
      });
      const json = await response.json();
      if (json.status === 'success') {
        await fetchLedgerData();
        return true;
      }
      return false;
    } catch (err: any) {
      logger.error('useLedger addCategory error:', err);
      return false;
    }
  }, [tripId, fetchLedgerData]);

  // Memoized Metrics Calculations
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const budgetLimit = useMemo(() => {
    return trip?.budget_limit || 1000;
  }, [trip?.budget_limit]);

  const budgetPercent = useMemo(() => {
    return Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
  }, [totalSpent, budgetLimit]);

  const dailyAverage = useMemo(() => {
    return trip?.nights ? totalSpent / trip.nights : totalSpent;
  }, [totalSpent, trip?.nights]);

  const categoryAggregates = useMemo(() => {
    return categories.map((cat) => {
      const total = expenses
        .filter((exp) => exp.category_id === cat.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return { ...cat, total };
    });
  }, [categories, expenses]);

  return {
    trip,
    categories,
    expenses,
    loading,
    error,
    totalSpent,
    budgetLimit,
    budgetPercent,
    dailyAverage,
    categoryAggregates,
    fetchLedgerData,
    addExpense,
    deleteExpense,
    updateExpenseRate,
    addCategory,
  };
}
