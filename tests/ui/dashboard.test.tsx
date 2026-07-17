/**
 * @jest-environment jsdom
 */
/// <reference types="node" />
import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Dashboard from '../../src/components/Dashboard';

// Mock data
const mockTrips = [
  {
    id: 'trip-1',
    name: 'Baku Summer',
    destination: 'Baku, Azerbaijan',
    start_date: '2026-08-01',
    end_date: '2026-08-08',
    nights: 7,
    base_currency: 'USD',
    budget_limit: 1500,
    image_url: '/assets/destinations/baku.png',
    total_spent: 350.0,
  },
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    const mockFetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: mockTrips }),
      })
    );
    (window as any).fetch = mockFetch;
    (global as any).fetch = mockFetch;
  });

  it('should render the dashboard heading and trips list', async () => {
    await act(async () => {
      render(<Dashboard onSelectTrip={() => {}} />);
    });

    expect(screen.getByText('Recent Trips')).toBeTruthy();
    
    // Await async items rendered inside useEffect fetch
    const tripName = await screen.findByText('Baku Summer');
    expect(tripName).toBeTruthy();
    expect(screen.getByText('Baku, Azerbaijan')).toBeTruthy();
    expect(screen.getByText('7 nights')).toBeTruthy();
    expect(screen.getAllByText('$350.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Budget: $1,500.00')).toBeTruthy();
  });

  it('should open the Create Trip modal when clicking create button', async () => {
    await act(async () => {
      render(<Dashboard onSelectTrip={() => {}} />);
    });

    const createBtn = screen.getByTestId('create-trip-btn');
    fireEvent.click(createBtn);

    expect(screen.getByTestId('modal-title')).toBeTruthy();
    expect(screen.getByTestId('input-trip-name')).toBeTruthy();
  });
});
