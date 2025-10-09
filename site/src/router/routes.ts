import { html } from 'lit'
import type { RouteConfig } from '@lit-labs/router/routes.js'
import * as md from '../md-pages.ts'

import '../pages/home'
import '../components/markdown'

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
  { path: `/**/${links.Home}`, render: () => html`<lc-md .value="${md.mdGettingStarted}"></lc-md>` },
  { path: `/**/${links.GettingStarted}`, render: () => html`<lc-md .value="${md.mdGettingStarted}"></lc-md>` },
  { path: `/**/${links.API}`, render: () => html`<lc-md .value="${md.mdApi}"></lc-md>` },
  { path: `/**/${links.Hooks}`, render: () => html`<lc-md .value="${md.mdHooks}"></lc-md>` },
  { path: `/**/${links.Reactivity}`, render: () => html`<lc-md .value="${md.mdReactivity}"></lc-md>` },
  { path: `/**/${links.PropsAndDefaults}`, render: () => html`<lc-md .value="${md.mdPropsAndDefaults}"></lc-md>` },
  { path: `/**/${links.ShadowDom}`, render: () => html`<lc-md .value="${md.mdShadowDom}"></lc-md>` },
  { path: `/**/${links.ContextProviders}`, render: () => html`<lc-md .value="${md.mdContextProviders}"></lc-md>` },
  { path: `/**/${links.Examples}`, render: () => html`<lc-md .value="${md.mdExamples}"></lc-md>` },
  { path: `/**/${links.Contributing}`, render: () => html`<lc-md .value="${md.mdContributing}"></lc-md>` },
]
