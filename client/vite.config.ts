import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Forced restart for Tailwind setup
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
