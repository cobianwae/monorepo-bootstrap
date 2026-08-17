import { describe, it, expect } from 'vitest';
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
});
