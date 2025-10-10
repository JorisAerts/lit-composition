# Reactivity — Signals (using @lib-labs/signals)

lit-composition no longer ships a custom reactive primitive. Instead it embraces fine-grained signals from
`@lib-labs/signals`. The library's element base integrates with that system: the class returned by
`defineElement()` extends SignalWatcher, so any signals you read in `setup()` or your render automatically keep the
component in sync.

This approach gives you a fully-featured reactivity story without extra ceremony: signals provide local and shared
state, computed values, and effects. Because `defineElement()` integrates with the SignalWatcher, migrating is usually
one small change (import signals and read `.value`) and you get predictable, efficient updates with minimal bundle
impact.

Why use signals?

- Tiny and focused API (signal, computed, effect).
- Fine-grained updates: only the components that read a signal re-render when that signal changes.
- Small bundle size and predictable timing (no virtual DOM diffing needed beyond Lit's efficient updates).
- Works at module scope for shared state or inside component setup for local state.

Core primitives (from @lib-labs/signals)

- `signal(initial)` — creates a writable signal. Read/write via `.value`.
- `computed(fn)` — derived signal whose `.value` is computed from other signals.
- `effect(fn)` — run side effects when dependencies change; returns a cleanup when necessary.

Quick contract

- Inputs: signals and computed values read inside `setup()` or the render.
- Outputs: renders that reflect `.value` reads and effects for side effects.
- Error modes: throw inside an effect will bubble unless you catch it; guard long-running async work.

Edge cases to watch

- Reading signals outside `setup()` / render (for example, in a random event handler) still works — but only reads
  that happen during render/`setup()` are tracked for automatic re-rendering. For imperatively syncing, use `effect`.
- Long-lived effects should return a cleanup function to avoid leaks.
- When sharing state across tabs/processes, signals are local to the page; persist or sync externally if you need
  cross-tab state.

## Examples

1.  Local signal inside a component (small change to your component)

    ```ts
    import {defineElement} from 'lit-composition'
    import {html} from 'lit'
    import {signal} from '@lib-labs/signals'

    export const MyCounter = defineElement({
      name: 'lc-counter',
      setup() {
        // local, per-instance signal
        const count = signal(0)

        // reading count.value inside the returned render => the element will update when it changes
        return function render() {
          return html`<button @click=${() => (count.value += 1)}>Count: ${count.value}</button>`
        }
      },
    })
    ```

2.  Shared signals (module-scoped store)

    ```ts
    import {defineElement} from 'lit-composition'
    import {html} from 'lit'
    import {signal, computed} from '@lib-labs/signals'

    // module-scope shared state
    export const sharedCount = signal(0)
    export const doubled = computed(() => sharedCount.value * 2)

    defineElement({
      name: 'lc-counter-a',
      setup() {
        return () => html`<button @click=${() => sharedCount.value++}>A: ${sharedCount.value} → ${doubled.value}</button>`
      },
    })

    defineElement({
      name: 'lc-counter-b',
      setup() {
        // reads the same shared signal; updates automatically
        return () => html`B: ${sharedCount.value}`
      },
    })
    ```

3.  Computed, derived data and effects

    ```ts
    import {defineElement} from 'lit-composition'
    import {html} from 'lit'
    import {signal, computed, effect} from '@lib-labs/signals'

    const first = signal('John')
    const last = signal('Doe')
    const fullName = computed(() => `${first.value} ${last.value}`)

    defineElement({
      name: 'lc-name',
      setup() {
        // run a side effect when fullName changes — this runs during setup and is automatically cleaned up
        effect(() => {
          // For example: analytics, localStorage sync, or network notifications
          localStorage.setItem('lastFullName', fullName.value)
        })

        return () => html`<div>${fullName.value}</div>`
      },
    })
    ```

4.  Interop with classic LitElements

    If you use a classic `LitElement` (not created through `defineElement`) you can still subscribe to signals using an
    `effect` in the element lifecycle. However, components produced by `defineElement()` extend the built-in SignalWatcher
    integration, so in most cases you don't need manual wiring — just read `signal.value` in your render and the element
    keeps itself up-to-date.

    Migration tips (from the old in-repo primitives)

    - `useRef(initial)` -> `signal(initial)`
    - `computed(fn)` -> `computed(fn)` (same idea, import from `@lib-labs/signals`)
    - `watch(target, cb)` -> `effect(() => { /* read target.value and run cb */ })`

## Notes and best practices

- Prefer module-scope shared signals for small app-wide values. For larger apps, combine signals with a small store
  wrapper that exposes a clear API.
- Keep effects focused and return cleanup functions for subscriptions or timers.
- Keep components tiny: using signals encourages splitting state and view so components remain small and testable.

## Try it

- Install the signals library in your project if you haven't yet:

  ```bash
  pnpm add @lib-labs/signals
  ```

  Then update components to import and use `signal`, `computed` and `effect` as shown above. Because `defineElement`
  returns a class that already integrates with signals, migrating is mostly a matter of replacing the tiny primitives and
  reading `.value` in your render.

Files changed

- `docs/04-reactivity.md` — replaced the old in-repo reactive primitive documentation with a Signals-based guide and
  usage examples.
