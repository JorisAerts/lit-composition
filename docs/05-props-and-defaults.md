# Props and defaults

Properties follow Lit's `PropertyDeclaration` shape with a small extension: `default` on the declaration is used by
lit-composition to populate undefined instance values in the constructor before `setup()` runs.

## Declaration examples

```ts
props: {
  count: { type: Number, default: 1 },
  enabled: { type: Boolean, default: true },
  options: { type: Object, default: () => ({ dense: false }) },
}
```

## Precedence rules (important)

1. User-supplied attribute/prop values (when present) take highest precedence.
2. Values set imperatively inside `setup()` take precedence over declared `default` values, because `setup()` runs after defaults are assigned.
3. `default` values declared in `props` are only applied to fields that are `undefined` at construction time.

## Practical advice

- If you need a default that should be overridden by a user attribute, use `default` in `props`.
- If you want to compute an initial value using runtime data (e.g., from a service), set the value inside `setup()` so
  it overrides the default.

## TypeScript helpers

The implementation provides type helpers in `src/defineElement/defineElement.ts` that infer prop types based on the
`type` constructor. Look at `InferPropType` and `PropType` types to understand how TypeScript will treat your props.
