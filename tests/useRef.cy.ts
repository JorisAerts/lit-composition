import { html } from 'lit'
import { defineComponent, onConnected } from '../src'
import { computed, useRef } from '../src/useRef'

describe('useRef', () => {
  it('useRef should be reactive', () => {
    defineComponent({
      name: 'test-use-ref-1',
      shadowRoot: false,
      setup() {
        const test = useRef('not-ok')
        onConnected(() => (test.value = 'ok'))
        return () => html`${test.value}`
      },
    })

    cy.mount(html` <test-use-ref-1></test-use-ref-1> `).as('component')
    cy.get('@component').contains('ok').should('exist')
  })

  it('useRef should be reactive (part 2)', () => {
    const buttonId = self.crypto.randomUUID() ?? Math.random().toString(36)
    defineComponent({
      name: 'test-use-ref-2',
      shadowRoot: false,
      setup() {
        const test = useRef(0)
        return () => html`<button id="${buttonId}" @click="${() => test.value++}">${test.value}</button>`
      },
    })

    cy.mount(html` <test-use-ref-2></test-use-ref-2> `).as('component')
    cy.get('@component').find(`#${buttonId}`).as('button')

    Array.from({ length: 10 }, (_, i) => i).forEach((clickCount) => {
      cy.get('@component').contains(`${clickCount}`).should('exist')
      cy.get('@button').click()
    })
  })
})

describe('computed', () => {
  it('computed should be reactive when a Ref changes', () => {
    defineComponent({
      name: 'test-computed-1',
      shadowRoot: false,
      setup() {
        const test = useRef('not-ok')
        const comp = computed(() => `${test.value}-${test.value}`)
        onConnected(() => (test.value = 'ok'))
        return () => html`${comp.value}`
      },
    })

    cy.mount(html` <test-computed-1></test-computed-1> `).as('component')
    cy.get('@component').contains('ok-ok').should('exist')
  })
})
