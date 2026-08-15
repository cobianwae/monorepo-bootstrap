import { describe, it, expect } from 'vitest';
import { reducer } from './use-toast';

describe('Toast reducer engine', () => {
  it('adds toast to state', () => {
    const initialState = { toasts: [] };
    const state = reducer(initialState, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'Hello Toast' },
    });
    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].title).toBe('Hello Toast');
  });

  it('dismisses toast properly', () => {
    const stateWithToast = { toasts: [{ id: '1', title: 'Hello Toast', open: true }] };
    const dismissed = reducer(stateWithToast, {
      type: 'DISMISS_TOAST',
      toastId: '1',
    });
    expect(dismissed.toasts[0].open).toBe(false);
  });
});
