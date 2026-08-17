'use client';

import {
  Home,
  Bell,
  Settings,
  User,
  Users,
  Heart,
  Star,
  ShoppingCart,
  FileText,
  Calendar,
  Clock,
  Mail,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  MoreHorizontal,
  Menu,
  Download,
  Upload,
  Share2,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Layers,
  Zap,
  Sparkles,
  Lock,
  ShieldCheck,
  BookOpen,
  Play,
  Send,
  Globe,
  RefreshCw,
  Columns3,
  List,
  Grid,
  Inbox,
  Folder,
  Image,
  MapPin,
  Link2,
  Search as SearchIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, CodeBlock } from '@ds/ui';
import { Shapes, Sparkles as SparklesIcon } from 'lucide-react';
import { PageHeader } from '@ds/ui';
import type { LucideIcon } from 'lucide-react';

const SIZES = [
  { name: 'sm', cls: 'h-3.5 w-3.5', use: 'Inline text, button icons, compact badges' },
  { name: 'md', cls: 'h-4 w-4', use: 'Default icon size in buttons & menu items' },
  { name: 'lg', cls: 'h-5 w-5', use: 'Section headers, toolbars' },
  { name: 'xl', cls: 'h-6 w-6', use: 'Page-level headers, list-group icons' },
];

const CURATED_ICONS: LucideIcon[] = [
  Home, SearchIcon, Bell, Settings, User, Users, Heart, Star,
  ShoppingCart, FileText, Calendar, Clock, Mail, MessageCircle,
  Plus, Minus, Trash2, Edit, Check, X,
  AlertTriangle, Info, CheckCircle2, ChevronDown,
  ChevronRight, ArrowRight, ArrowUpRight, MoreHorizontal,
  Menu, Download, Upload, Share2, Copy, Eye, EyeOff,
  Filter, Layers, Zap, Sparkles, Lock, ShieldCheck,
  BookOpen, Play, Send, Globe, RefreshCw, Columns3,
  List, Grid, Inbox, Folder, Image, MapPin, Link2,
];

export default function IconographyPage() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Foundations"
        eyebrowIcon={Shapes}
        title="Iconography"
        description={
          <>
            All icons ship from <strong className="font-mono">lucide-react</strong> as inline SVGs —
            stroke-based, consistent 2px weight, inherited <code className="font-mono text-xs">currentColor</code>, and fully screen-reader friendly when paired with <code className="font-mono text-xs">aria-label</code>.
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              54 Curated Icons
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              lucide-react
            </Badge>
          </div>
        }
      />

      {/* Size Scale */}
      <section id="sizes" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Layers className="h-6 w-6 text-highlight" />
            <span>Size Scale</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Four standardized sizes — never scale icons arbitrarily.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SIZES.map((size) => (
            <Card key={size.name} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="h-12 rounded-lg bg-muted/30 border border-border/60 flex items-center justify-center">
                  <Home className={`${size.cls} text-foreground`} />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">{size.name}</p>
                  <p className="font-mono text-muted-foreground">{size.cls}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">{size.use}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Curated Set */}
      <section id="gallery" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-highlight" />
            <span>Curated Icon Set</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            The approved vocabulary for product UIs. Prefer these over ad-hoc imports to keep the system coherent.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
          {CURATED_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-3 flex flex-col items-center justify-center gap-2 hover:border-highlight/50 hover:bg-highlight/5 transition-colors"
            >
              <Icon className="h-4 w-4 text-foreground" />
              <span className="text-[9px] font-mono text-muted-foreground truncate w-full text-center">
                {Icon.displayName ?? `icon-${i}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Usage */}
      <section id="usage" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <FileText className="h-6 w-6 text-highlight" />
            <span>Usage &amp; Accessibility</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Decorative icons hide from screen readers; meaningful icons require an accessible name.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Decorative (aria-hidden)</CardTitle>
              <CardDescription className="text-xs">
                Icon next to text that already describes the action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="tsx"
                code={`<Button>
  <SearchIcon aria-hidden="true" />
  Search
</Button>`}
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Icon-only (aria-label)</CardTitle>
              <CardDescription className="text-xs">
                Standalone icon button needs an accessible name.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="tsx"
                code={`<Button size="icon" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>`}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}