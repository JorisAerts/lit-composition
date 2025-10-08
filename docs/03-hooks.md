# Lifecycle hooks

lit-composition exposes small helpers that register callbacks and map to Lit's lifecycle methods. They are thin
abstractions meant to be called during `setup()` only.

## Available hooks (import from `lit-composition`)

- `onConnected(cb)` — maps to `connectedCallback`
- `onDisconnected(cb)` — maps to `disconnectedCallback`
- `onShouldUpdate(cb)` — maps to `shouldUpdate`
- `onWillUpdate(cb)` — maps to `willUpdate`
- `onPerformUpdate(cb)` — maps to `performUpdate`
- `onUpdate(cb)` — maps to `update`
- `onFirstUpdated(cb)` — maps to `firstUpdated`
- `onUpdated(cb)` — maps to `updated`

## Rules & gotchas

- Call hooks only during `setup()`; they capture the current instance's lifecycle handlers. Calling them at render
  time will not register correctly.
- Hook callbacks receive the same arguments as Lit's lifecycle methods — for example `onUpdated(changedProps)` gets the
  `changedProps` Map.
- Hooks are composable: helper functions invoked from `setup()` can call hooks and register behavior for the parent
  component.

## Examples

Basic:
```ts
import {defineElement, onConnected, onUpdated} from 'lit-composition'
import {html} from 'lit'

defineElement({
  name: 'with-hooks',
  props: {counter: {type: Number}},
  setup() {
    onConnected(() => console.log('connected'))
    onUpdated((changed) => {
      if (changed.has('counter')) console.log('counter changed')
    })
    return () => html`<div>${this.counter}</div>`
  },
})
```

Gate updates with onShouldUpdate:
```ts
import {defineElement, onShouldUpdate} from 'lit-composition'
import {html} from 'lit'

defineElement({
  name: 'even-only',
  props: { n: { type: Number, default: 0 } },
  setup() {
    onShouldUpdate((changed) => changed.has('n') && (this.n % 2 === 0))
    return () => html`${this.n}`
  },
})
```
