import type { Class } from './types'
import type { LitElement } from 'lit'

export type Mixin<
  Type,
  BaseClass extends typeof LitElement & Class<Type> = typeof LitElement & Class<Type>,
  Result extends BaseClass = BaseClass,
> = (base: BaseClass) => Result

type ApplyMixins<TBase extends Class<unknown>, TMixins extends readonly unknown[]> = TMixins extends readonly []
  ? TBase
  : TMixins extends readonly [infer First, ...infer Rest]
    ? First extends (base: Class<unknown> & typeof LitElement) => Class<infer R>
      ? TBase & ApplyMixins<Class<R>, Rest>
      : never
    : TBase

export const mixin = <TBase extends Class<unknown>, TMixins extends readonly Mixin<unknown>[]>(
  base: TBase,
  ...mixins: TMixins
): ApplyMixins<TBase, TMixins> =>
  mixins.reduce(
    (cls: Class<unknown>, mixinFn: Mixin<unknown>) => mixinFn(cls as Class<unknown> & typeof LitElement),
    base as Class<unknown>
  ) as ApplyMixins<TBase, TMixins>
