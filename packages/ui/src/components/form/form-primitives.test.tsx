import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../base/input';
import { Textarea } from '../base/textarea';
import { Label } from '../base/label';
import { Checkbox } from '../base/checkbox';
import { Switch } from '../base/switch';
import { RadioGroup, RadioGroupItem } from '../base/radio-group';
import { Progress } from '../base/progress';
import { Separator } from '../base/separator';

describe('Form Primitives', () => {
  describe('Input', () => {
    it('renders a text input with placeholder', () => {
      render(<Input placeholder="Search..." aria-label="search" />);
      expect(screen.getByLabelText('search')).toHaveProperty('type', 'text');
    });

    it('applies error styling flag without breaking render', () => {
      const { container } = render(<Input error aria-label="invalid" />);
      expect(container.querySelector('input')).toBeDefined();
    });

    it('renders start and end adornments', () => {
      render(
        <Input
          aria-label="with adornments"
          startAdornment={<span data-testid="start">$</span>}
          endAdornment={<span data-testid="end">%</span>}
        />
      );
      expect(screen.getByTestId('start')).toBeDefined();
      expect(screen.getByTestId('end')).toBeDefined();
    });

    it('forwards change events', () => {
      const onChange = vi.fn();
      render(<Input aria-label="typed" onChange={onChange} />);
      fireEvent.change(screen.getByLabelText('typed'), { target: { value: 'abc' } });
      expect(onChange).toHaveBeenCalled();
      expect((screen.getByLabelText('typed') as HTMLInputElement).value).toBe('abc');
    });
  });

  describe('Textarea', () => {
    it('renders and forwards value', () => {
      render(<Textarea aria-label="notes" defaultValue="hello" />);
      expect((screen.getByLabelText('notes') as HTMLTextAreaElement).value).toBe('hello');
    });
  });

  describe('Label', () => {
    it('renders label text', () => {
      render(<Label htmlFor="field">Full name</Label>);
      expect(screen.getByText('Full name')).toBeDefined();
    });
  });

  describe('Checkbox', () => {
    it('toggles on click', () => {
      render(<Checkbox aria-label="agree" />);
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(checkbox.getAttribute('data-state')).toBe('checked');
    });
  });

  describe('Switch', () => {
    it('toggles state on click', () => {
      render(<Switch aria-label="notifications" />);
      const sw = screen.getByRole('switch');
      fireEvent.click(sw);
      expect(sw.getAttribute('data-state')).toBe('checked');
    });
  });

  describe('RadioGroup', () => {
    it('selects the clicked radio item', () => {
      render(
        <RadioGroup defaultValue="a" aria-label="plan">
          <RadioGroupItem value="a" id="a" />
          <RadioGroupItem value="b" id="b" />
        </RadioGroup>
      );
      const radios = screen.getAllByRole('radio');
      expect(radios[0].getAttribute('data-state')).toBe('checked');
      fireEvent.click(radios[1]);
      expect(radios[1].getAttribute('data-state')).toBe('checked');
      expect(radios[0].getAttribute('data-state')).not.toBe('checked');
    });
  });

  describe('Progress', () => {
    it('renders an indicator for a given value', () => {
      const { container } = render(<Progress value={60} />);
      const indicator = container.querySelector('.bg-primary') as HTMLElement;
      expect(indicator?.style.transform).toBe('translateX(-40%)');
    });
  });

  describe('Separator', () => {
    it('renders horizontal by default and vertical on demand', () => {
      const { container } = render(<Separator />);
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeDefined();

      const { container: vertical } = render(<Separator orientation="vertical" />);
      expect(vertical.querySelector('[data-orientation="vertical"]')).toBeDefined();
    });
  });
});