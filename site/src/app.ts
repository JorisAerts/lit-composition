import { css, html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import './components/navigation/nav'
import { routes } from './router'
import { Router } from '@lit-labs/router'

import cssHelpers from './style/helpers.scss?inline'
import cssPage from './style/page.scss?inline'

defineElement({
  name: 'lc-app',
  styles: [
    unsafeCSS(cssHelpers),
    unsafeCSS(cssPage),
    css`
      :host {
        --nav-bar-height: 80px;
        width: 100%;
      }
      .main {
        margin-top: var(--nav-bar-height);
      }
    `,
  ],
  setup() {
    const router = new Router(this, routes)
    return () =>
      html`<div>
        <app-nav></app-nav>
        <div class="main d-flex" style="max-height: 100%">${router.outlet()}</div>
      </div>`
  },
})
