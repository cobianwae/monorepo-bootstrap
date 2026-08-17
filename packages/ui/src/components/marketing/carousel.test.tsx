import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './carousel';

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
}

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    IntersectionObserverMock as unknown as typeof IntersectionObserver
  );
});

describe('Carousel', () => {
  it('renders slides inside a carousel region', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByText('Slide 1')).toBeDefined();
    expect(screen.getByText('Slide 2')).toBeDefined();
    expect(screen.getByRole('region').getAttribute('aria-roledescription')).toBe('carousel');
  });

  it('renders previous/next controls', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );

    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDefined();
  });
});