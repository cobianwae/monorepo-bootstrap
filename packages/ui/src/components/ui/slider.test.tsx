import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Slider } from './slider';

describe('Slider component', () => {
  it('renders a slider track and one thumb by default', () => {
    const { container } = render(<Slider value={[50]} />);
    expect(container.querySelector('[role="slider"]')).toBeDefined();
  });

  it('renders multiple thumbs for range value', () => {
    const { container } = render(<Slider value={[20, 80]} />);
    expect(container.querySelectorAll('[role="slider"]')).toHaveLength(2);
  });

  it('renders a single thumb when no value given', () => {
    const { container } = render(<Slider />);
    expect(container.querySelectorAll('[role="slider"]')).toHaveLength(1);
  });
});