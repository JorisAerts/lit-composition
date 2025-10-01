
# Copilot Instructions for lit-composition

>This guide enables AI coding agents to be productive in the lit-composition codebase. It merges prior instructions with updated, actionable, codebase-specific guidance.

## Architecture & Key Concepts
- **Core API:** Components are defined via `defineElement(options)` (see `src/defineElement.ts`). This returns a LitElement subclass and optionally registers it as a custom element.
- **Component Options:** Supply either `render()` (declarative) or `setup()` (imperative, returns a render function and wires hooks/state).
- **Lifecycle Hooks:** Use `onConnected`, `onUpdated`, etc. inside `setup()` for composable lifecycle logic. See `src/hooks.ts`.
- **Props & Defaults:** Props use Lit’s property declaration shape. Defaults can be set in `props` or imperatively in `setup()`. See `README.md` and `src/types.ts`.
- **Shadow DOM Control:** Default is Shadow DOM; set `shadowRoot: false` to render into light DOM. See `README.md` for examples.
- **Context:** Use `provide` and `inject` from `src/context/` for dependency injection (wraps @lit/context). Must be called in `setup()`.
- **Mixins:** Use function mixins from `src/utils/mixin.ts` for class composition. Avoid side effects in mixins.

## Project Structure
- `src/`: Core library (APIs, hooks, context, utils)
- `tests/`: Vitest unit tests (see `tests/defineElement.spec.ts`)
- `cypress/`: Cypress component/E2E tests (see `cypress.config.ts`)
- `scripts/`: Maintenance scripts (e.g., `prepare-publish.js`)

## Developer Workflows
- **Dev server:** `pnpm dev` (Vite)
- **Build:** `pnpm build`
- **Unit tests:** `pnpm test` (Vitest)
- **Cypress tests:** `pnpm cypress` or use config in `cypress.config.ts`
- **Publish prep:** `node scripts/prepare-publish.js`

## Patterns & Conventions
- **No decorators:** Use plain options, not TS decorators (see `README.md` for comparison).
- **Props:** Prefer explicit types and defaults. Use narrow types for better DX.
- **Hooks:** Always call lifecycle hooks inside `setup()`.
- **Light DOM:** When using `shadowRoot: false`, style scoping is manual.
- **Context:** Only use `provide`/`inject` in `setup()`. Peer dependency: `@lit/context`.
- **Testing:** Place focused tests next to modules. For Lit components, use DOM assertions and `await el.updateComplete`.

## Integration Points
- **Peer dependencies:** `lit` (required), `@lit/context` (optional for context helpers).
- **Exports:** Main entry is `src/index.ts`. Context helpers in `src/context/`.

## Example: Minimal Component
```ts
import {defineElement, onConnected} from 'lit-composition'
import {html} from 'lit'

const MyHello = defineElement({
  name: 'my-hello',
  props: {who: {type: String}},
  setup() {
    onConnected(() => console.log('connected'))
    return () => html`Hello, ${this.who}`
  },
})
```

## Quality Checklist for AI Agents
- Use correct API signatures for `defineElement` and hooks
- Props: types and defaults are intentional
- Hooks: only called in `setup()`
- Shadow/light DOM: handle styling appropriately
- Tests: update/add as needed; ensure `pnpm test` passes
- No global side effects (e.g., element registration outside `defineElement`)

---
If any section is unclear or incomplete, please provide feedback or open an issue/PR to improve these instructions.

## 1) What is lit-composition?

- lit-composition provides TypeScript-first helpers for building Lit web components.
- Focus: strong typing, ergonomic component definition, composable lifecycle hooks, optional shadow DOM, and simple
  mixin support.
- Core entry points: `src/index.ts`, `src/defineElement.ts`, `src/hooks/`, `src/context/`, `src/utils/`.

## 2) Mental model

- You define components via defineElement(options). It returns a LitElement subclass and can register it as a custom
  element when a name is provided.
