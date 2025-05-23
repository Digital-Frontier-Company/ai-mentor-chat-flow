
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Logo from './logo';

describe('Logo component', () => {
  const renderWithRouter = (ui: React.ReactNode) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders with default size', () => {
    renderWithRouter(<Logo />);
    const logo = screen.getByText(/MakeMentors/i);
    expect(logo).toBeInTheDocument();
  });
  
  it('renders with small size', () => {
    renderWithRouter(<Logo size="sm" />);
    const logo = screen.getByText(/MakeMentors/i);
    expect(logo).toHaveClass('text-lg');
  });
  
  it('renders with medium size', () => {
    renderWithRouter(<Logo size="md" />);
    const logo = screen.getByText(/MakeMentors/i);
    expect(logo).toHaveClass('text-xl');
  });
  
  it('renders with large size', () => {
    renderWithRouter(<Logo size="lg" />);
    const logo = screen.getByText(/MakeMentors/i);
    expect(logo).toHaveClass('text-3xl');
  });
  
  it('renders with linked to home page by default', () => {
    renderWithRouter(<Logo />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });
  
  it('renders without link when noLink is true', () => {
    renderWithRouter(<Logo noLink />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
