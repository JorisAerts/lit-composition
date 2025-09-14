import { defineConfig } from 'cypress'

export default defineConfig({
  fileServerFolder: '.',
  modifyObstructiveCode: false,
  experimentalStudio: true,
  video: true,
  videosFolder: './node_modules/.cypress/videos',
  screenshotsFolder: './node_modules/.cypress/screenshots',
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
    devServer: {
      bundler: 'vite',
      framework: undefined,
      viteConfig: undefined,
    },
    indexHtmlFile: 'cypress/support/component-index.html',
    viewportWidth: 400,
    viewportHeight: 300,
  },
})
