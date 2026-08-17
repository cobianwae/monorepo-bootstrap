import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination';

describe('Pagination components', () => {
  it('renders a nav with aria-label', () => {
    render(<Pagination>content</Pagination>);
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('pagination');
  });

  it('renders link, previous and next controls', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByText('Previous')).toBeDefined();
    expect(screen.getByText('Next')).toBeDefined();
    expect(screen.getByText('1').getAttribute('aria-current')).toBe('page');
    expect(screen.getByLabelText('Go to previous page')).toBeDefined();
    expect(screen.getByLabelText('Go to next page')).toBeDefined();
  });

  it('fires onClick on previous control', () => {
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={onClick} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    fireEvent.click(screen.getByText('Previous'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders ellipsis with accessible label', () => {
    render(<PaginationEllipsis />);
    expect(screen.getByText('More pages')).toBeDefined();
  });
});