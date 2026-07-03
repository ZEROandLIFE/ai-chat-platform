import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            proxyRes.headers['Connection'] = 'keep-alive';
            proxyRes.headers['Cache-Control'] = 'no-cache';
            proxyRes.headers['X-Accel-Buffering'] = 'no';
          });
        },
      },
    },
  },
})
