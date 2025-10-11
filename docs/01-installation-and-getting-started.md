# Installation & Getting Started

This page shows how to install lit-composition and create your first component. It assumes you already have
Node.js (18+) and a package manager such as pnpm, npm, or yarn.

## Installation

Install the library and the required peer `lit` package:

```bash
pnpm add lit lit-composition
# or
npm i lit lit-composition
```

If you plan to use signals (recommended) also install `@lit-labs/signals` and import the signals-enabled entry point:

```bash
pnpm add @lit-labs/signals
```

Then import from the signals entry point when defining elements that should react to signals:

```ts
import {defineElement} from 'lit-composition/signals'
import {html} from 'lit'
import {signal} from '@lit-labs/signals'

defineElement({
  name: 'hello-signals',
  setup() {
    const count = signal(0)
    return () => html`<button @click=${() => count.set(count.get() + 1)}>${count.get()}</button>`
  },
})
```

If you plan to use context helpers (provide/consume) also install `@lit/context`:

```bash
pnpm add @lit/context
```

## Minimal example (object style)

Create a file and import `defineElement`:

```ts
import {defineElement, onConnected} from 'lit-composition'
import {html} from 'lit'

defineElement({
  name: 'hello-world',
  props: { who: { type: String, default: 'World' } },
  setup() {
    onConnected(() => console.log('connected'))
    return () => html`Hello, ${this.who}`
  },
})
```

## Functional shorthand

For tiny, stateless elements you can use the shorthand:

```ts
import {defineElement} from 'lit-composition'
import {html} from 'lit'

defineElement('hello-cdn', () => html`Hello from CDN`)
```

## Run locally

The repository uses Vite for the demo/site. From the workspace root:

```bash
pnpm dev
```

## What to read next

- `docs/02-api.md` — reference for `defineElement` options and examples
- `docs/03-hooks.md` — lifecycle hooks and usage patterns
- `docs/04-reactivity.md` — Signals guide (`signal`, `computed`, `effect`) and examples
