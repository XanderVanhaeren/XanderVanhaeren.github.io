import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://xandervanhaeren.github.io',
  base: '/',
  trailingSlash: 'ignore',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  integrations: [mdx()],
});
