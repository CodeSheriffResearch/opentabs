declare module 'esbuild-plugin-babel' {
  import type { Plugin } from 'esbuild';

  interface BabelPluginOptions {
    filter?: RegExp;
    namespace?: string;
    config?: Record<string, unknown>;
  }

  export default function babel(options?: BabelPluginOptions): Plugin;
}
