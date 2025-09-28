import { html } from 'lit'
import {
  defineElement,
  onConnected,
  onDisconnected,
  onFirstUpdated,
  onPerformUpdate,
  onShouldUpdate,
  onUpdate,
  onUpdated,
  onWillUpdate,
  useRef,
} from '../src'

describe('test if onConnected is fired and able to change the element', () => {
  const addHooks = (hooks: string[], shouldUpdate = false) => {
    onConnected(() => hooks.push('onConnected'))
    onUpdated(() => hooks.push('onUpdated'))
    onUpdate(() => hooks.push('onUpdate'))
    onFirstUpdated(() => hooks.push('onFirstUpdated'))
    onWillUpdate(() => hooks.push('onWillUpdate'))
    onShouldUpdate(() => hooks.push('onShouldUpdate') && shouldUpdate)
    onPerformUpdate(() => hooks.push('onPerformUpdate'))
    onDisconnected(() => hooks.push('onDisconnected'))
  }

  it('onConnected', () => {
    defineElement({
      name: 'test-hooks-1',
      props: { test: { type: String } },
      shadowRoot: false,
      setup() {
        onConnected(() => (this.test = '🐥'))
        return () => html`${this.test}`
      },
    })

    cy.mount(html` <test-hooks-1 test="not-ok"></test-hooks-1> `).as('component')
    cy.get('@component').contains('🐥').should('exist')
  })

  it('hooks should be called correctly', () => {
    const hooks: string[] = []
    defineElement({
      name: 'test-hooks-2',
      shadowRoot: false,
      setup() {
        addHooks(hooks)
        return () => html`${'🐹'}`
      },
    })

    cy.mount(html` <test-hooks-2></test-hooks-2> `).as('component')
    cy.get('@component').contains('🐹').should('exist')

    cy.get('@component').then(() => {
      expect(hooks).to.deep.equal([
        //
        'onConnected',
        'onWillUpdate',
        'onFirstUpdated',
        'onUpdated',
        'onPerformUpdate',
      ])
    })
  })

  it('hooks should be called correctly, after update', () => {
    const hooks: string[] = []
    defineElement({
      name: 'test-hooks-3',
      shadowRoot: false,
      setup() {
        addHooks(hooks)
        const test = useRef(1)
        return () => html`<button @click="${() => test.value++}">${test.value}</button>`
      },
    })

    cy.mount(html`<div><test-hooks-3></test-hooks-3></div>`).as('component')
    cy.get('@component').find('button').as('button')

    cy.get('@component').contains('1').should('exist')
    cy.get('@component').then(() => {
      expect(hooks).to.deep.equal(['onConnected', 'onWillUpdate', 'onFirstUpdated', 'onUpdated', 'onPerformUpdate'])
      hooks.length = 0
    })

    cy.get('@button').click()
    cy.get('@component').contains('2').should('exist')
    cy.get('@component').then(() => {
      expect(hooks).to.deep.equal(['onWillUpdate', 'onUpdated', 'onPerformUpdate'])
      hooks.length = 0
    })

    cy.get('@component').then(($el) => {
      $el[0].remove()
      expect(hooks).to.deep.equal(['onDisconnected'])
      hooks.length = 0
    })
  })
})
