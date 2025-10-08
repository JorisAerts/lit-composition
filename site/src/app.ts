import { css, html } from 'lit'
import { defineElement } from 'lit-composition'
import './components/navigation/nav'
import { routes } from './router'
import { Router } from '@lit-labs/router'

defineElement({
  name: 'lc-app',
  styles: [
    css`
      :host {
        width: 100%;
      }
    `,
  ],
  setup() {
    const router = new Router(this, routes)
    return () => html`<div> <app-nav></app-nav><div>${router.outlet()}</div> </div>`
  },
})
