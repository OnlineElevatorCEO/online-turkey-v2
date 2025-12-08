import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    outDir: 'dist'
=======
  server: {
    allowedHosts: ['online-turkey-frontend-yeni.onrender.com'],
    host: true,
    port: 5173
>>>>>>> 09e361f8021f4596353f8a04b97bdaa6dfbb7717
  }
})
