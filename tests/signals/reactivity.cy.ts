import { html } from 'lit'
import { defineElement } from '../../src'
import { signal } from '@lit-labs/signals'

describe('reactivity', () => {
  it('reactive properties', () => {
    defineElement({
      name: 'reactivity-1',
      setup() {
        const count = signal(0)
        return () => html`<button @click=${() => count.set(count.get() + 1)}>Count: ${count.get()}</button>`
      },
    })

    // things shouldn't get updated
    cy.mount(html` <signals-local-counter></signals-local-counter> `).as('component')
    cy.get('@component').find('button').contains('Count: 0').should('exist')
    cy.get('@component').find('button').click()
    cy.get('@component').find('button').contains('Count: 0').should('exist')
    cy.get('@component').find('button').click()
    cy.get('@component').find('button').click()
    cy.get('@component').find('button').contains('Count: 0').should('exist')
  })
})
