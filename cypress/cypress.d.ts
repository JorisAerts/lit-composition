import type { mount } from 'cypress-ct-lit'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      text(): Cypress.Chainable<string>
    }
  }
}
