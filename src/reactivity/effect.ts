import { REF_SYMBOL } from '../symbols'
import type { ReactiveElement } from 'lit'
import type { Fn } from '../utils/types'

export const VALUE = 'value'

/**
 * A reactive reference that wraps a value and exposes it via the `value` property.
 * Reading/writing `value` participates in the dependency tracking system.
 *
 * @typeParam T - The wrapped value type.
 */
export interface Effect<T> {
  [REF_SYMBOL]: Fn
  value: T
}

type EffectFn = () => void

let activeEffect: EffectFn | null = null
const effectStack: EffectFn[] = []

const targetMap = new WeakMap<object, Map<PropertyKey, Set<EffectFn>>>()

export function track(target: object, key: PropertyKey) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  dep.add(activeEffect)
}

export function trigger(target: object, key: PropertyKey) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  if (!effects || effects.size === 0) return
  // Run effects. We copy to avoid mutation during iteration.
  const toRun = new Set(effects)
  toRun.forEach((eff) => eff())
}

/**
 * Run the given function immediately and re-run it whenever any of its reactive
 * dependencies change. Returns a stop function (currently a noop placeholder).
 *
 * @param fn - The side-effect function to track and re-run.
 * @returns A function to stop the effect (no-op in current implementation).
 */
export function watchEffect(fn: EffectFn): () => void {
  const runner = () => {
    try {
      effectStack.push(fn)
      activeEffect = fn
      fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1] ?? null
    }
  }
  runner()
  // Return stop function
  return () => {
    // naive stop: clear all registrations for this fn
    //targetMap.forEach((depsMap) => {
    //  depsMap.forEach((dep) => dep.delete(fn))
    //})
  }
}

export const createEffect = <Value>(value: Value, subscribe: (el: ReactiveElement) => unknown): Effect<Value> =>
  Object.defineProperty({ value } as Effect<Value>, REF_SYMBOL, {
    enumerable: false,
    get: () => subscribe,
  })
