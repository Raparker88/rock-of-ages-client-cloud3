import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // This is important for assets to load correctly
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
      ignored: ['!**/node_modules/**']
    }
  }
})
