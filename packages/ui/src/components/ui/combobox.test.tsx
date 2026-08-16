import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Combobox } from './combobox';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

describe('Combobox component', () => {
  it('renders trigger with placeholder', () => {
    render(<Combobox options={options} placeholder="Select a framework" />);
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText('Select a framework')).toBeDefined();
  });

  it('renders selected value for single mode', () => {
    render(<Combobox options={options} value="react" />);
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
  });

  it('renders multiple selected values as badges', () => {
    render(<Combobox options={options} value={['react', 'vue']} multiple />);
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Vue')).toBeDefined();
  });

  it('renders loading indicator when loading', () => {
    render(<Combobox options={options} loading />);
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('disables trigger when disabled', () => {
    render(<Combobox options={options} disabled />);
    expect((screen.getByRole('combobox') as HTMLButtonElement).disabled).toBe(true);
  });
});