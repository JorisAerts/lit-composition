import { html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import lcLogo from '../../../logo.svg' with { type: 'svg' }
import css from './home.scss?inline'
import cssHelpers from '../style/helpers.scss?inline'

defineElement({
  name: 'lc-home',
  styles: [unsafeCSS(css), unsafeCSS(cssHelpers)],
  setup() {
    return () => html`
      <div class="d-flex gc-4 align-center">
        <img height="75" src="${lcLogo}" alt="Lit composition logo" />
        <h1>Lit composition</h1>
      </div>
    `
  },
})
