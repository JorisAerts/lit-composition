import { html } from 'lit'
import type { RouteConfig } from '@lit-labs/router/routes.js'

export const routes: RouteConfig[] = [
  //
  { path: '/', render: () => html`<h1>Home</h1>` },
]
