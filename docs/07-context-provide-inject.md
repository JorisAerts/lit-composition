# Context — provide & consume (experimental)

Context helpers wrap `@lit/context` to provide a small DI mechanism. The helpers live in `src/context/` and should be
used from inside `setup()` only.

## Example

```ts
import {defineElement} from 'lit-composition'
import {provide, consume} from 'lit-composition/context'
import {createContext} from '@lit/context'
import {html} from 'lit'

const ThemeContext = createContext('theme')

defineElement({
    name: 'theme-provider',
    setup() {
        provide(ThemeContext, {color: 'hotpink'})
        return () => html`<slot></slot>`
    }
})

defineElement({
    name: 'theme-consumer',
    setup() {
        const consumer = consume(ThemeContext)
        return () => html`<div style="color:${consumer.value.color}"><slot></slot></div>`
    }
})
```

Notes:
- Call provide() and consume() during setup() so there is a current component instance.
- consume() returns a live ContextConsumer with a .value property and subscribes to updates; using .value in render will re-render when it changes.
- These helpers wrap @lit/context and interoperate with Lit’s @provide/@consume decorators.
