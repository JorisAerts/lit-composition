import { html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import lcLogo from '../../../logo.svg' with { type: 'svg' }
import css from './home.scss?inline'
import cssHelpers from '../style/helpers.scss?inline'

defineElement({
  name: 'lc-home',
  shadowRoot: false,
  styles: [unsafeCSS(css), unsafeCSS(cssHelpers)],
  setup() {
    return () => html`
      <div class="d-flex">
        <img height="100" src="${lcLogo}" alt="Lit composition logo" />
        Lit composition
      </div>
    `
  },
})
