import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const BACKEND = 'https://sistema-finanzas-personales.up.railway.app'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth':         { target: BACKEND, changeOrigin: true },
      '/onboarding':   { target: BACKEND, changeOrigin: true },
      '/transactions': { target: BACKEND, changeOrigin: true },
      '/budgets':      { target: BACKEND, changeOrigin: true },
      '/profile':      { target: BACKEND, changeOrigin: true },
      '/api':          { target: BACKEND, changeOrigin: true },
    }
  }
})
