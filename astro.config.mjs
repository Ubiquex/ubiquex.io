import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://ubiquex.io',
  base: '/',
  integrations: [tailwind()],
});
