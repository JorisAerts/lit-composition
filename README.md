# lit-kit

<div style="zoom:12; margin:-.25em 0;">🈂</div>

Helpers for dealing with [lit](https://lit.dev/).

## Features

- **Type-safe property definitions** with default values
- **Composable lifecycle hooks** (e.g., `onConnected`)
- **Flexible setup and render functions**
- **Mixin support**
- **Optional shadow DOM control**
- **TypeScript-first**: Strong typing for properties, setup, and render functions

## Example

```js
import {defineComponent, onConnected} from 'lit-suiker'
import {html} from 'lit'

// Define a component with a render function
defineComponent({
    name: 'my-component',
    render() {
        return html`<div>Hello, world!</div>`
    }
})

// Define a component with a setup function
defineComponent({
    name: 'my-other-component',
    setup() {
        const who = "Joris" // TODO: reactivity
        return () => html`<div>Hello, ${who}!</div>`
    }
})
```

## Getting Started

1. Install Lit and this library.
2. Use `defineComponent` to create your components.
3. Register lifecycle hooks and define properties as needed.
