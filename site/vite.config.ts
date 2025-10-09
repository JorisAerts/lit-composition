import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'

function ghPages404Plugin() {
  let outDir = 'dist'
  return {
    name: 'gh-pages-404',
    apply: 'build',
    configResolved(resolved: { build: { outDir: string } }) {
      outDir = resolved.build.outDir
    },
    async closeBundle() {
      try {
        const indexPath = resolve(outDir, 'index.html')
        const notFoundPath = resolve(outDir, '404.html')
        await fs.cp(indexPath, notFoundPath, { force: true })

        console.log(`[gh-pages-404] Created ${notFoundPath}`)
      } catch (err) {
        console.warn('[gh-pages-404] Failed to create 404.html:', err)
      }
    },
  } as PluginOption
}

export default defineConfig({
  base: '/lit-composition/',
  plugins: [ghPages404Plugin()],
})
