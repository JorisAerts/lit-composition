import { defineElement } from 'lit-composition'
import { css, html } from 'lit'

defineElement({
  name: 'lc-layout',
  styles: [
    css`
      :host {
        display: block;
        width: var(--page-width);
        max-width: var(--page-width);
        margin: auto;
      }
    `,
  ],
  setup() {
    return () => html`<slot></slot>`
  },
})
