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
      :host {
        background: hsla(from var(--background-color) h s calc(l - 1.3) / 1);
        border-radius: 6px;
        padding: 8px;
      }

      ::slotted(h2) {
        margin: 0;
        font-size: medium;
      }
    `,
  ],
  setup() {
    return () => html`<slot></slot>`
  },
})
