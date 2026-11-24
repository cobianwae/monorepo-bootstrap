import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@ds/ui', '@ds/tokens', '@shared/types'],
  experimental: {
    // Dev-compile lambat: tiap page menarik ~4800 modul karena barrel
    // @ds/ui + lucide-react di-compile utuh per route (terukur 70–80 dtk).
    // Ini membatasi import ke subpath yang benar-benar dipakai.
    optimizePackageImports: [
      'lucide-react',
      '@ds/ui',
      '@ds/tokens',
      'date-fns',
      '@tanstack/react-table',
      '@tanstack/react-virtual',
    ],
  },
  async redirects() {
    return [
      {
        source: '/components/forms-core',
        destination: '/components/forms',
        permanent: true,
      },
      {
        source: '/components/forms-advanced',
        destination: '/components/forms',
        permanent: true,
      },
      {
        source: '/components/sidebar',
        destination: '/components/layout-navigation',
        permanent: true,
      },
      {
        source: '/components/layout-nav',
        destination: '/components/layout-navigation',
        permanent: true,
      },
      {
        source: '/components/data-collections',
        destination: '/components/data-display',
        permanent: true,
      },
      {
        source: '/components/carousel',
        destination: '/components/data-display',
        permanent: true,
      },
      {
        source: '/components/primitives',
        destination: '/components/states-feedback',
        permanent: true,
      },
      {
        source: '/patterns/overlays',
        destination: '/components/overlays-menus',
        permanent: true,
      },
      {
        source: '/patterns/advanced-filtering',
        destination: '/patterns/data-table',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
