import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/nested-css-to-flat/',
  build: {
    outDir: '../docs'
  },
  plugins: [vue()]
})
