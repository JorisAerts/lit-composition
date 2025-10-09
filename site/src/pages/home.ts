import { html, unsafeCSS } from 'lit'
import { defineElement } from 'lit-composition'

import cssHelpers from '../style/helpers.scss?inline'
import cssPage from '../style/page.scss?inline'

defineElement({
  name: 'lc-home',
  styles: [unsafeCSS(cssPage), unsafeCSS(cssHelpers)],
  setup() {
    return () => html`Hello`
  },
})
