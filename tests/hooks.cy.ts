import { defineComponent, onConnected } from '../src'
import { html } from 'lit'

describe('hooks', () => {
  it('onConnected', () => {
    defineComponent({
      name: 'test-el',
      props: { test: { type: String } },
      shadowRoot: false,
      setup() {
        onConnected(() => (this.test = 'ok'))
        return () => html`${this.test}`
      },
    })

    cy.mount(html` <test-el test="not-ok"></test-el> `).as('component')
    cy.get('@component').contains('ok').should('exist')
  })
})
