import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Permitir requests via tunnel (cloudflared, ngrok, localhost.run, etc.)
    allowedHosts: ['localhost', '.trycloudflare.com', '.ngrok-free.app', '.ngrok.io', '.localhost.run'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
