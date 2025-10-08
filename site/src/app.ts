import { html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import './components/navigation/nav'
import { routes } from './router'
import { Router } from '@lit-labs/router'

import helpesrCss from './style/helpers.scss?inline'

defineElement({
  name: 'lc-app',
  styles: [unsafeCSS(helpesrCss)],
  setup() {
    const router = new Router(this, routes)
    return () =>
      html`<div>
        <app-nav></app-nav>
        <div class="d-flex">
          <div class="pa-4" style="flex: 0 0 auto; width: 250px;">Nav</div>
          <div class="pa-4" style="flex: 1 1 auto;">${router.outlet()}</div>
        </div>
      </div>`
  },
})
