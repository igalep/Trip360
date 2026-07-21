/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ExpenseEntryForm } from '../../src/components/ledger/ExpenseEntryForm';
import { TransactionList } from '../../src/components/ledger/TransactionList';
import { LedgerSummaryTable } from '../../src/components/ledger/LedgerSummaryTable';
import type { Trip, Category, Expense } from '../../src/hooks/useLedger';

const mockTrip: Trip = {
  id: 'trip-1',
  name: 'Baku Summer',
  destination: 'Baku, Azerbaijan',
  start_date: '2026-08-01',
  end_date: '2026-08-08',
  nights: 7,
  base_currency: 'USD',
  budget_limit: 1500,
  image_url: '',
};

const mockCategories: Category[] = [
  { id: 'cat-flight', trip_id: 'trip-1', name: 'Flight', icon: 'flight', group_name: 'fixed', is_default: 1 },
  { id: 'cat-hotel', trip_id: 'trip-1', name: 'Hotel', icon: 'hotel', group_name: 'fixed', is_default: 1 },
];

const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    trip_id: 'trip-1',
    category_id: 'cat-flight',
    amount: 350,
    original_amount: 100,
    original_currency: 'EUR',
    conversion_rate: 3.5,
    payment_method: 'card',
    description: 'Plane ticket',
    date: '2026-08-01',
  },
];

describe('Modular Ledger Components Tests', () => {
  describe('<ExpenseEntryForm />', () => {
    it('should render currency options and submit form payload', async () => {
      const submitMock = jest.fn().mockImplementation(() => Promise.resolve(true));
      const customCatMock = jest.fn().mockImplementation(() => Promise.resolve(true));

      await act(async () => {
        render(
          <ExpenseEntryForm
            trip={mockTrip}
            categories={mockCategories}
            onSubmitExpense={submitMock as any}
            onAddCustomCategory={customCatMock as any}
          />
        );
      });

      expect(screen.getByTestId('select-currency')).toBeTruthy();

      const amountInput = screen.getByTestId('input-expense-amount');
      fireEvent.change(amountInput, { target: { value: '250' } });

      const submitBtn = screen.getByTestId('submit-transaction');
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(submitMock).toHaveBeenCalled();
    });
  });

  describe('<TransactionList />', () => {
    it('should render transaction items and allow toggling rate editor', async () => {
      const deleteMock = jest.fn();
      const updateRateMock = jest.fn().mockImplementation(() => Promise.resolve(true));

      render(
        <TransactionList
          expenses={mockExpenses}
          tripBaseCurrency="USD"
          onDeleteExpense={deleteMock}
          onUpdateRate={updateRateMock as any}
        />
      );

      expect(screen.getByText('Plane ticket')).toBeTruthy();
      expect(screen.getByTestId('btn-edit-rate-exp-1')).toBeTruthy();

      const editBtn = screen.getByTestId('btn-edit-rate-exp-1');
      fireEvent.click(editBtn);

      expect(screen.getByTestId('input-rate-edit-exp-1')).toBeTruthy();
      expect(screen.getByTestId('save-rate-edit-exp-1')).toBeTruthy();
    });
  });

  describe('<LedgerSummaryTable />', () => {
    it('should render category aggregates and budget stats', () => {
      const aggregates = mockCategories.map((c) => ({ ...c, total: 350 }));

      render(
        <LedgerSummaryTable
          tripBaseCurrency="USD"
          categoryAggregates={aggregates}
          dailyAverage={50}
          budgetPercent={23}
        />
      );

      expect(screen.getByText('Flight')).toBeTruthy();
      expect(screen.getByText('23%')).toBeTruthy();
    });
  });
});
