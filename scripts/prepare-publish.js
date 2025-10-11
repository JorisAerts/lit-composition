import { dirname, resolve } from 'path'
import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises'

const PACKAGE_JSON_REMOVE = ['scripts', 'dependencies', 'devDependencies', 'packageManager', 'private', 'files']

const __dirname = dirname(import.meta.filename)
const rootDir = resolve(__dirname, '../')
const distDir = resolve(rootDir, './dist')
const buildDir = resolve(distDir, './build')

const removeDistFolder = async () => {
  await rm(buildDir, { recursive: true, force: true })
}

const createDistFolder = async () => {
  await mkdir(buildDir, { recursive: true })
}

const writePackageJson = async () => {
  const packageJsonSource = resolve(__dirname, '../', 'package.json')
  const jsonRaw = await readFile(packageJsonSource)
  const packageJson = JSON.parse(jsonRaw)

  PACKAGE_JSON_REMOVE.forEach((key) => delete packageJson[key])

  packageJson.main = 'dist/index.cjs'
  packageJson.module = 'dist/index.js'
  packageJson.types = 'dist/index.d.ts'

  packageJson.exports = {
    '.': {
      import: './dist/index.js',
      require: './dist/index.cjs',
      types: './dist/index.d.ts',
    },
    './context': {
      import: './dist/context.js',
      require: './dist/context.cjs',
      types: './dist/context.d.ts',
    },
    './signals': {
      import: './dist/signals.js',
      require: './dist/signals.cjs',
      types: './dist/signals.d.ts',
    },
  }

  packageJson.sideEffects = false

  const publishedPackageJson = resolve(buildDir, 'package.json')
  await writeFile(publishedPackageJson, JSON.stringify(packageJson, null, 2))
}

const copyFiles = async () => {
  await cp(resolve(rootDir, './README.md'), resolve(buildDir, './README.md'), { recursive: true })
  await cp(resolve(rootDir, './LICENSE'), resolve(buildDir, './LICENSE'), { recursive: true })
}

Promise.resolve() //
  .then(removeDistFolder)
  .then(createDistFolder)
  .then(copyFiles)
  .then(writePackageJson)
