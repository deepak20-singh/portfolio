import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Stable hash — React rarely changes; long cache TTL
          'vendor-react': ['react', 'react-dom'],
          // three.js is loaded lazily via AvatarViewer; this just names the chunk
          // so it gets a predictable filename for CDN caching
          'vendor-three': ['three'],
        },
      },
    },
  },
});
