import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../../components/UI/Card';

describe('Card Component', () => {
  it('renders card with children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    
    expect(card).toHaveClass(
      'bg-white',
      'shadow',
      'rounded-lg',
      'overflow-hidden'
    );
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-card">Content</Card>
    );
    const card = container.firstChild;
    
    expect(card).toHaveClass('custom-card');
  });

  it('renders Card.Header', () => {
    render(
      <Card>
        <Card.Header>
          <h1>Card Title</h1>
        </Card.Header>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders Card.Body', () => {
    render(
      <Card>
        <Card.Body>
          <p>Card body content</p>
        </Card.Body>
      </Card>
    );
    
    expect(screen.getByText('Card body content')).toBeInTheDocument();
  });

  it('renders Card.Footer', () => {
    render(
      <Card>
        <Card.Footer>
          <button>Action</button>
        </Card.Footer>
      </Card>
    );
    
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders complete card with all sections', () => {
    render(
      <Card>
        <Card.Header>
          <h1>Document Title</h1>
        </Card.Header>
        <Card.Body>
          <p>This is the document description.</p>
        </Card.Body>
        <Card.Footer>
          <button>Download</button>
          <button>View</button>
        </Card.Footer>
      </Card>
    );
    
    expect(screen.getByText('Document Title')).toBeInTheDocument();
    expect(screen.getByText('This is the document description.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
  });

  it('Card.Header applies correct styles', () => {
    const { container } = render(
      <Card>
        <Card.Header>Header</Card.Header>
      </Card>
    );
    
    const header = screen.getByText('Header').parentElement;
    expect(header).toHaveClass('px-4', 'py-5', 'sm:px-6');
  });

  it('Card.Body applies correct styles', () => {
    const { container } = render(
      <Card>
        <Card.Body>Body</Card.Body>
      </Card>
    );
    
    const body = screen.getByText('Body').parentElement;
    expect(body).toHaveClass('px-4', 'py-5', 'sm:p-6');
  });

  it('Card.Footer applies correct styles', () => {
    const { container } = render(
      <Card>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    );
    
    const footer = screen.getByText('Footer').parentElement;
    expect(footer).toHaveClass('bg-gray-50', 'px-4', 'py-4', 'sm:px-6');
  });

  it('supports custom className on subcomponents', () => {
    render(
      <Card>
        <Card.Header className="custom-header">Header</Card.Header>
        <Card.Body className="custom-body">Body</Card.Body>
        <Card.Footer className="custom-footer">Footer</Card.Footer>
      </Card>
    );
    
    expect(screen.getByText('Header').parentElement).toHaveClass('custom-header');
    expect(screen.getByText('Body').parentElement).toHaveClass('custom-body');
    expect(screen.getByText('Footer').parentElement).toHaveClass('custom-footer');
  });

  it('handles click events on card', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <Card onClick={handleClick}>
        <p>Clickable card</p>
      </Card>
    );
    
    const card = container.firstChild;
    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});