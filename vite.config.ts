import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { galleryAdmin } from './scripts/gallery-admin-plugin.mjs'

// Tailwind serves only the dev-only gallery curation tool (src/curate). galleryAdmin backs that tool and never ships.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), tailwindcss(), tanstackStart(), viteReact(), galleryAdmin()],
})
