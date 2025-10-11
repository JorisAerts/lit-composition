import { html } from 'lit'
import { defineElement } from '../../src/signals'
import { computed, signal } from '@lit-labs/signals'

describe('signals integration', () => {
  describe('local signal (per instance)', () => {
    it('rerenders when a local signal changes', () => {
      defineElement({
        name: 'signals-local-counter',
        setup() {
          const count = signal(0)
          return () => html`<button @click=${() => count.set(count.get() + 1)}>Count: ${count.get()}</button>`
        },
      })

      cy.mount(html` <signals-local-counter></signals-local-counter> `).as('component')
      cy.get('@component').find('button').contains('Count: 0').should('exist')
      cy.get('@component').find('button').click()
      cy.get('@component').find('button').contains('Count: 1').should('exist')
      cy.get('@component').find('button').click()
      cy.get('@component').find('button').click()
      cy.get('@component').find('button').contains('Count: 3').should('exist')
    })
  })

  describe('shared module-scope signals', () => {
    it('multiple elements react to the same shared signal and a computed', () => {
      // shared store
      const sharedCount = signal(0)
      const doubled = computed(() => sharedCount.get() * 2)

      defineElement({
        name: 'signals-shared-a',
        setup() {
          return () =>
            html`<button class="a" @click=${() => sharedCount.set(sharedCount.get() + 1)}>
              A: ${sharedCount.get()} → ${doubled.get()}
            </button>`
        },
      })

      defineElement({
        name: 'signals-shared-b',
        shadowRoot: false,
        setup() {
          return () =>
            html`<button class="b" @click=${() => sharedCount.set(sharedCount.get() + 1)}>
              B: ${sharedCount.get()} → ${doubled.get()}
            </button>`
        },
      })

      cy.mount(html`
        <div>
          <signals-shared-a></signals-shared-a>
          <signals-shared-b></signals-shared-b>
        </div>
      `).as('root')

      // Initial values
      cy.get('@root').find('button.a').as('buttonA')
      cy.get('@root').find('button.b').as('buttonB')

      cy.get('@buttonA').contains('A: 0 → 0').should('exist')
      cy.get('@buttonB').contains('B: 0 → 0').should('exist')

      // Click A to increment
      cy.get('@buttonA').click()
      cy.get('@buttonA').contains('A: 1 → 2').should('exist')
      cy.get('@buttonB').contains('B: 1 → 2').should('exist')

      // Click again
      cy.get('@buttonB').click()
      cy.get('@buttonA').contains('A: 2 → 4').should('exist')
      cy.get('@buttonB').contains('B: 2 → 4').should('exist')

      // Click A to increment
      cy.get('@buttonA').click()
      cy.get('@buttonA').contains('A: 3 → 6').should('exist')
      cy.get('@buttonB').contains('B: 3 → 6').should('exist')
    })
  })

  describe('ensure only SignalWatcher wrapping and light DOM works', () => {
    it('works with shadowRoot: false and still updates on signal change', () => {
      const value = signal('start')

      defineElement({
        name: 'signals-light',
        shadowRoot: false,
        setup() {
          return () => html`<div class="val">${value.get()}</div>`
        },
      })

      cy.mount(html` <signals-light></signals-light> `).as('component')
      cy.get('@component').find('div.val').contains('start').should('exist')

      cy.get('@component').then(() => value.set('next'))
      cy.get('@component').find('div.val').contains('next').should('exist')

      cy.get('@component').then(() => value.set('final'))
      cy.get('@component').find('div.val').contains('final').should('exist')
    })
  })
})
