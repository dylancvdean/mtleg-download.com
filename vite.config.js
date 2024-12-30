import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ghPages } from 'vite-plugin-gh-pages';

// Update your repository name
const repoName = 'mtleg-download.com';

export default defineConfig({
  plugins: [react(), ghPages()],
  base: `/`,
});
