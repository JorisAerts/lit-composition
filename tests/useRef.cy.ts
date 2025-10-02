import { html } from 'lit'
import { computed, defineElement, onConnected, useRef } from '../src'

describe('useRef', () => {
  it('useRef should be reactive', () => {
    defineElement({
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
    const buttonId = globalThis.crypto.randomUUID() ?? Math.random().toString(36)
    defineElement({
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

  it('shared refs among web components', () => {
    //
    const test = useRef(0)
    defineElement(
      'test-shared-ref-1a',
      () => html`<button id="button1" @click="${() => test.value++}">${test.value}</button>`
    )
    defineElement(
      'test-shared-ref-1b',
      () => html`<button id="button2" @click="${() => test.value++}">${test.value}</button>`
    )

    cy.mount(
      html`<div>
        <test-shared-ref-1a></test-shared-ref-1a>
        <test-shared-ref-1b></test-shared-ref-1b>
      </div>`
    ).as('component')

    cy.get('@component').find(`#button1`).as('button1')
    cy.get('@component').find(`#button2`).as('button2')

    cy.get('@button1').contains(`0`).should('exist')
    cy.get('@button2').contains(`0`).should('exist')

    cy.get('@button1').click()
    cy.get('@button1').contains(`1`).should('exist')
    cy.get('@button2').contains(`1`).should('exist')

    cy.get('@button2').click()
    cy.get('@button1').contains(`2`).should('exist')
    cy.get('@button2').contains(`2`).should('exist')
  })
})

describe('computed', () => {
  it('computed should be reactive when a Ref changes', () => {
    defineElement({
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

  it('computed chaining', () => {
    defineElement({
      name: 'test-computed-2',
      shadowRoot: false,
      setup() {
        const test = useRef(1)
        const comp = computed(() => test.value * 2)
        const comp2 = computed(() => comp.value * 4)
        return () => html`result: ${comp2.value}`
      },
    })

    cy.mount(html` <test-computed-2></test-computed-2> `).as('component')
    cy.get('@component').contains('result: 8').should('exist')
  })

  it('computed chaining updates', () => {
    defineElement({
      name: 'test-computed-3',
      shadowRoot: false,
      setup() {
        const test = useRef(1)
        const comp = computed(() => test.value * 2)
        const comp2 = computed(() => comp.value * 4)
        return () =>
          html`<span>${comp2.value}</span>
            <button @click="${() => test.value++}">Increase</button> `
      },
    })

    cy.mount(html` <test-computed-3></test-computed-3> `).as('component')
    cy.get('@component').find('span').as('result')
    cy.get('@component').find('button').as('button')

    cy.get('@result').should('contain', '8')

    cy.get('@button').click()
    cy.get('@result').should('contain', '16')

    cy.get('@button').click()
    cy.get('@result').should('contain', '24')
  })
})
