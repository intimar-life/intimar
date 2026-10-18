import type { StorybookConfig } from '@storybook/vue3-vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/vue3-vite',
  async viteFinal(viteConfig) {
    // @storybook/vue3-vite doesn't bundle the actual .vue SFC compiler plugin —
    // it expects the project's own root vite.config to provide it. This project's
    // Vite config lives inside astro.config.mjs instead, so it's added here.
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(vue(), tailwindcss());
    // Astro exposes client env vars prefixed with PUBLIC_ (not Vite's own
    // VITE_ default) by setting this same option in its own Vite config.
    // Storybook runs plain Vite, so without it PUBLIC_PRIMEVUE_LICENSE_KEY
    // (src/vue-app.ts) is stripped from import.meta.env here.
    viteConfig.envPrefix = 'PUBLIC_';
    return viteConfig;
  },
};
export default config;
