import { html } from 'lit'
import { defineComponent, onConnected } from '../src/defineComponent'

describe('defineComponent', () => {
  describe('rendering', () => {
    // define a component
    defineComponent({
      name: 'test-defined',

      props: {
        test: { type: String },
        test2: { type: Object as unknown as ReturnType<typeof defineComponent> },
      },

      render() {
        return html`<div>ok</div>`
      },
    })

    it('Component renders correctly (simple)', () => {
      cy.mount(html` <test-defined></test-defined> `).as('component')
      cy.get('@component').find('div').contains('ok').should('exist')
    })

    it('Test light vs shadow DOM', () => {
      defineComponent({
        name: 'test-no-shadow',
        shadowRoot: false,
        props: { test: { type: String } },
        render() {
          return html`<div>ok</div>`
        },
      })

      cy.mount(html` <test-defined></test-defined> `).as('component')
      cy.get('@component').then(($el) => {
        expect($el[0].shadowRoot).not.to.be.null
      })

      cy.mount(html` <test-no-shadow></test-no-shadow> `).as('light-component')
      cy.get('@light-component').then(($el) => {
        expect($el[0].shadowRoot).to.be.null
      })
    })

    it('Component renders default prop values', () => {
      defineComponent({
        name: 'test-default-props',
        props: {
          test: { type: String, default: 'test' },
          test2: { type: Object as unknown as ReturnType<typeof defineComponent>, default: () => 'test2' },
        },
        shadowRoot: false,
        render() {
          return html`<div>${this.test}</div>`
        },
      })

      cy.mount(html` <test-default-props></test-default-props> `).as('component')
      cy.get('@component').find('div').contains('test').should('exist')
    })
  })

  describe('hooks', () => {
    it('onConnected', () => {
      defineComponent({
        name: 'test-on-connected-1',
        props: {
          test: { type: String, default: 'test' },
          test2: { type: Object as unknown as typeof Date, default: () => 'test2' },
        },
        shadowRoot: false,
        setup(me) {
          onConnected(() => (me.test = 'connected'))
          return function () {
            return html`<div>${me.test}</div>`
          }
        },
      })

      cy.mount(html` <test-on-connected-1></test-on-connected-1> `).as('component')
      cy.get('@component').find('div').contains('connected').should('exist')
    })

    it('onConnected with default scope', () => {
      defineComponent({
        name: 'test-on-connected-2',
        props: {
          test: { type: String, default: 'test' },
          test2: { type: Object as unknown as typeof Date, default: () => 'test2' },
        },
        shadowRoot: false,
        setup() {
          onConnected(function () {
            this.test = 'connected'
          })
          return function () {
            return html`<div>${this.test}</div>`
          }
        },
      })

      cy.mount(html` <test-on-connected-2></test-on-connected-2> `).as('component')
      cy.get('@component').find('div').contains('connected').should('exist')
    })

    it('onConnected with setup this-scope', () => {
      defineComponent({
        name: 'test-on-connected-3',
        props: {
          test: { type: String, default: 'test' },
          test2: { type: Object as unknown as typeof Date, default: () => 'test2' },
          test3: { type: Array, default: 'test' },
        },
        shadowRoot: false,
        setup() {
          this.test
          this.test3
          onConnected(() => (this.test = 'connected'))
          return () => {
            return html`<div>${this.test}</div>`
          }
        },
      })

      cy.mount(html` <test-on-connected-3></test-on-connected-3> `).as('component')
      cy.get('@component').find('div').contains('connected').should('exist')
    })
  })
})
