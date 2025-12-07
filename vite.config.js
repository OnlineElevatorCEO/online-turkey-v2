import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['online-turkey-frontend-yeni.onrender.com'],
    host: true,
    port: 5173
  }
})
