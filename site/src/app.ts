import { css, html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import './components/navigation/nav'
import { links, routes } from './router'
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
        width: 100%;
      }
    `,
  ],
  setup() {
    const router = new Router(this, routes)
    return () =>
      html`<div>
        <app-nav></app-nav>
        <div class="d-flex" style="max-height: 100%">
          <div class="pa-4" style="flex: 0 0 auto; width: 250px; max-height: 100vh; position: sticky; top:60px;">
            <ul>
              <li><a href="${links.GettingStarted}">Getting started</a></li>
              <li><a href="${links.API}">API</a></li>
              <li><a href="${links.Hooks}">Hooks</a></li>
              <li><a href="${links.Reactivity}">Reactivity</a></li>
              <li><a href="${links.PropsAndDefaults}">Props &amp; defaults</a></li>
              <li><a href="${links.ShadowDom}">Shadow DOM vs Light DOM</a></li>
              <li><a href="${links.ContextProviders}">Context</a></li>
              <li><a href="${links.Contributing}">Contributing</a></li>
            </ul>
          </div>
          <div class="pa-4" style="flex: 1 1 auto;">${router.outlet()}</div>
        </div>
      </div>`
  },
})
