# Context — provide & inject (experimental)

Context helpers wrap `@lit/context` to provide a small DI mechanism. The helpers live in `src/context/` and should be
used from inside `setup()` only.

## Example

```ts
import {defineElement} from 'lit-composition'
import {provide, inject} from 'lit-composition/context'
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

you can also use `consume` instead of `inject`.
The reason why it's called that way is because of bad naming,
as `consume` is sounds like you only _consume_ the value once.

```ts
import {consume} from 'lit-composition/context'

// ... do exactly the same as with inject
```

Your choice.
