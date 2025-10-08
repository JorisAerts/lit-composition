## Contributing & AI guidance

Specific guidance for contributors and AI agents working on this repo.

Where to add tests

- Unit tests live in `tests/` and use Vitest. Component tests and Cypress component tests are present. Add small
  focused tests next to the module you change.

Local dev

```bash
pnpm install
pnpm dev    # start Vite site
pnpm test   # run unit tests
pnpm build  # build the package
```

AI-specific editing rules (short)

- Do not add global side-effects. Avoid adding top-level `customElements.define` calls outside `defineElement`.
- Hooks must be registered inside `setup()` only.
- If you change exported APIs, update `src/index.ts` and add a doc page in `docs/` showing the change.
- When editing TypeScript types that affect prop inference, add or update a test in `tests/reactivity` or
  `tests/defineElement` to lock the behavior.

If you update docs

- Put markdown pages under `docs/` (index pages are read by the site). Keep each concept in its own file so the
  site generator can map topics to pages.
- Add runnable examples where possible. Prefer short snippets (5–15 lines) that show the intended pattern.
