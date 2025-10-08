## Examples and Patterns

This document collects short, persuasive examples that show why `lit-composition` reduces boilerplate and improves
DX compared to plain Lit classes.

1) Shared state without a store

```ts
import {defineElement, useRef, computed} from 'lit-composition'
import {html} from 'lit'

const shared = useRef(0)

defineElement({ name: 'a-counter', setup() {
  const doubled = computed(() => shared.value * 2)
  return () => html`<button @click=${() => shared.value++}>A: ${shared.value} → ${doubled.value}</button>`
}})

defineElement({ name: 'b-counter', setup() {
  return () => html`B sees: ${shared.value}`
}})
```

Why this is nice

- No external store, no event plumbing. Ref-based shared state is explicit and tiny. Components automatically
  re-render when the ref changes.

2) Setup-driven lifecycle and default precedence

```ts
defineElement({
  name: 'with-defaults',
  props: { count: { type: Number, default: 1 } },
  setup() {
    // runtime logic wins over defaults
    this.count ??= Math.floor(Math.random() * 10)
    return () => html`${this.count}`
  }
})
```

3) Light DOM integration for CMS styling

```ts
defineElement({ name: 'editor-block', shadowRoot: false, render() { return html`<slot></slot>` } })
```

4) Migrating an existing LitElement

If you have a classic class that needs to adopt a shared `computed`, use `takeRef(this, comp)` in the constructor to
subscribe the class to updates.
