import { mount } from 'cypress-lit'

Cypress.Commands.add('mount' as const, mount)

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}
