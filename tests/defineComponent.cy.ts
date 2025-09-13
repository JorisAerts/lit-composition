import { css, html, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'
import { defineComponent, onConnected } from '../src/'

describe('defineComponent', () => {
  describe('rendering', () => {
    it('Component renders correctly (simple)', () => {
      // define a component
      defineComponent({
        name: 'test-defined-1',

        props: {
          test: { type: String },
          test2: { type: Object as unknown as ReturnType<typeof defineComponent> },
        },

        render() {
          return html`<div>ok</div>`
        },
      })

      cy.mount(html` <test-defined-1></test-defined-1> `).as('component')
      cy.get('@component').find('div').contains('ok').should('exist')
    })

    it('Component renders correctly (fast notation)', () => {
      // define a component
      defineComponent('test-fast-1', () => html`<div>ok</div>`)

      cy.mount(html` <test-fast-1></test-fast-1> `).as('component')
      cy.get('@component').find('div').contains('ok').should('exist')
      cy.get('@component').then(($el) => expect($el[0].shadowRoot).to.be.null)
    })

    it('Test light vs shadow DOM', () => {
      defineComponent({
        name: 'test-defined-2',

        props: {
          test: { type: String },
          test2: { type: Object as unknown as ReturnType<typeof defineComponent> },
        },

        render() {
          return html`<div>ok</div>`
        },
      })

      defineComponent({
        name: 'test-no-shadow',
        shadowRoot: false,
        props: { test: { type: String } },
        render() {
          return html`<div>ok</div>`
        },
      })

      cy.mount(html` <test-defined-2></test-defined-2> `).as('component')
      cy.get('@component').then(($el) => expect($el[0].shadowRoot).not.to.be.null)

      cy.mount(html` <test-no-shadow></test-no-shadow> `).as('light-component')
      cy.get('@light-component').then(($el) => expect($el[0].shadowRoot).to.be.null)
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

  describe('styles', () => {
    it('styles should be applied correctly on a ShadowRoot', () => {
      defineComponent({
        name: 'test-styles-1',
        styles: css`
          div {
            font-size: 32px;
            font-weight: 900;
            color: rgb(255, 215, 0);
          }
        `,
        setup() {
          return () => html`<div>Gold! 🥇</div>`
        },
      })

      cy.mount(html` <test-styles-1></test-styles-1> `).as('component')
      cy.get('@component')
        .shadow()
        .find('div')
        .contains('Gold! 🥇')
        .should('have.css', 'color', 'rgb(255, 215, 0)')
        .and('have.css', 'font-weight', '900')
        .and('have.css', 'font-size', '32px')
    })

    it('styles should not be applied when no ShadowRoot', () => {
      defineComponent({
        name: 'test-styles-2',
        styles: css`
          div {
            font-size: 32px;
            font-weight: 900;
            color: rgb(255, 215, 0);
          }
        `,
        shadowRoot: false,
        setup() {
          return () => html`<div>Gold! 🥇</div>`
        },
      })

      cy.mount(html` <test-styles-2></test-styles-2> `).as('component')
      cy.get('@component')
        //
        .find('div')
        .contains('Gold! 🥇')
        .should('not.have.css', 'font-size', '32px')
    })

    it('styles array should render as expected', () => {
      defineComponent({
        name: 'test-styles-3',
        styles: [
          css`
            div {
              color: rgb(255, 215, 0);
            }
          `,
          css`
            div {
              font-size: 32px;
              font-weight: 900;
            }
          `,
        ],
        setup() {
          return () => html`<div>Gold! 🥇</div>`
        },
      })

      cy.mount(html` <test-styles-3></test-styles-3> `).as('component')
      cy.get('@component')
        .shadow()
        .find('div')
        .contains('Gold! 🥇')
        .should('have.css', 'color', 'rgb(255, 215, 0)')
        .and('have.css', 'font-weight', '900')
        .and('have.css', 'font-size', '32px')
    })

    it('using injected variables should work', () => {
      const color = 'rgb(255, 215, 0)'
      defineComponent({
        name: 'test-styles-injected-variables',
        styles: css`
          div {
            color: ${unsafeCSS(color)};
            font-size: 32px;
            font-weight: 900;
          }
        `,
        setup() {
          return () => html`<div>Gold! 🥇</div>`
        },
      })

      cy.mount(html` <test-styles-injected-variables></test-styles-injected-variables> `).as('component')
      cy.get('@component')
        .shadow()
        .find('div')
        .contains('Gold! 🥇')
        .should('have.css', 'color', 'rgb(255, 215, 0)')
        .and('have.css', 'font-weight', '900')
        .and('have.css', 'font-size', '32px')
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

  describe('inheritance', () => {
    it('super-hooks are called from DefinedComponent ⇢ LitComponent', () => {
      let connected = false
      const Defined = defineComponent({
        props: {
          test: { type: String },
          test2: { type: Object as unknown as typeof Date, default: () => 'test2' },
        },
        shadowRoot: false,
        setup(me) {
          connected = true
          onConnected(() => {
            connected = true
          })
          return function () {
            return html`<div>Superclass</div>`
          }
        },
      })

      @customElement('test-inheritance-1')
      class TestClass extends Defined {
        connectedCallback() {
          super.connectedCallback()
        }
      }

      cy.mount(html` <test-inheritance-1></test-inheritance-1> `).as('component')
      cy.get('@component').find('div').contains('Superclass').should('exist')
      cy.wrap(null).should(() => {
        assert.equal(connected, true)
      })
    })
  })
})
