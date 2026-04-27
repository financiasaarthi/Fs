import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // 🟢 PRODUCTION BUILD SETTINGS: Isse code hide aur compress hoga
  build: {
    // 1. Source maps false karne se live site par original code nahi dikhega
    sourcemap: false, 
    
    // 2. Code ko minify (compress) karne ke liye
    minify: 'esbuild', 
    
    // 3. Purana cache clear karne ke liye chunking settings
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Isse files ka naam random ho jayega taaki koi structure na samajh paye
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  }
})