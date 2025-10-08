## API — defineElement and options

Core export: `defineElement(...)`

Two call shapes

- Functional shorthand: `defineElement('my-tag', () => html`...`)` — quick registration of a stateless element. By
  default this form uses `shadowRoot: false` in the implementation.
- Object options: `defineElement({ name, props, styles, shadowRoot, register, setup, render })` — preferred when you
  need lifecycle hooks, props, defaults or styles.

Important fields (how the implementation behaves)

- `name?: string` — custom element tag name. If `register !== false` and `name` is present the element is registered
  with `customElements.define` via `registerCustomElement` in `src/utils/browser.ts`.
- `props?: Record<string, PropertyDeclaration>` — Lit-style property declarations. See `src/defineElement/defineElement.ts`
  for `default` handling.
- `styles?: CSSResultGroup` — Lit `css` styles applied when using shadow DOM.
- `shadowRoot?: boolean` — set to `false` to render into the host's light DOM. Implementation calls `createRenderRoot()`
  and returns `this` when `shadowRoot === false`.
- `setup?: function` — runs synchronously during construction with `this` bound to the component instance. If
  `setup()` returns a function it becomes the `render()` implementation for that instance. Use `setup()` to register
  hooks and initialize instance-scoped refs.
- `render?: function` — fallback declarative render method if `setup()` does not return a render function.

Defaults assignment

Defaults declared in `props` via `default` are assigned *after* `setup()` completes using `assignDefaultValues`.
This means values you set in `setup()` take precedence over prop defaults. User-supplied attributes/props still win.

Interoperability notes

- If you need a class without registering it immediately, omit the `name` or pass `register: false` in the options.
- `takeRef` in `src/reactivity/takeRef` allows classic `LitElement` classes to subscribe to `useRef`/`computed` refs.

Files to inspect for behavior

- `src/defineElement/defineElement.ts` — main implementation (constructor semantics, defaults, render wiring)
- `src/defineElement/hooks.ts` — hook registration and mapping to Lit lifecycle
- `src/reactivity/*` — ref/computed/watch helpers

Examples

See `docs/examples.md` for copyable examples demonstrating props, hooks, and light DOM.
