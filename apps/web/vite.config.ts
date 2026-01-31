import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const isVercel = process.env.VERCEL === '1'

const config = defineConfig({
  resolve: {
    alias: {
      '@convex': resolve(__dirname, './convex'),
    },
  },
  plugins: [
    devtools(),
    nitro({
      preset: isVercel ? 'vercel' : 'node-server',
      compatibilityDate: 'latest',
      scanDirs: ['server'],
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
