import cssHelpers from '../style/helpers.scss?inline'
import cssPage from '../style/page.scss?inline'
import { html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import '../components/card'
import cssHome from './home.scss?inline'
import { logo } from '../utils/logo'
import { links } from '../router'

defineElement({
  name: 'lc-home',
  styles: [unsafeCSS(cssPage), unsafeCSS(cssHelpers), unsafeCSS(cssHome)],
  setup() {
    return () => html`
      <div class="d-flex" style="gap:32px; height: 500px; justify-items: center">
        <div style="flex: 1 1 0; align-content: center;">
          <blockquote class="slogan">Building evolutionary<br />Lit elements</blockquote>
          <h1 class="ma-0" style="font-weight: 100; opacity: .8; letter-spacing: -.4px">
            Lit-composition, a new way of defining Web Components
          </h1>
          <button
            class="px-4 py-2 mt-4 mr-2"
            style="
              box-sizing: border-box;
              border-radius: 6px;
              font-weight: bold;
              background: var(--secondary-color);
              border: 1px solid var(--secondary-color);
            "
            @click="${() => window.location.replace(links.GettingStarted)}"
          >
            Getting Started
          </button>
          <button
            class="px-4 py-2 mt-4 mr-2"
            style="
              box-sizing: border-box;
              border-radius: 6px;
              font-weight: bold;
              background: transparent;
              border: 1px solid var(--secondary-color);
            "
          >
            npm i lit-composition
          </button>
        </div>
        <div class="logo-container" style="margin-right: 100px; align-self: center">
          <div class="logo-bg"></div>
          <img src="${logo}" />
        </div>
      </div>
      <div class="d-flex gap-4 pa-4 justify-center cards-row mx-auto" style="width: 65%; position: relative"></div>
    `
  },
})