- You can supply either:
    - render(): a standard Lit render function, or
    - setup(): a function that may return a render function and is the place to wire hooks, side effects, and defaults.
- Lifecycle hooks are added via onConnected, onUpdated, etc. They are composable and may be called inside setup.

## 3) defineElement API (from src/defineElement.ts)

Signature (simplified):

```text
export const defineElement = (options: {
  name?: string // must include a dash per custom element spec
  parent?: typeof LitElement // default: LitElement
  styles?: CSSResultGroup
  props?: Record<string, PropertyDeclaration>
  register?: boolean // default: true if name present
  shadowRoot?: boolean // default: true (set false to render into light DOM)
  setup?: (this: Instance, comp?: Instance) => void | (() => unknown)
  render?: (this: Instance) => unknown
}) => LitElementSubclass
```

Important implementation details to rely on:

- Registration happens when `register !== false` and `name` is provided (see lines ~197–200).
- If `shadowRoot === false`, `createRenderRoot()` returns `this` to render into light DOM (lines ~136–138).
- setup() runs in the component constructor with `this` bound to the instance. If it returns a function, that becomes
  the render function; otherwise, `options.render` (or the base class render) is used (lines ~144–158).
- Default prop values are assigned after setup via `assignDefaultValues(this, options.props)` (line ~152).

## 4) Lifecycle hooks (exposed by defineElement)

Available helpers (lines ~66–82):

- onConnected(cb)
- onDisconnected(cb)
- onShouldUpdate(cb)
- onWillUpdate(cb)
- onPerformUpdate(cb)
- onUpdate(cb)
- onFirstUpdated(cb)
- onUpdated(cb)

Usage:

- Call these inside setup() (preferred) to register callbacks for the current instance. They are composable and can be
  called from helper functions as long as they run during setup of a component.

Example:

```ts
import {html} from 'lit'
import {defineElement} from './defineElement'

export const MyCounter = defineElement({
    name: 'my-counter',
    props: {count: {type: Number, reflect: true}},
    setup() {
        onConnected(() => {
            // e.g., subscribe to a store or add event listeners
        })

        onUpdated((changed) => {
            if (changed.has('count')) {
                // respond to prop changes
            }
        })

        return function render() {
            return html`<button @click=${() => this.count++}>Count: ${this.count ?? 0}</button>`
        }
    },
})
```

## 5) Props, typing, and defaults

- Define props via `props` using Lit’s `PropertyDeclaration` entries. Prefer explicit typings where feasible.
- Provide defaults by assigning them in `props` and/or within setup before initial render. Defaults are assigned after
  setup via `assignDefaultValues`.
- Use narrow types for stronger DX: e.g., `{ mode: { type: String as PropType<'a'|'b'>, attribute: true } }`.

Note on PropType helper:

- `PropType<T>` allows constructors or method-like constructors for function types. Use it to help TS infer the prop
  type.

## 6) Choosing between setup() and render()

- Prefer setup() when you need hooks, subscriptions, or to compute and return a render function with captured context.
- Prefer render() when the component is purely declarative and doesn’t need lifecycle tap‑ins beyond CSS/properties.
- You can use both: setup() may set up side effects, and still choose to use the provided render() if it returns
  nothing.

## 7) Shadow DOM vs Light DOM

- Default is Shadow DOM (standard Lit behavior).
- Set `shadowRoot: false` to render into the light DOM of the host element.

```ts
defineElement({
    name: 'no-shadow', shadowRoot: false, render() { /* ... */
    }
})
```

## 8) Custom element registration

- If `name` is provided and `register !== false`, the component is registered via `customElements.define(name, Class)`.
- If you want a class without side‑effectful registration, omit `name` or set `register: false` and export the class for
  manual registration.

## 9) Styles

- Provide `styles` with a `CSSResultGroup` (e.g., `css` tagged literal from Lit).
- Styles apply as usual when using Shadow DOM. In light DOM mode (`shadowRoot: false`), you are responsible for scoping.

## 10) Mixins

