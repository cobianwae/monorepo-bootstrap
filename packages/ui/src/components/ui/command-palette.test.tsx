import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CommandPalette } from './command-palette';

describe('CommandPalette component', () => {
  const groups = [
    {
      heading: 'Navigate',
      items: [
        {
          id: 'go-home',
          label: 'Overview',
          description: 'Home page',
          onSelect: () => undefined,
        },
        {
          id: 'go-settings',
          label: 'Settings',
          description: 'Preferences',
          onSelect: () => undefined,
        },
      ],
    },
  ];

  it('renders the search input when open', () => {
    const { container } = render(<CommandPalette groups={groups} />);
    expect(container.querySelector('[aria-label="Search commands"]')).toBeDefined();
  });

  it('lists all group headings when rendered', () => {
    const { container } = render(<CommandPalette groups={groups} />);
    expect(container.querySelectorAll('h2[aria-hidden="true"]')).toBeDefined();
  });
});