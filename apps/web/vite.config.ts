import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

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
