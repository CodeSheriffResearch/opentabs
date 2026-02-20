import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'app/layout.tsx',
    'app/page.tsx',
    'app/docs/layout.tsx',
    'app/docs/[[...slug]]/page.tsx',
    'app/api/search/route.ts',
    'source.config.ts',
    'mdx-components.tsx',
    'next.config.mjs',
    'postcss.config.mjs',
  ],
  ignoreDependencies: [
    // PostCSS plugin referenced in postcss.config.mjs — Knip cannot trace config-based plugin references
    '@tailwindcss/postcss',
    // Tailwind CSS is consumed via @import "tailwindcss" in CSS files — Knip cannot trace CSS imports
    'tailwindcss',
    // Peer dependency required by ESLint plugins at runtime
    '@typescript-eslint/parser',
    // CSS-only dependency imported via @import in global CSS — Knip cannot trace CSS imports
    'tw-animate-css',
  ],
  ignore: ['.next/**', '.source/**', 'out/**'],
  ignoreExportsUsedInFile: true,
};

export default config;
