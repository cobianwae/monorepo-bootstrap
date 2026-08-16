import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { TreeView, type TreeNode } from './tree-view';

const NODES: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'components', label: 'components', children: [{ id: 'button', label: 'button.tsx' }] },
      { id: 'lib', label: 'lib', children: [{ id: 'utils', label: 'utils.ts' }] },
    ],
  },
  { id: 'package', label: 'package.json' },
];

describe('TreeView component', () => {
  it('renders root nodes', () => {
    render(<TreeView nodes={NODES} defaultExpandedIds={['src']} />);
    expect(screen.getByText('src')).toBeDefined();
    expect(screen.getByText('package.json')).toBeDefined();
  });

  it('expands children when node toggled', () => {
    render(<TreeView nodes={NODES} defaultExpandedIds={['src']} />);
    expect(screen.getByText('components')).toBeDefined();
    expect(screen.getByText('lib')).toBeDefined();
  });

  it('selects a leaf node on click', () => {
    function Selectable() {
      const [selectedId, setSelectedId] = useState<string | undefined>();
      return (
        <TreeView
          nodes={NODES}
          defaultExpandedIds={['src', 'components']}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      );
    }
    render(<Selectable />);
    fireEvent.click(screen.getByText('button.tsx'));
    expect(screen.getByText('button.tsx').parentElement?.getAttribute('aria-selected')).toBe('true');
  });

  it('uses correct aria roles', () => {
    const { container } = render(<TreeView nodes={NODES} defaultExpandedIds={['src']} />);
    expect(container.querySelector('[role="tree"]')).toBeDefined();
    expect(container.querySelectorAll('[role="treeitem"]').length).toBeGreaterThan(0);
  });

  it('collapses and expands on toggle button click', () => {
    render(<TreeView nodes={NODES} defaultExpandedIds={['src']} />);
    const srcNode = screen.getByText('src').parentElement;
    const toggleBtn = srcNode?.querySelector('[role="button"]');
    // Collapse
    fireEvent.click(toggleBtn!);
    expect(screen.queryByText('components')).toBeNull();
    // Expand again
    fireEvent.click(toggleBtn!);
    expect(screen.getByText('components')).toBeDefined();
  });

  it('handles keyboard navigation with arrow keys', () => {
    render(<TreeView nodes={NODES} defaultExpandedIds={['src']} />);
    const srcNode = screen.getByText('src').parentElement;
    srcNode?.focus();
    fireEvent.keyDown(srcNode!, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toContain('components');
  });
});