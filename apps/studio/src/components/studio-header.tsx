import Link from 'next/link';

export function StudioHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/channels" className="text-sm font-semibold">
          Video Factory Studio
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/channels" className="hover:text-foreground">
            Channels
          </Link>
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
        </nav>
      </div>
    </header>
  );
}
