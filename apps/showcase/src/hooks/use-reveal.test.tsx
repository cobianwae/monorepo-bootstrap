/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useReveal } from './use-reveal';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly callback: IntersectionObserverCallback;
  readonly options?: IntersectionObserverInit;
  readonly targets: Element[] = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.push(target);
  }

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }

  trigger(target: Element, ratio: number) {
    this.callback(
      [{ target, isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

function RevealProbe({ threshold, delay }: { threshold?: number; delay?: number }) {
  const { ref, inView, style } = useReveal<HTMLDivElement>({ threshold, delay });

  return (
    <div ref={ref} data-testid="probe" data-visible={inView} style={style}>
      {inView ? 'terlihat' : 'tersembunyi'}
    </div>
  );
}

const originalInnerHeight = window.innerHeight;

function setViewportHeight(height: number) {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
}

function mockTargetHeight(height: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    height,
    width: 390,
    top: 0,
    left: 0,
    bottom: height,
    right: 390,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  setViewportHeight(844);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  setViewportHeight(originalInnerHeight);
});

describe('useReveal (CR-062)', () => {
  it('memakai threshold 0 saat target lebih tinggi dari viewport', () => {
    mockTargetHeight(9689);

    render(<RevealProbe />);

    const observer = MockIntersectionObserver.instances[0];
    expect(observer?.options?.threshold).toBe(0);

    act(() => observer.trigger(observer.targets[0]!, 0.08298));

    expect(screen.getByTestId('probe').getAttribute('data-visible')).toBe('true');
  });

  it('mempertahankan threshold 0,15 untuk target yang muat di viewport', () => {
    mockTargetHeight(300);

    render(<RevealProbe />);

    expect(MockIntersectionObserver.instances[0]?.options?.threshold).toBe(0.15);
  });

  it('langsung terlihat bila IntersectionObserver tidak tersedia', () => {
    Reflect.deleteProperty(window, 'IntersectionObserver');

    render(<RevealProbe />);

    expect(window).not.toHaveProperty('IntersectionObserver');
    expect(screen.getByTestId('probe').getAttribute('data-visible')).toBe('true');
  });

  it('menerapkan delay sebagai transitionDelay', () => {
    mockTargetHeight(300);

    render(<RevealProbe delay={100} />);

    expect(screen.getByTestId('probe').style.transitionDelay).toBe('100ms');
  });

  it('menjaga konten terlihat saat reduced motion lewat kelas CSS Reveal', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/reveal.tsx'), 'utf8');

    expect(source).toContain('motion-reduce:transition-none');
    expect(source).toContain('motion-reduce:translate-y-0');
    expect(source).toContain('motion-reduce:opacity-100');
  });
});
