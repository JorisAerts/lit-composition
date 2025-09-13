import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'unplugin-dts/vite'
import packageJson from './package.json' with { type: 'json' }

const externalPackages = [
  /^@lit\//,
  ...(['dependencies', 'devDependencies', 'peerDependencies'] as (keyof typeof packageJson)[])
    .map((dep) => packageJson[dep] ?? {})
    .flatMap(Object.keys),
]

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist/build/dist'),
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        context: resolve(__dirname, 'src/context/index.ts'),
      },
      name: 'lit-composition',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      sourceMap: true,
      format: {
        braces: false,
        comments: false,
      },
      compress: {
        passes: 4,
        booleans: true,
      },
    },
    rollupOptions: {
      external: externalPackages,
      output: { compact: true },
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
