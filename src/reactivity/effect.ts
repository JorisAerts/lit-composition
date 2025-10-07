import { getCurrentInstance } from '../currentInstance'
import { isArray, isFunction, isObject } from '../utils/is'
import { REF_SYMBOL } from '../symbols'
import type { ReactiveElement } from 'lit'
import type { Fn } from '../utils/types'

const VALUE = 'value'

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

const createEffect = <Value>(value: Value, subscribe: (el: ReactiveElement) => unknown): Effect<Value> =>
  Object.defineProperty({ value } as Effect<Value>, REF_SYMBOL, {
    enumerable: false,
    get: () => subscribe,
  })

/**
 * Create a reactive reference that holds a value.
 * Reading `ref.value` tracks dependencies; writing to it notifies dependents.
 *
 * Note: This ref also integrates with Lit elements by requesting updates
 * from any component that reads the value during a render cycle.
 *
 * @typeParam T - The wrapped value type.
 * @param value - The initial value.
 * @returns A reactive ref object with a `value` property.
 */
export const useRef = <T>(value: T) => {
  const subscribers = new Set<ReactiveElement>()
  const object = createEffect(value, (instance) => subscribers.add(instance))
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

export const takeRef = <Value>(element: ReactiveElement, ref: Effect<Value>): typeof ref => {
  ;(ref[REF_SYMBOL] as (el: ReactiveElement) => unknown)(element) as Effect<Value>
  return ref
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
 * Create a computed reference from a getter or from an object with get/set.
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
  let initialized = false

  const subscribers = new Set<ReactiveElement>()
  const target = {}

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

  // Track dependencies of getter via effect; recompute and only notify on change
  watchEffect(() => {
    const next = getFn()
    if (!initialized) {
      // first compute: establish cache without notifying dependents
      cached = next
      initialized = true
      dirty = false
      return
    }
    const old = cached
    if (!Object.is(old, next)) {
      cached = next
      dirty = false
      // Only notify when the computed value actually changed
      notifySubscribers(old)
      trigger(target, VALUE)
    } else {
      dirty = false
    }
  })

  const obj = createEffect<T | undefined>(undefined, (instance) => subscribers.add(instance)) as ComputedRef<T>
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
      // Recompute and notifications are handled by the dependency effect.
    },
  })
  return obj
}

/** A source for watch: a ref or a getter function. */
export type WatchSource<T> = Effect<T> | (() => T)

/** Stop handle for a watcher. */
export type WatchStopHandle = () => void

/** Options for watch. */
export interface WatchOptions {
  /** Whether to invoke the callback immediately with the current value(s). */
  immediate?: boolean
}

const resolveSourceValue = <T>(src: WatchSource<T>): T => (isRef(src) ? src.value : (src as () => T)())

const hasArrayChanged = (a: unknown[], b: unknown[]) => a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))

const isArrayOfWatchSource = (x: unknown): x is WatchSource<unknown>[] => isArray(x)

/**
 * Watch one or multiple reactive sources (ref(s) or getter function(s)) and call `cb`
 * when the value(s) change. Returns a stop function.
 *
 * - watch(ref, (newVal, oldVal) => {})
 * - watch(getter, (newVal, oldVal) => {})
 * - watch([ref1, getter2], ([new1, new2], [old1, old2]) => {})
 */
export function watch<T>(
  source: WatchSource<T>,
  cb: (newVal: T, oldVal: T | undefined) => void,
  options?: WatchOptions
): WatchStopHandle
export function watch<T extends unknown[]>(
  source: { [K in keyof T]: WatchSource<T[K]> },
  cb: (newVal: T, oldVal: T | undefined) => void,
  options?: WatchOptions
): WatchStopHandle
export function watch(
  source: WatchSource<unknown> | WatchSource<unknown>[],
  cb: (newVal: unknown, oldVal: unknown) => void,
  options?: WatchOptions
): WatchStopHandle {
  const getter = isArrayOfWatchSource(source)
    ? () => source.map((s) => resolveSourceValue(s))
    : () => resolveSourceValue(source)

  const clone = (val: unknown) => (isArray(val) ? val.slice() : val)

  let oldVal: unknown
  let initialized = false

  const runner = () => {
    const newVal = getter()
    if (!initialized) {
      initialized = true
      if (options?.immediate) {
        cb(newVal, undefined)
      }
      oldVal = clone(newVal)
      return
    }
    const changed = isArray(newVal) && isArray(oldVal) ? hasArrayChanged(newVal, oldVal) : !Object.is(newVal, oldVal)
    if (changed) {
      const prev = oldVal
      oldVal = clone(newVal)
      cb(newVal, prev)
    }
  }
  // return stop-handle
  return watchEffect(runner)
}
