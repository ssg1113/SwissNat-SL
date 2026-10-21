import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the server on local network (e.g. http://192.168.8.111:5173) for mobile devices
    port: 5173,
  },
})
