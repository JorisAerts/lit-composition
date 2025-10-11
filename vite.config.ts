import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'unplugin-dts/vite'
import packageJson from './package.json' with { type: 'json' }

const externalPackages = [
  /^@lit\//,
  /^lit\/?.*/,
  ...(['dependencies', 'devDependencies', 'peerDependencies'] as (keyof typeof packageJson)[])
    .map((dep) => packageJson[dep] ?? {})
    .flatMap(Object.keys)
    .map((dep) => new RegExp(`^${dep}\\/?.*`)),
]

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist/build/dist'),
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        context: resolve(__dirname, 'src/context/index.ts'),
        signals: resolve(__dirname, 'src/signals/index.ts'),
      },
      name: 'lit-composition',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: externalPackages,
      output: {
        compact: true,
        indent: false,
      },
    },
  },
  plugins: [
    dts({
      bundleTypes: true,
      exclude: ['tests/**', 'cypress/**', 'vite.config.ts'],
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
})
