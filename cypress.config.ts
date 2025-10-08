import { defineConfig } from 'cypress'

export default defineConfig({
  fileServerFolder: '.',
  modifyObstructiveCode: false,
  video: true,
  videosFolder: './node_modules/.cypress/videos',
  screenshotsFolder: './node_modules/.cypress/screenshots',
  downloadsFolder: './node_modules/.cypress/downloads',
  viewportHeight: 550,
  viewportWidth: 750,
  chromeWebSecurity: false,
  experimentalWebKitSupport: true,
  retries: {
    runMode: 4,
    openMode: 0,
  },
  includeShadowDom: true,
  component: {
    supportFile: 'cypress/support/component.ts',
    specPattern: './**/*.cy.ts',
    excludeSpecPattern: ['**/node_modules/**', '**/dist/**', './e2e/*.cy.ts'],
    devServer: {
      bundler: 'vite',
      framework: 'cypress-ct-lit' as never,
      viteConfig: undefined,
    },
    indexHtmlFile: 'cypress/support/component-index.html',
    viewportWidth: 400,
    viewportHeight: 300,
  },
  e2e: {
    supportFile: 'cypress/support/component.ts',
    specPattern: './tests/e2e/**/*.cy.ts',
  },
})
