import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from './form';
import { Input } from '../base/input';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../layout/resizable';
import { Menubar, MenubarTrigger, MenubarContent, MenubarItem, MenubarMenu } from '../navigation/menubar';

function WrappedForm() {
  const form = useForm<{ name: string }>({
    defaultValues: { name: '' },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormDescription>Enter your full name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe('Form, Menubar & Resizable', () => {
  describe('Form', () => {
    it('renders field label, control, description and connects ids', () => {
      const { container } = render(<WrappedForm />);
      expect(screen.getByText('Name')).toBeDefined();
      expect(screen.getByText('Enter your full name.')).toBeDefined();
      const input = container.querySelector('input');
      const label = container.querySelector('label');
      expect(input?.getAttribute('id')).toBe(label?.getAttribute('for'));
    });

    it('shows a validation message on error state', () => {
      const { container } = render(<WrappedForm />);
      const label = container.querySelector('label');
      const input = container.querySelector('input');
      const id = label?.getAttribute('for');
      const inputEl = input as HTMLInputElement;
      inputEl.setAttribute('aria-invalid', 'true');
      const messageEl = container.querySelector(`#${id}-form-item-message`);
      expect(messageEl).toBeNull();
    });
  });

  describe('Menubar', () => {
    it('renders a menubar with trigger labels', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New Tab</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
      expect(screen.getByRole('menubar')).toBeDefined();
      expect(screen.getByText('File')).toBeDefined();
    });
  });

  describe('Resizable', () => {
    it('renders panels separated by a handle', () => {
      const { container } = render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>Left</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>Right</ResizablePanel>
        </ResizablePanelGroup>
      );
      expect(screen.getByText('Left')).toBeDefined();
      expect(screen.getByText('Right')).toBeDefined();
      expect(container.querySelector('[data-resize-handle]')).toBeDefined();
    });
  });
});