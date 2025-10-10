import { css, html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'

import '../components/markdown'

import cssHelpers from '../style/helpers.scss?inline'
import cssPage from '../style/page.scss?inline'
import { links } from '../router'

defineElement({
  name: 'lc-docs',
  styles: [
    unsafeCSS(cssPage),
    unsafeCSS(cssHelpers),
    css`
      :host {
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
        margin-left: var(--side-bar-width);
      }
    `,
  ],
  props: {
    value: { type: String, attribute: false },
  },
  setup() {
    return () => html`
      <aside class="sidenav pa-4" style="">
        <ul>
          <li><a href="${links.GettingStarted}">Getting started</a></li>
          <li><a href="${links.API}">API</a></li>
          <li><a href="${links.Hooks}">Hooks</a></li>
          <li><a href="${links.Reactivity}">Reactivity</a></li>
          <li><a href="${links.PropsAndDefaults}">Props &amp; defaults</a></li>
          <li><a href="${links.ShadowDom}">Shadow DOM vs Light DOM</a></li>
          <li><a href="${links.ContextProviders}">Context</a></li>
          <li><a href="${links.Examples}">Examples</a></li>
          <li><a href="${links.Contributing}">Contributing</a></li>
        </ul>
      </aside>
      <main class="pa-4" style="flex: 1 1 auto;"><lc-md .value="${this.value}"></lc-md></main>
    `
  },
})