- Utilities for composing mixins live in `src/utils/mixin.ts`. Prefer function mixins that accept and return classes
  extending LitElement.
- Keep mixins side‑effect free; do not register elements inside mixins.

## 11) Context / dependency injection

- Provide utilities are in `src/context/provide.ts`. Context provisioning is a WIP/TODO. Treat it as experimental.
- Until finalized, prefer explicit prop/threading or event‑based patterns for cross‑component communication.

## 12) Project layout

- src/: core library code
    - defineElement.ts: the primary API
    - hooks/: hook infra and exports
    - context/: experimental context helpers
    - utils/: shared utilities (mixin, is, symbols, etc.)
- tests/: Vitest unit tests
- cypress/: Cypress component/E2E tests
- scripts/: maintenance utilities (e.g., prepare-publish.js)

## 13) Developer workflows

- Dev server: `pnpm dev` (Vite)
- Build: `pnpm build`
- Unit tests (Vitest): `pnpm test`
- Cypress component/E2E tests: configured in `cypress/cypress.config.ts`
- Publish prep: `node scripts/prepare-publish.js`

Tips:

- Prefer small, focused tests alongside relevant modules (see `tests/`).
- For Lit component tests, render the element and assert on the DOM; use `await el.updateComplete` as needed.

## 14) Coding conventions (Do/Don’t)

Do:

- Use TypeScript explicit types for props, setup, and hooks.
- Keep setup() free of heavy logic; extract helpers for readability and reuse.
- Use lifecycle hooks via the provided helpers (onConnected, etc.), called during setup.
- Keep components small and cohesive (single purpose).
- Write unit tests for new behavior and regression tests for fixed bugs.

Don’t:

- Don’t introduce reactive state managers in core; reactivity is intentionally not built‑in (future patterns are TBD).
- Don’t register elements in unexpected places (e.g., inside mixins or module top‑level side effects unrelated to
  defineElement calls).
- Don’t assume Shadow DOM when `shadowRoot: false` is set; account for style scoping.

## 15) Copy‑pasteable templates

Basic component with render():

```ts
import {html, css} from 'lit'
import {defineElement} from './defineElement'

export const HelloWorld = defineElement({
    name: 'hello-world',
    styles: css`:host{display:block;padding:4px}`,
    props: {
        msg: {type: String, reflect: true},
    },
    render() {
        return html`<div>${this.msg ?? 'Hello, world!'}</div>`
    },
})
```

Setup‑driven with hooks and light DOM:

```ts
import {html} from 'lit'
import {defineElement} from './defineElement'

export const Clicker = defineElement({
    name: 'my-clicker',
    shadowRoot: false,
    props: {count: {type: Number}},
    setup() {
        onConnected(() => console.log('connected'))
        return () => html`<button @click=${() => this.count = (this.count ?? 0) + 1}>${this.count ?? 0}</button>`
    },
})
```

## 16) Quality checklist for AI‑generated changes

Before opening a PR or accepting Copilot’s suggestion, verify:

- API usage matches the current defineElement contract (name/register/shadowRoot/props/styles/setup/render).
- Hooks are called during setup and not at runtime/after render creation.
- Props use correct types and defaults; reflect/attribute options are intentional.
- Shadow vs light DOM implications are handled (styling, selectors).
- Tests added/updated; `pnpm test` passes locally.
- No unintended side effects (e.g., global registrations during import).

## 17) Common prompts for Copilot/ChatGPT (good examples)

- “Create a Lit component using defineElement that renders into light DOM and registers onConnected and onUpdated
  hooks.”
- “Add a boolean prop with default true and reflect it as an attribute; update render to toggle a CSS class.”
- “Convert this class component into defineElement with a setup() that returns a render function.”
- “Write Vitest for this component to assert it increments count on click.”

## 18) Need help or see gaps?

Open an issue or a PR that updates this file. Be explicit about:

- The API you changed or need to change
- The files you touched/added
- How to test the change (commands, scenarios)

---
If anything is unclear, please ask questions or propose edits to improve these instructions.
