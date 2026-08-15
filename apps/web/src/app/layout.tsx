import type { ReactNode } from 'react';

export const metadata = {
  title: 'Web App',
  description: 'Consumer application for design system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
