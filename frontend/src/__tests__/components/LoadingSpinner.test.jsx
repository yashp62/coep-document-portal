import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('renders with medium size', () => {
    render(<LoadingSpinner size="md" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('renders with extra large size', () => {
    render(<LoadingSpinner size="xl" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-16', 'h-16');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('has proper aria-label for accessibility', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('shows default "Loading..." text when no text provided', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies animation classes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('has proper styling classes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-primary-600'
    );
  });

  it('centers content when fullScreen prop is used', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      'fixed',
      'inset-0',
      'flex',
      'items-center',
      'justify-center',
      'bg-white',
      'bg-opacity-75',
      'z-50'
    );
  });

  it('renders inline when fullScreen is false', () => {
    const { container } = render(<LoadingSpinner fullScreen={false} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    expect(wrapper).not.toHaveClass('fixed', 'inset-0');
  });
});