/**
 * @jest-environment jsdom
 */
/// <reference types="node" />
import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CategoryManageView from '../../src/components/CategoryManageView';

const mockTripDetails = {
  trip: {
    id: 'trip-1',
    name: 'Baku Summer',
    destination: 'Baku, Azerbaijan',
    start_date: '2026-08-01',
    end_date: '2026-08-08',
    nights: 7,
    base_currency: 'USD',
    budget_limit: 1600,
    image_url: '/assets/destinations/baku.png',
  },
  categories: [
    { id: 'cat-restaurants', trip_id: 'trip-1', name: 'Restaurants', icon: 'restaurant', group_name: 'living', is_default: 1 },
    { id: 'cat-flight', trip_id: 'trip-1', name: 'Flight', icon: 'flight', group_name: 'fixed', is_default: 1 },
  ],
  expenses: [
    {
      id: 'exp-101',
      trip_id: 'trip-1',
      category_id: 'cat-restaurants',
      amount: 45.5,
      original_amount: 45.5,
      original_currency: 'USD',
      conversion_rate: 1.0,
      payment_method: 'card',
      description: 'Blue Bottle Coffee',
      date: '2026-08-02',
      category_name: 'Restaurants',
      category_icon: 'restaurant',
    },
  ],
};

describe('CategoryManageView Component', () => {
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

  it('should render category title, spending matrix, and existing entries', async () => {
    await act(async () => {
      render(
        <CategoryManageView
          tripIdentifier="Baku Summer"
          categoryIdentifier="Restaurants"
          onBack={() => {}}
        />
      );
    });

    expect(screen.getByTestId('category-manage-title')).toBeTruthy();
    expect(screen.getByText('Restaurants')).toBeTruthy();
    expect(screen.getAllByText('$45.50').length).toBeGreaterThan(0);
    expect(screen.getByText('1 Entry')).toBeTruthy();
    expect(screen.getByText('Blue Bottle Coffee')).toBeTruthy();
  });
});
