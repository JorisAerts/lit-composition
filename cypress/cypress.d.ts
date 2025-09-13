import type { mount } from 'cypress-lit'

type Mount = typeof mount

declare global {
  namespace Cypress {
    interface Chainable {
      mount: Mount

      text(): Cypress.Chainable<string>
    }
  }
}
