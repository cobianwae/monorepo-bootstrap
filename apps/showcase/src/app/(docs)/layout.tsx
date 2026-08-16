import { ShowcaseSidebar } from '@/components/showcase-sidebar';
import { ShowcaseHeader } from '@/components/showcase-header';
import { GlobalCommandPalette } from '@/components/global-command-palette';
import { ArtCanvas } from '@/components/art-canvas';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ArtCanvas />
      <div className="flex min-h-screen">
        <ShowcaseSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <ShowcaseHeader />
          <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
      <GlobalCommandPalette />
    </>
  );
}
