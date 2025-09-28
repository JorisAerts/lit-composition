/// <reference types="cypress" />

Cypress.Commands.add('text', { prevSubject: true }, (element) => {
  return cy.wrap(element).then((el) => el.text().trim())
})
