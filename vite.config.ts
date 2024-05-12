import path from 'path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default (mode: string) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return defineConfig({
    plugins: [react()],
    envDir: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: true,
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true, // needed for the Docker Container port mapping to work
      strictPort: true,
      port: Number(process.env.VITE_FRONTEND_PORT), // you can replace this port with any port
      proxy: {
        '/api': {
          target: `http://localhost:${Number(process.env.VITE_BACKEND_PORT)}`,
          changeOrigin: true,
        },
      },
    },
  })
}
