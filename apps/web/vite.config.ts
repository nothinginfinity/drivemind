import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves from /drivemind/ — must match repo name exactly
  base: '/drivemind/',

  plugins: [
    react()
  ],

  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
