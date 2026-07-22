/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { AuthView } from '../../src/components/auth/AuthView';

function TestConsumer() {
  const { user, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-name">{user ? user.name : 'No User'}</span>
      {user && (
        <button onClick={logout} data-testid="logout-btn">
          Logout
        </button>
      )}
    </div>
  );
}

describe('Portfolioinfo-Style Auth Components', () => {
  it('should render AuthView with Sign In mode and toggle to Create Account mode', () => {
    render(
      <AuthProvider>
        <AuthView />
      </AuthProvider>
    );

    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByTestId('auth-email-input')).toBeTruthy();
    expect(screen.getByTestId('auth-password-input')).toBeTruthy();
    expect(screen.queryByTestId('auth-name-input')).toBeNull();

    // Toggle to Create Account mode
    const toggleBtn = screen.getByTestId('auth-toggle-mode-btn');
    fireEvent.click(toggleBtn);

    expect(screen.getAllByText('Create Account').length).toBeGreaterThan(0);
    expect(screen.getByTestId('auth-name-input')).toBeTruthy();
  });

  it('should show and hide password when visibility button clicked', () => {
    render(
      <AuthProvider>
        <AuthView />
      </AuthProvider>
    );

    const passwordInput = screen.getByTestId('auth-password-input') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleVisibilityBtn = screen.getByTitle('Show Password');
    fireEvent.click(toggleVisibilityBtn);

    expect(passwordInput.type).toBe('text');
  });

  it('should render AuthProvider and default to unauthenticated state', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('user-name').textContent).toBe('No User');
  });
});
