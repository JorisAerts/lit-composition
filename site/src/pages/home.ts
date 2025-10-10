import { css, html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'
import '../components/card'
import cssHelpers from '../style/helpers.scss?inline'
import cssPage from '../style/page.scss?inline'

import logoSvg from '../../../logo.svg' with { type: 'svg' }

defineElement({
  name: 'lc-home',
  styles: [
    unsafeCSS(cssPage),
    unsafeCSS(cssHelpers),
    css`
      :host {
        --primary-color: rgb(0, 232, 255);
        --secondary-color: rgb(77, 99, 255);

        display: block;
        width: 100%;
      }

      .logo-container {
        --logo-height: 200px;

        position: relative;
        height: var(--logo-height);
        width: calc(var(--logo-height) * 1.4);
        justify-content: end;

        .logo-bg {
          position: absolute;
          box-sizing: border-box;
          border-radius: 50%;
          width: calc(var(--logo-height) * 2.4);
          height: calc(var(--logo-height) * 1.5);
          top: calc(var(--logo-height) * -0.2);
          left: calc(var(--logo-height) * -0.2);
          background: linear-gradient(90deg, var(--primary-color) 30%, var(--secondary-color) 80%);
          filter: blur(32px);
          opacity: 0.65;
        }

        img {
          position: absolute;
          height: var(--logo-height);
        }
      }

      .cards-row > lc-card {
        flex: 1 1 0;
        min-width: 0;
        height: 100%;
      }
    `,
  ],
  setup() {
    return () => html`
      <button class="px-4 py-2">npm i lit-composition</button>
      <button class="px-4 py-2">Get Started</button>
      <div class="d-flex" style="height: 300px; justify-items: center">
        <div style="flex: 1 1 0;">
          <h1>Lit-composition</h1>
        </div>
        <div class="logo-container" style="margin-right: 200px; align-self: center">
          <div class="logo-bg"></div>
          <img src="${logoSvg}" />
        </div>
      </div>
      <div class="d-flex gap-4 pa-4 justify-center cards-row mx-auto" style="width: 50%">
        <lc-card>
          <h2>Documentation</h2>
          <p>Bla bla</p>
        </lc-card>
        <lc-card>
          <h2>Documentation</h2>
        </lc-card>
      </div>
    `
  },
})
