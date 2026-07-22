/**
 * @jest-environment jsdom
 */
/// <reference types="node" />
import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../src/App';

const mockTrips = [
  {
    id: 'trip-100',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    start_date: '2026-09-01',
    end_date: '2026-09-10',
    nights: 9,
    base_currency: 'USD',
    budget_limit: 2500,
    image_url: '/assets/destinations/tokyo.png',
    total_spent: 450.0,
  },
];

describe('App Component Routing', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    localStorage.setItem('budgetcontrol_session_token', 'test_mock_token');
    const mockFetch = jest.fn().mockImplementation((url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success', data: { user: { id: 'u-1', email: 'test@example.com', name: 'Test User' } } }),
        });
      }
      if (urlStr.includes('/api/trips/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'success',
              data: {
                trip: mockTrips[0],
                categories: [
                  { id: 'cat-1', trip_id: 'trip-100', name: 'Flight', icon: 'flight', group_name: 'fixed', is_default: 1 },
                ],
                expenses: [],
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: mockTrips }),
      });
    });
    (window as any).fetch = mockFetch;
    (global as any).fetch = mockFetch;
  });

  it('should navigate from Dashboard to /trip/:trip_name when clicking a trip card', async () => {
    await act(async () => {
      render(<App />);
    });

    // Wait for Dashboard to render trip card
    const tripCard = await screen.findByTestId('trip-card-trip-100');
    expect(tripCard).toBeTruthy();

    // Click the trip card
    await act(async () => {
      fireEvent.click(tripCard);
    });

    // Address URL should update to /trip/Tokyo%20Adventure
    expect(window.location.pathname).toBe('/trip/Tokyo%20Adventure');

    // Active Ledger View should render the trip title
    const tripTitle = await screen.findByText('Tokyo Adventure');
    expect(tripTitle).toBeTruthy();
  });
});
