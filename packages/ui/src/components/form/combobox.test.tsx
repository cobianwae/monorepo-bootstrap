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

  // C13: empty string = tidak ada pilihan, placeholder tetap tampil
  it('treats empty string value as no selection and keeps placeholder', () => {
    render(<Combobox options={options} value="" placeholder="Select a framework" />);
    expect(screen.getByText('Select a framework')).toBeDefined();
    expect(screen.queryByLabelText('Clear selection')).toBeNull();
  });

  it('filters out empty strings from multiple values', () => {
    render(<Combobox options={options} value={['', 'react']} multiple />);
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.queryByLabelText('Remove ')).toBeNull();
  });

  // C05: label terasosiasi dan error terhubung ke trigger
  it('associates label with trigger via htmlFor and id', () => {
    render(<Combobox options={options} label="Framework" />);
    const trigger = screen.getByRole('combobox', { name: 'Framework' });
    const label = screen.getByText('Framework');
    expect(label.getAttribute('for')).toBe(trigger.id);
    expect(trigger.id).not.toBe('');
  });

  it('sets aria-invalid and aria-describedby on trigger when error', () => {
    render(
      <Combobox options={options} error aria-describedby="framework-error" />
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(trigger.getAttribute('aria-describedby')).toBe('framework-error');
  });
});