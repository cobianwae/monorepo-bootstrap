import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkles, Home, Layers, Settings } from 'lucide-react';
import {
  MegaMenu,
  MegaMenuGrid,
  MegaMenuGroup,
  MegaMenuGroupLabel,
  MegaMenuItem,
  MegaMenuFeaturedCard,
} from './mega-menu';
import {
  NavigationMenu,
  NavigationMenuList,
} from './navigation-menu';
import {
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarLink,
  NavbarActions,
} from './navbar';
import {
  Footer,
  FooterGrid,
  FooterColumn,
  FooterLink,
  FooterBottom,
} from './footer';
import { BottomNav, BottomNavItem } from './bottom-nav';
import { TableOfContents } from './toc';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from './menubar';

describe('Navigation Primitives', () => {
  describe('MegaMenu components', () => {
    it('renders mega menu grid, items, and featured card', () => {
      render(
        <MegaMenuGrid columns={3}>
          <MegaMenuGroup>
            <MegaMenuGroupLabel>Solutions</MegaMenuGroupLabel>
            <MegaMenuItem
              icon={Sparkles}
              title="AI CRM Suite"
              description="Enterprise intelligence"
              badge="v2"
            />
          </MegaMenuGroup>
          <MegaMenuFeaturedCard
            title="Spring Release"
            description="Explore our new features"
            href="/release"
            ctaText="Read Changelog"
          />
        </MegaMenuGrid>
      );

      expect(screen.getByText('Solutions')).toBeDefined();
      expect(screen.getByText('AI CRM Suite')).toBeDefined();
      expect(screen.getByText('Enterprise intelligence')).toBeDefined();
      expect(screen.getByText('v2')).toBeDefined();
      expect(screen.getByText('Spring Release')).toBeDefined();
      expect(screen.getByText('Read Changelog')).toBeDefined();
    });

    it('renders composite MegaMenu inside NavigationMenu', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <MegaMenu label="Products" columns={2}>
              <MegaMenuGroup>
                <MegaMenuGroupLabel>Tools</MegaMenuGroupLabel>
                <MegaMenuItem
                  icon={Sparkles}
                  title="Analytics"
                  description="Realtime metrics"
                />
              </MegaMenuGroup>
            </MegaMenu>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByText('Products')).toBeDefined();
    });
  });

  describe('Navbar', () => {
    it('renders navbar with brand, nav links, and actions', () => {
      render(
        <Navbar variant="default">
          <NavbarBrand href="/">Design System</NavbarBrand>
          <NavbarNav>
            <NavbarLink href="/components" active>
              Components
            </NavbarLink>
            <NavbarLink href="/foundations">Foundations</NavbarLink>
          </NavbarNav>
          <NavbarActions>
            <button>Get Started</button>
          </NavbarActions>
        </Navbar>
      );

      expect(screen.getByText('Design System')).toBeDefined();
      expect(screen.getByText('Components')).toBeDefined();
      expect(screen.getByText('Foundations')).toBeDefined();
      expect(screen.getByText('Get Started')).toBeDefined();
    });
  });

  describe('Footer', () => {
    it('renders footer grid with columns and links', () => {
      render(
        <Footer variant="muted">
          <FooterGrid columns={2}>
            <FooterColumn title="Product">
              <FooterLink href="/overview">Overview</FooterLink>
              <FooterLink href="/docs" external badge="API">
                Documentation
              </FooterLink>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom>
            <span>© 2026 Design System</span>
          </FooterBottom>
        </Footer>
      );

      expect(screen.getByText('Product')).toBeDefined();
      expect(screen.getByText('Overview')).toBeDefined();
      expect(screen.getByText('Documentation')).toBeDefined();
      expect(screen.getByText('API')).toBeDefined();
      expect(screen.getByText('© 2026 Design System')).toBeDefined();
    });
  });

  describe('BottomNav', () => {
    it('renders mobile bottom navigation with items and badges', () => {
      render(
        <BottomNav variant="default">
          <BottomNavItem icon={Home} label="Home" active />
          <BottomNavItem icon={Layers} label="Workspace" badge={3} />
          <BottomNavItem icon={Settings} label="Settings" />
        </BottomNav>
      );

      expect(screen.getByText('Home')).toBeDefined();
      expect(screen.getByText('Workspace')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();
      expect(screen.getByText('Settings')).toBeDefined();
    });
  });

  describe('TableOfContents', () => {
    it('renders table of contents list with headings', () => {
      const headings = [
        { id: 'installation', text: 'Installation Guide', level: 2 },
        { id: 'usage', text: 'Usage Guidelines', level: 2 },
        { id: 'props', text: 'Component Props', level: 3 },
      ];

      render(<TableOfContents headings={headings} activeId="usage" />);

      expect(screen.getByText('On This Page')).toBeDefined();
      expect(screen.getByText('Installation Guide')).toBeDefined();
      expect(screen.getByText('Usage Guidelines')).toBeDefined();
      expect(screen.getByText('Component Props')).toBeDefined();
    });
  });

  describe('Menubar', () => {
    it('renders menubar triggers', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      );

      expect(screen.getByText('File')).toBeDefined();
      expect(screen.getByText('Edit')).toBeDefined();
      expect(screen.getByText('View')).toBeDefined();
    });
  });
});
