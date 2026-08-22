import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('formats millions compactly by default', () => {
    expect(formatCurrency(1_020_000)).toBe('$1.02M');
    expect(formatCurrency(1_000_000)).toBe('$1M');
    expect(formatCurrency(1_274_500)).toBe('$1.27M');
  });

  it('formats thousands compactly by default', () => {
    expect(formatCurrency(932_000)).toBe('$932k');
    expect(formatCurrency(78_000)).toBe('$78k');
    expect(formatCurrency(1_000)).toBe('$1k');
  });

  it('formats numbers below 1k as standard numbers', () => {
    expect(formatCurrency(750)).toBe('$750');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('handles negative amounts correctly', () => {
    expect(formatCurrency(-1_500_000)).toBe('-$1.5M');
    expect(formatCurrency(-45_000)).toBe('-$45k');
    expect(formatCurrency(-50)).toBe('-$50');
  });

  it('supports precise non-compact mode', () => {
    expect(formatCurrency(1_274_500, { compact: false })).toBe('$1,274,500');
    expect(formatCurrency(78_000, { compact: false })).toBe('$78,000');
  });

  it('supports custom currency symbol', () => {
    expect(formatCurrency(500_000, { symbol: '€' })).toBe('€500k');
    expect(formatCurrency(1_200_000, { symbol: '£' })).toBe('£1.2M');
  });
});
