import { defineConfig } from 'vite';

export default defineConfig({
  // Set base to relative pathing so the built site can be deployed to any subdirectory or root folder on GoDaddy.
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        contact: './contact.html',
      },
    },
  },
});
