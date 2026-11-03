import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// Khi deploy lên GitHub Pages (project page) app nằm ở /<tên-repo>/,
// workflow sẽ truyền VITE_BASE_PATH; chạy local thì vẫn là '/'.
const base = process.env.VITE_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
