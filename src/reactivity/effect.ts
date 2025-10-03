import { getCurrentInstance } from '../currentInstance'
import { isFunction, isObject } from '../utils/is'
import { REF_SYMBOL } from '../symbols'
import type { ReactiveElement } from 'lit'

const VALUE = 'value'

/**
 * A reactive reference that wraps a value and exposes it via the `value` property.
 * Reading/writing `value` participates in the dependency tracking system.
 *
 * @typeParam T - The wrapped value type.
 */
export interface Effect<T> {
  [REF_SYMBOL]: typeof REF_SYMBOL
  value: T
}

type EffectFn = () => void

let activeEffect: EffectFn | null = null
const effectStack: EffectFn[] = []

const targetMap = new WeakMap<object, Map<PropertyKey, Set<EffectFn>>>()

function track(target: object, key: PropertyKey) {
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

function trigger(target: object, key: PropertyKey) {
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

/**
 * Determine whether a value is a reactive ref (Effect).
 *
 * @param value - The value to test.
 * @returns True if the value is a ref created by useRef or computed.
 */
export const isRef = (value: unknown): value is Effect<unknown> => isObject(value) && REF_SYMBOL in value

const createEffect = <Value>(value: Value): Effect<Value> => ({
  [REF_SYMBOL]: REF_SYMBOL,
  value,
})

/**
 * Create a reactive reference that holds a value.
 * Reading `ref.value` tracks dependencies; writing to it notifies dependents.
 *
 * Note: This ref also integrates with Lit elements by requesting updates
 * from any component that read the value during a render cycle.
 *
 * @typeParam T - The wrapped value type.
 * @param value - The initial value.
 * @returns A reactive ref object with a `value` property.
 */
export const useRef = <T>(value: T) => {
  const object = createEffect(value)
  const subscribers = new Set<ReactiveElement>()
  Object.defineProperty(object, VALUE, {
    configurable: false,
    get: () => {
      track(object, VALUE)
      const instance = getCurrentInstance()
      if (instance) subscribers.add(instance)
      return value
    },
    set: (v: T) => {
      const old = value
      if (Object.is(old, v)) return
      value = v
      // Notify all subscribed component instances
      subscribers.forEach((inst) => inst.requestUpdate?.(undefined, old))
      // Notify effects
      trigger(object, VALUE)
    },
  })
  return object
}

/**
 * A function that returns the current computed value.
 * It will be re-evaluated when its dependencies change.
 */
export type ComputedGetter<T> = () => T

/** A function that updates the underlying state for a writable computed ref. */
export type ComputedSetter<T> = (v: T) => void

/** A read-only or writable computed reference. */
export interface ComputedRef<T> extends Effect<T> {}

/**
 * Create a computed reference from a getter, or from an object with get/set.
 * The getter is tracked; consumers reading `.value` will update when deps change.
 *
 * @typeParam T - The computed value type.
 * @param getter - The getter function producing the value.
 * @returns A computed ref.
 */
export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
/** Create a writable computed reference. */
export function computed<T>(options: { get: ComputedGetter<T>; set?: ComputedSetter<T> }): ComputedRef<T>
export function computed<T>(
  arg: ComputedGetter<T> | { get: ComputedGetter<T>; set?: ComputedSetter<T> }
): ComputedRef<T> {
  const getFn: ComputedGetter<T> = isFunction(arg) ? arg : arg.get
  const setFn: ComputedSetter<T> | undefined = isFunction(arg) ? undefined : arg.set

  let dirty = true
  let cached: T

  const target = createEffect<T | undefined>(undefined)
  const subscribers = new Set<ReactiveElement>()

  const notifySubscribers = (
    old?: T //
  ) => subscribers.forEach((inst) => inst.requestUpdate?.(undefined, old))

  const recompute = () => {
    const old = cached
    cached = getFn()
    dirty = false
    if (!Object.is(old, cached)) {
      notifySubscribers(old)
      trigger(target, VALUE)
    }
  }

  // Track dependencies of getter via effect
  watchEffect(() => {
    // When dependencies change, mark as dirty
    // We read them within an effect to register the dep graph.
    getFn()
    dirty = true
    // Notify readers (both effects and components) that value became stale/changed
    notifySubscribers()
    trigger(target, VALUE)
  })

  const obj = {} as ComputedRef<T>
  Object.defineProperty(obj, VALUE, {
    configurable: false,
    get: () => {
      track(target, VALUE)
      const instance = getCurrentInstance()
      if (instance) subscribers.add(instance)
      if (dirty) {
        recompute()
      }
      return cached
    },
    set: (v: T) => {
      if (!setFn) return
      setFn(v)
      // After a write through setter, mark as dirty and schedule recompute on next get
      dirty = true
      notifySubscribers()
      trigger(target, VALUE)
    },
  })
  return obj
}
