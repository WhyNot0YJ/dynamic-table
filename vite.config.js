import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/dynamic-table/',
  build: {
    outDir: 'docs'            // ← 直接输出到 docs 目录
  },
  plugins: [vue()]
}) 