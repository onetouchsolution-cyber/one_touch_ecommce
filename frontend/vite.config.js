import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  // loads local .env (for local dev only)
  const env = loadEnv(mode, process.cwd(), '')

  // ✅ Vercel + Local support
  const target =
    process.env.VITE_API_URL || // from Vercel dashboard
    env.VITE_API_URL ||         // from local .env
    'http://localhost:5000'

  console.log('Proxy target:', target)

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
