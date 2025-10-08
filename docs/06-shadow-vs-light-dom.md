# Shadow DOM vs Light DOM

By default components render into a Shadow Root. Use `shadowRoot: false` in the options to render into the host
element's light DOM instead.

## How it works

`defineElement` sets `createRenderRoot()` to return `this` when `shadowRoot === false`. This matches the classic Lit
override pattern but is simpler to use from options.

## When to use light DOM

- You need global CSS from the page to style the internals of the component.
- You need the DOM content to participate in parent-level selectors (e.g., ::part or nested selectors on the host).

## Styling notes

- With Shadow DOM: provide `styles` using the Lit `css` tag and they will be scoped to the component.
- With Light DOM: you are responsible for scoping your CSS. Consider using class names on the host and children, or
  instruct users to place page-level CSS for the component.

## Example

```ts
defineElement({
  name: 'no-shadow',
  shadowRoot: false,
  render() { return html`<div class="root">Light DOM content</div>` }
})
```
