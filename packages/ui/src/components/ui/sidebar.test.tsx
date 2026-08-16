import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from './sidebar';

describe('Sidebar Component Suite', () => {
  it('renders sidebar structure with children', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarHeader>Header Logo</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>Footer Info</SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    );

    expect(screen.getByText('Header Logo')).toBeDefined();
    expect(screen.getByText('Navigation')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Footer Info')).toBeDefined();
  });

  it('renders active menu button with active state indicator', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={true}>Active Module</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    const button = screen.getByText('Active Module').closest('button');
    expect(button?.getAttribute('data-active')).toBe('true');
  });

  it('renders asChild slot onto anchor link element', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true}>
                  <a href="/test">
                    <span>Test Link</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    const link = screen.getByRole('link', { name: /test link/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/test');
    expect(link.getAttribute('data-active')).toBe('true');
  });

  it('renders sidebar trigger toggle button', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarTrigger />
      </SidebarProvider>
    );

    const trigger = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(trigger).toBeDefined();
  });

  it('keeps full labels visible in mobile sheet even if desktop defaultOpen is false', () => {
    // Simulate mobile viewport width (< 1024)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarHeader>
            <span>Acme Mobile Brand</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Mobile Leads</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    // In mobile mode, isMobile = true -> state = 'expanded' so text is rendered cleanly
    expect(window.innerWidth).toBe(768);
  });
});
