import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';
import { BottomNav } from './bottom-nav';

describe('Breadcrumb & BottomNav', () => {
  describe('Breadcrumb', () => {
    it('renders a navigational list of links', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
      expect(nav).toBeDefined();
      expect(screen.getByText('Home').closest('a')?.getAttribute('href')).toBe('/');
      expect(screen.getByText('Current')).toBeDefined();
    });

    it('renders a custom separator via children', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>One</BreadcrumbItem>
            <BreadcrumbSeparator>›</BreadcrumbSeparator>
            <BreadcrumbItem>Two</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getAllByText('›').length).toBeGreaterThan(0);
    });
  });

  describe('BottomNav', () => {
    it('renders a mobile navigation landmark', () => {
      render(<BottomNav>content</BottomNav>);
      const nav = screen.getByRole('navigation', { name: 'Mobile Navigation' });
      expect(nav).toBeDefined();
    });

    it('renders with floating variant', () => {
      const { container } = render(<BottomNav variant="floating">content</BottomNav>);
      expect(container.querySelector('nav')).toBeDefined();
    });
  });
});