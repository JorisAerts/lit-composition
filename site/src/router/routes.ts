import { html } from 'lit'
import type { RouteConfig } from '@lit-labs/router/routes.js'
import * as md from '../md-pages'

import '../pages/home'
import '../pages/docs'

// Use Vite's BASE_URL (set via vite.config.ts) as the app base path
export const links = {
  Home: '',
  GettingStarted: 'getting-started',
  API: 'api',
  Hooks: 'hooks',
  Reactivity: 'reactivity',
  PropsAndDefaults: 'props-and-defaults',
  ShadowDom: 'shadow-dom',
  ContextProviders: 'context-providers',
  Examples: 'examples',
  Contributing: 'contributing',
}

export const routes: RouteConfig[] = [
  //
  { path: `/**/${links.GettingStarted}`, render: () => html`<lc-docs .value="${md.mdGettingStarted}"></lc-md>` },
  { path: `/**/${links.API}`, render: () => html`<lc-docs .value="${md.mdApi}"></lc-md>` },
  { path: `/**/${links.Hooks}`, render: () => html`<lc-docs .value="${md.mdHooks}"></lc-md>` },
  { path: `/**/${links.Reactivity}`, render: () => html`<lc-docs .value="${md.mdReactivity}"></lc-md>` },
  { path: `/**/${links.PropsAndDefaults}`, render: () => html`<lc-docs .value="${md.mdPropsAndDefaults}"></lc-md>` },
  { path: `/**/${links.ShadowDom}`, render: () => html`<lc-docs .value="${md.mdShadowDom}"></lc-md>` },
  { path: `/**/${links.ContextProviders}`, render: () => html`<lc-docs .value="${md.mdContextProviders}"></lc-md>` },
  { path: `/**/${links.Examples}`, render: () => html`<lc-docs .value="${md.mdExamples}"></lc-md>` },
  { path: `/**/${links.Contributing}`, render: () => html`<lc-docs .value="${md.mdContributing}"></lc-md>` },
  { path: `/**${links.Home}`, render: () => html`<lc-home></lc-home>` },
]
