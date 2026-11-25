import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './stepper';

describe('Stepper component', () => {
  const sampleSteps = [
    { id: 1, title: 'Step One' },
    { id: 2, title: 'Step Two' },
    { id: 3, title: 'Step Three' },
  ];

  it('renders all step titles', () => {
    render(<Stepper steps={sampleSteps} currentStep={1} />);
    expect(screen.getByText('Step One')).toBeDefined();
    expect(screen.getByText('Step Two')).toBeDefined();
    expect(screen.getByText('Step Three')).toBeDefined();
  });

  it('sets aria-current on active step', () => {
    const { container } = render(<Stepper steps={sampleSteps} currentStep={1} />);
    const activeItem = container.querySelector('[aria-current="step"]');
    expect(activeItem).toBeDefined();
    expect(activeItem?.textContent).toContain('Step Two');
  });

  it('scrolls the local scroller so an off-screen current step becomes visible', () => {
    const steps = [
      { id: 1, title: 'Step One' },
      { id: 2, title: 'Step Two' },
      { id: 3, title: 'Step Three' },
      { id: 4, title: 'Step Four' },
    ];
    const { container } = render(<Stepper steps={steps} currentStep={3} />);
    const nav = container.querySelector('nav') as HTMLElement;
    const current = container.querySelector('[aria-current="step"]') as HTMLElement;

    Object.defineProperty(nav, 'scrollWidth', { configurable: true, value: 700 });
    Object.defineProperty(nav, 'clientWidth', { configurable: true, value: 256 });
    nav.getBoundingClientRect = () =>
      ({ left: 0, right: 256, width: 256 }) as DOMRect;
    current.getBoundingClientRect = () =>
      ({ left: 331, right: 431, width: 100 }) as DOMRect;
    const scrollTo = vi.fn();
    nav.scrollTo = scrollTo;

    // Re-mount effect already ran with zero jsdom rects; dispatch resize to re-check.
    window.dispatchEvent(new Event('resize'));

    expect(scrollTo).toHaveBeenCalledWith({ left: 175, behavior: 'smooth' });
    expect(document.activeElement).not.toBe(current);
  });
});
