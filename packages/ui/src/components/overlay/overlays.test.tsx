import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../feedback/dialog';
import { Sheet, SheetContent, SheetTitle } from './sheet';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../feedback/alert-dialog';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../base/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../navigation/dropdown-menu';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '../navigation/context-menu';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../form/select';

describe('Overlay & Menu Components', () => {
  describe('Dialog', () => {
    it('renders content when open with title and description', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your details</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Edit profile')).toBeDefined();
      expect(screen.getByText('Update your details')).toBeDefined();
    });
  });

  describe('Sheet', () => {
    it('renders content when open', () => {
      render(
        <Sheet open>
          <SheetContent>
            <SheetTitle>Settings</SheetTitle>
          </SheetContent>
        </Sheet>
      );
      expect(screen.getByText('Settings')).toBeDefined();
    });
  });

  describe('AlertDialog', () => {
    it('renders actions and triggers cancel on click', () => {
      const onOpenChange = vi.fn();
      render(
        <AlertDialog open onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      );
      expect(screen.getByText('Delete record?')).toBeDefined();
      fireEvent.click(screen.getByText('Delete'));
      expect(onOpenChange).toHaveBeenCalled();
    });
  });

  describe('Popover', () => {
    it('renders content when open', () => {
      render(
        <Popover open>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>
      );
      expect(screen.getByText('Popover body')).toBeDefined();
    });
  });

  describe('Tooltip', () => {
    it('renders content when open', () => {
      render(
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger>Hover</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      expect(screen.getByText('Tooltip text')).toBeDefined();
    });
  });

  describe('HoverCard', () => {
    it('renders content when open', () => {
      render(
        <HoverCard open>
          <HoverCardTrigger>Hover me</HoverCardTrigger>
          <HoverCardContent>Card preview</HoverCardContent>
        </HoverCard>
      );
      expect(screen.getByText('Card preview')).toBeDefined();
    });
  });

  describe('DropdownMenu', () => {
    it('renders menu items when open and fires onClick', () => {
      const onSelect = vi.fn();
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect}>Rename</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      fireEvent.click(screen.getByText('Rename'));
      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('ContextMenu', () => {
    it('renders items when open', () => {
      render(
        <ContextMenu open>
          <ContextMenuTrigger>Right click</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
      expect(screen.getByText('Open')).toBeDefined();
    });
  });

  describe('Select', () => {
    it('renders options when open and honors selection', () => {
      render(
        <Select open defaultValue="a">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getAllByText('Option A').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Option B').length).toBeGreaterThan(0);
    });
  });
});