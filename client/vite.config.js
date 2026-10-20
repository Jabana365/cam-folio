import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // In dev, forward /api calls to the Express server so cookies stay same-origin
  server: { proxy: { '/api': 'http://localhost:3000' } },
})
