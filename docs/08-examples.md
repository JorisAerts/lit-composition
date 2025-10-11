# Examples and Patterns

This document collects short, persuasive examples that show why `lit-composition` reduces boilerplate and improves
DX compared to plain Lit classes.

## 1) Shared state without a store

```ts
import {defineElement} from 'lit-composition'
import {html} from 'lit'
import {signal, computed} from '@lit-labs/signals'

const shared = signal(0)

defineElement({
    name: 'a-counter', setup() {
        const doubled = computed(() => shared.get() * 2)
        return () => html`<button @click=${() => shared.set(shared.get() + 1)}>A: ${shared.get()} → ${doubled.get()}</button>`
    }
})

defineElement({
    name: 'b-counter', setup() {
        return () => html`B sees: ${shared.get()}`
    }
})
```

Why this is nice

- No external store, no event plumbing. Signal-based shared state is explicit and tiny. Components automatically
  re-render when the signal changes.

## 2) Setup-driven lifecycle and default precedence

```ts
defineElement({
    name: 'with-defaults',
    props: {count: {type: Number, default: 1}},
    setup() {
        // runtime logic wins over defaults
        this.count ??= Math.floor(Math.random() * 10)
        return () => html`${this.count}`
    }
})
```

## 3) Light DOM integration for CMS styling

```ts
defineElement({
    name: 'editor-block', shadowRoot: false, render() {
        return html`<slot></slot>`
    }
})
```
