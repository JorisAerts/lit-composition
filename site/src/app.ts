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
        --side-bar-width: 300px;
        --nav-bar-height: 80px;

        width: 100%;
      }

      aside.sidenav {
        position: fixed;
        top: var(--nav-bar-height);
        width: var(--side-bar-width);
        flex: 0 0 auto;
        max-height: 100vh;

        li {
          padding: 8px 0;
          list-style-type: circle;

          &:hover {
            list-style-type: disc;
            text-decoration: underline;
          }

          a {
            display: block;
          }
        }
      }
      main {
        margin: var(--nav-bar-height) 0 0 var(--side-bar-width);
        max-width: calc(1280px - var(--side-bar-width));
      }
    `,
  ],
  setup() {
    const router = new Router(this, routes)
    return () =>
      html`<div>
        <app-nav></app-nav>
        <div class="d-flex" style="max-height: 100%">
          <aside class="sidenav pa-4" style="">
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
          </aside>
          <main class="pa-4" style="flex: 1 1 auto;">${router.outlet()}</main>
        </div>
      </div>`
  },
})
