import { GlobalHeader } from '@/components/global-header';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    /* Suppress the sidebar title — the GlobalHeader owns the logo on all pages. */
    title: () => null,
    component: <GlobalHeader />,
  },
  /* Search is in the GlobalHeader, not the sidebar. */
  searchToggle: {
    enabled: false,
  },
  /* Disable the default theme switch — GlobalHeader renders its own RetroThemeToggle. */
  themeSwitch: {
    enabled: false,
  },
};
