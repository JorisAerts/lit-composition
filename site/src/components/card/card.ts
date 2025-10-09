import { css, html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'

import cssHelpers from '../../style/helpers.scss?inline'
import cssPage from '../../style/page.scss?inline'

defineElement({
  name: 'lc-card',
  styles: [
    unsafeCSS(cssPage),
    unsafeCSS(cssHelpers),
    css`
      div {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.2);

        padding: 8px;
      }
    `,
  ],
  setup() {
    return () => html`<div><slot></slot></div>`
  },
})
