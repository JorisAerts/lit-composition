import { html, LitElement } from 'lit'
import { consume as $consume, createContext, provide as $provide } from '@lit/context'
import { customElement } from 'lit/decorators.js'

import { defineComponent } from '../src/defineComponent'
import { provide } from '../src/context/provide'
import { inject } from '../src/context/inject'

describe('context', () => {
  describe('provide', () => {
    // define a component

    it('defineComponent ≫ LitElement', () => {
      const context = createContext(Symbol('test-context-1'))

      defineComponent({
        name: 'test-provide-1',
        shadowRoot: false,
        setup() {
          provide(context, 'ok')
          return () => html`<test-consume-1></test-consume-1>`
        },
      })

      @customElement('test-consume-1')
      class Test extends LitElement {
        @$consume({ context })
        accessor test

        render() {
          return html`<div>${this.test}</div>`
        }
      }

      cy.mount(html` <test-provide-1></test-provide-1> `).as('component')
      cy.get('@component').find('div').contains('ok').should('exist')
    })

    it('LitElement ≫ defineComponent', () => {
      const context = createContext(Symbol('test-context-2'))

      @customElement('test-provide-2')
      class Test extends LitElement {
        @$provide({ context })
        accessor test = 'ok'

        render() {
          return html`<test-consume-2></test-consume-2>`
        }
      }

      defineComponent({
        name: 'test-consume-2',
        shadowRoot: false,
        setup() {
          const test = inject(context)
          return () => html`<div>${test.value}</div>`
        },
      })

      cy.mount(html` <test-provide-2></test-provide-2> `).as('component')
      cy.get('@component').find('div').contains('ok').should('exist')
    })
  })
})
