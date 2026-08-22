import type { Lead } from '../types';

/**
 * Computes total pipeline value across all non-lost opportunities.
 */
export function calculateActivePipeline(leads: Lead[]): number {
  return leads
    .filter((l) => l.stage !== 'lost')
    .reduce((acc, l) => acc + l.dealValue, 0);
}

/**
 * Computes unclosed (open) pipeline value currently in flight.
 */
export function calculateOpenPipeline(leads: Lead[]): number {
  return leads
    .filter((l) => l.stage !== 'lost' && l.stage !== 'won')
    .reduce((acc, l) => acc + l.dealValue, 0);
}
