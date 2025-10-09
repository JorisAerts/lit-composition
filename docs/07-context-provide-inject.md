# Context — provide & inject (experimental)

Context helpers wrap `@lit/context` to provide a small DI mechanism. The helpers live in `src/context/` and should be
used from inside `setup()` only.

## Important notes

- Context helpers are experimental. They depend on `@lit/context` as a peer dependency and may change.
- Call `provide`/`inject` from inside `setup()` so they tie into the instance lifecycle and cleanup.
- Prefer explicit props or events for public APIs if you want maximum stability and backwards compatibility.

## Files to inspect

- `src/context/provide.ts` — provider helper
- `src/context/inject.ts` — consumer helper

## Example

```ts
import {defineElement} from 'lit-composition'
import {provide, inject} from 'lit-composition/src/context' // import from public context entry if exported
import {createContext} from '@lit/context'
import {html} from 'lit'

const ThemeContext = createContext('theme')

defineElement({
  name: 'theme-provider',
  setup() {
    provide(ThemeContext, { color: 'hotpink' })
    return () => html`<slot></slot>`
  }
})

defineElement({
  name: 'theme-consumer',
  setup() {
    const consumer = inject(ThemeContext)
    return () => html`<div style="color:${consumer.value.color}"><slot></slot></div>`
  }
})
```
