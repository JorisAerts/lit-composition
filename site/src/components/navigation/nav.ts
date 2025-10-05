import { css, html } from 'lit'
import { defineElement } from 'lit-composition'

defineElement({
  name: 'app-nav',
  styles: [
    css`
      :host {
        width: 100%;
      }
      nav {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        flex: 0 0 100%;
      }
    `,
  ],
  setup() {
    return () =>
      html` <nav>
        <div style="align-self: stretch; flex-grow: 1;"></div>
        <a href="/site/public">Home</a>
        <a href="/site/public">Help</a>
      </nav>`
  },
})
