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

  it('should trigger deletion call when clicking delete button in context menu', async () => {
    const deleteMock = jest.fn().mockImplementation((url: any, options?: any) => {
      if (options && options.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: mockTrips }),
      });
    });
    
    // Stub confirm dialog
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    await act(async () => {
      render(<Dashboard onSelectTrip={() => {}} />);
    });

    (window as any).fetch = deleteMock;

    // Click three-dot menu button
    const menuBtn = screen.getByTestId('trip-menu-btn-trip-1');
    fireEvent.click(menuBtn);

    // Click "Delete Trip" option
    const deleteBtn = screen.getByTestId('delete-trip-btn-trip-1');
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalledWith('/api/trips/trip-1', expect.any(Object));
    
    confirmSpy.mockRestore();
  });

  it('should display correct status label (Future, Active, Past) based on dates', async () => {
    const getRelativeDateString = (daysOffset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const testTrips = [
      {
        id: 'trip-future',
        name: 'Future Trip',
        destination: 'Destination A',
        start_date: getRelativeDateString(5),
        end_date: getRelativeDateString(10),
        nights: 5,
        base_currency: 'USD',
        budget_limit: 1000,
        total_spent: 0,
      },
      {
        id: 'trip-active',
        name: 'Active Trip',
        destination: 'Destination B',
        start_date: getRelativeDateString(-2),
        end_date: getRelativeDateString(2),
        nights: 4,
        base_currency: 'USD',
        budget_limit: 1000,
        total_spent: 0,
      },
      {
        id: 'trip-past',
        name: 'Past Trip',
        destination: 'Destination C',
        start_date: getRelativeDateString(-10),
        end_date: getRelativeDateString(-5),
        nights: 5,
        base_currency: 'USD',
        budget_limit: 1000,
        total_spent: 0,
      },
    ];

    const mockFetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: testTrips }),
      })
    );
    (window as any).fetch = mockFetch;
    (global as any).fetch = mockFetch;

    await act(async () => {
      render(<Dashboard onSelectTrip={() => {}} />);
    });

    expect(screen.getByTestId('trip-status-trip-future').textContent).toBe('Future');
    expect(screen.getByTestId('trip-status-trip-active').textContent).toBe('Active');
    expect(screen.getByTestId('trip-status-trip-past').textContent).toBe('Past');
  });
});
