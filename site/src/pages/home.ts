import { css, html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import '../components/card'
import cssHelpers from '../style/helpers.scss?inline'
import cssPage from '../style/page.scss?inline'

defineElement({
  name: 'lc-home',
  styles: [
    unsafeCSS(cssPage),
    unsafeCSS(cssHelpers),
    css`
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
  setup() {
    return () => html`
      <button class="px-4 py-2">npm i lit-composition</button>
      <button class="px-4 py-2">Get Started</button>
      <div class="d-flex gap-2 pa-4" style="justify-self: center;">
        <lc-card>
          <h2>Documentation</h2>
          <p>Bla bla</p>
        </lc-card>
        <lc-card>
          <h2>Documentation</h2>
        </lc-card>
        <lc-card>
          <h2>Documentation</h2>
        </lc-card>
      </div>
    `
  },
})
