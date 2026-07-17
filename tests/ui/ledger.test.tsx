/**
 * @jest-environment jsdom
 */
/// <reference types="node" />
import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LedgerView from '../../src/components/LedgerView';

// Mock data
const mockTripDetails = {
  trip: {
    id: 'trip-1',
    name: 'Baku Summer',
    destination: 'Baku, Azerbaijan',
    start_date: '2026-08-01',
    end_date: '2026-08-08',
    nights: 7,
    base_currency: 'USD',
    budget_limit: 1500,
    image_url: '/assets/destinations/baku.png',
  },
  categories: [
    { id: 'cat-flight', trip_id: 'trip-1', name: 'Flight', icon: 'flight', group_name: 'fixed', is_default: 1 },
    { id: 'cat-hotel', trip_id: 'trip-1', name: 'Accommodation', icon: 'hotel', group_name: 'fixed', is_default: 1 },
  ],
  expenses: [
    {
      id: 'exp-1',
      trip_id: 'trip-1',
      category_id: 'cat-flight',
      amount: 350.0,
      original_amount: 350.0,
      original_currency: 'USD',
      conversion_rate: 1.0,
      payment_method: 'card',
      description: 'Flight ticket',
      date: '2026-08-01',
      category_name: 'Flight',
      category_icon: 'flight',
    },
  ],
};

describe('LedgerView Component', () => {
  beforeEach(() => {
    const mockFetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: mockTripDetails }),
      })
    );
    (window as any).fetch = mockFetch;
    (global as any).fetch = mockFetch;
  });

  it('should render the active trip title and categories list', async () => {
    await act(async () => {
      render(<LedgerView tripId="trip-1" onBack={() => {}} />);
    });

    expect(screen.getByText('Baku Summer')).toBeTruthy();
    expect(screen.getByText('New Expense')).toBeTruthy();
    expect(screen.getByText('Flight')).toBeTruthy();
    expect(screen.getByText('Accommodation')).toBeTruthy();
  });

  it('should allow adding an expense and call post API', async () => {
    const postMock = jest.fn().mockImplementation((url: any, options?: any) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success', data: { id: 'exp-new', amount: 50 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: mockTripDetails }),
      });
    });
    
    await act(async () => {
      render(<LedgerView tripId="trip-1" onBack={() => {}} />);
    });

    // Re-mock fetch for POST submit
    (window as any).fetch = postMock;

    // Fill in amount
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '50.00' } });

    // Submit
    const submitBtn = screen.getByText('Add Expense');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(postMock).toHaveBeenCalled();
  });

  it('should swap tabs when clicking ledger tab button', async () => {
    await act(async () => {
      render(<LedgerView tripId="trip-1" onBack={() => {}} />);
    });

    const ledgerTabBtn = screen.getByTestId('tab-btn-ledger');
    fireEvent.click(ledgerTabBtn);

    // Ledger summary table should contain flights spent
    expect(screen.getByText('Flight')).toBeTruthy();
    expect(screen.getAllByText('$350.00').length).toBeGreaterThan(0);
  });
});
