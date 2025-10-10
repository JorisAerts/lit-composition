import { html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import '../components/card'
import cssHelpers from '../style/helpers.scss?inline'
import cssPage from '../style/page.scss?inline'
import cssHome from './home.scss?inline'

import logoSvg from '../../../logo.svg' with { type: 'svg' }

defineElement({
  name: 'lc-home',
  styles: [unsafeCSS(cssPage), unsafeCSS(cssHelpers), unsafeCSS(cssHome)],
  setup() {
    return () => html`
      <div class="d-flex" style="height: 400px; justify-items: center">
        <div style="flex: 1 1 0;">
          <h1>Lit-composition</h1>
        </div>
        <div class="logo-container" style="margin-right: 200px; align-self: center">
          <div class="logo-bg"></div>
          <img src="${logoSvg}" />
        </div>
      </div>
      <div class="d-flex gap-4 pa-4 justify-center cards-row mx-auto" style="width: 50%; position: relative">
        <lc-card>
          <h2>Install</h2>
          <button class="px-4 py-2">npm i lit-composition</button>
          <button class="px-4 py-2">Get Started</button>
        </lc-card>
        <lc-card>
          <h2>Documentation</h2>
          <p>Get Started!</p>
        </lc-card>
      </div>
    `
  },
})
