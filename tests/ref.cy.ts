import { defineComponent, onConnected, ref } from '../src'
import { html } from 'lit'

describe('ref', () => {
  it('ref should be reactive', () => {
    defineComponent({
      name: 'test-el',
      shadowRoot: false,
      setup() {
        const test = ref('not-ok')
        onConnected(() => (test.value = 'ok'))
        return () => html`${test.value}`
      },
    })

    cy.mount(html` <test-el test="not-ok"></test-el> `).as('component')
    cy.get('@component').contains('ok').should('exist')
  })
})
