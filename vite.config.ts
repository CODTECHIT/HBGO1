import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Split vendor chunks so browser can cache them separately
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          'motion-vendor': ['motion'],
          'icons': ['lucide-react'],
        }
      }
    },
    // Increase chunk size warning limit slightly
    chunkSizeWarningLimit: 600,
  }
})
