import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import LoginPage from './LoginPage';

vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({ loginUser: vi.fn() })
}));

describe('LoginPage', () => {
  it('renders login heading', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Bejelentkezés' })).toBeInTheDocument();
  });
});
