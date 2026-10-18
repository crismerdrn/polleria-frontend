import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // El visor 3D (three.js) se carga de forma diferida en su propio chunk.
    chunkSizeWarningLimit: 1200,
  },
})
