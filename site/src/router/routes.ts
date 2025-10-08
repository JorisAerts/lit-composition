import { html } from 'lit'
import type { RouteConfig } from '@lit-labs/router/routes.js'

import '../pages/home'

export const routes: RouteConfig[] = [
  //
  { path: '/', render: () => html`<lc-home></lc-home>` },
]
