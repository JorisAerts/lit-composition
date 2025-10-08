## Context — provide & inject (experimental)

Context helpers wrap `@lit/context` to provide a small DI mechanism. The helpers live in `src/context/` and should be
used from inside `setup()` only.

Important notes

- Context helpers are experimental. They depend on `@lit/context` as a peer dependency and may change.
- Call `provide`/`inject` from inside `setup()` so they tie into the instance lifecycle and cleanup.
- Prefer explicit props or events for public APIs if you want maximum stability and backwards compatibility.

Files to inspect

- `src/context/provide.ts` — provider helper
- `src/context/inject.ts` — consumer helper

Example

```ts
// concept example: not a complete snippet
import {defineElement} from 'lit-composition'
import {createContext} from '@lit/context'

const ThemeContext = createContext('theme')

defineElement({
  name: 'theme-provider',
  setup() {
    provide(ThemeContext, { color: 'hotpink' })
    return () => html`<slot></slot>`
  }
})
```
