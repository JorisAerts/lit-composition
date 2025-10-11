import { css, html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import './components/navigation/nav'
import { routes } from './router'
import { Router } from '@lit-labs/router'
import cssTheme from './style/theme.scss?inline'
import cssPage from './style/page.scss?inline'

import './components/layout'

defineElement({
  name: 'lc-app',
  styles: [
    unsafeCSS(cssPage),
    unsafeCSS(cssTheme),
    css`
      :host {
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
        <lc-layout>
          <div class="main d-flex" style="max-height: 100%">${router.outlet()}</div>
        </lc-layout>
      </div>`
  },
})
