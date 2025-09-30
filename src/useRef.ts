/**
 * Reactive primitives for lit-composition: useRef, computed, and a minimal effect/dependency system.
 *
 * What this file does
 * - Exposes:
 *   - useRef<T>: creates a mutable reactive reference with a .value property.
 *   - computed<T>: creates a lazily-evaluated, cached value derived from other refs.
 *   - effect(fn): runs a function and tracks which refs/computed values it reads so it can re-run when they change.
 * - Implements a very small reactive runtime using dependency tracking (track) and invalidation (trigger).
 * - Integrates with the current component instance by calling instance.requestUpdate when a tracked value changes,
 *   so UI re-renders are scheduled automatically.
 *
 * How it works (high level)
 * - When an effect is running, any reactive reads (e.g., ref.value or computed.value) call track(target,key).
 *   This records the currently active effect as a dependency of that target/key pair.
 * - When a reactive value changes, trigger(target,key) looks up all dependent effects and re-runs them.
 * - useRef defines a getter/setter around an internal value, tracking on read and triggering on write.
 * - computed wraps a getter function:
 *   - It caches the last computed value and marks itself "dirty" whenever any of its dependencies change.
 *   - On next read, if dirty, it recomputes, updates cache, and triggers to notify dependents.
 * - requestUpdate ties the reactive changes to the Lit component lifecycle.
 *
 * Important details
 * - activeEffect/effectStack: manages which effect is currently collecting dependencies.
 * - targetMap: WeakMap<object, Map<PropertyKey, Set<EffectFn>>> maps each target object and key to a set of effects.
 * - track: if an effect is active, register it in targetMap[target][key].
 * - trigger: copy and invoke the effects registered for target/key.
 * - useRef:
 *   - get: track(object,'value') then return the internal value.
 *   - set: if changed, update the internal value, call instance.requestUpdate, then trigger(object,'value').
 * - computed:
 *   - Maintains a local cached value and dirty flag.
 *   - An internal effect() runs the user getter to collect its dependencies. When any dep changes, that effect runs
 *     again, setting dirty = true and trigger-ing its own 'value' so readers know it changed.
 *   - The public getter lazily recomputes when dirty and triggers updates when the cached value actually changes.
 * - Equality checks use Object.is to avoid unnecessary updates and to handle -0/NaN correctly.
 *
 * Usage examples (pseudo-code)
 *   const count = useRef(0)
 *   const double = computed(() => count.value * 2)
 *   effect(() => {
 *     console.log('double is', double.value) // runs once, then re-runs when count.value changes
 *   })
 *   count.value++ // schedules component update and re-runs the effect
 */
import { getCurrentInstance } from './currentInstance'

export interface UseRef<T> {
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

export function effect(fn: EffectFn): () => void {
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

export const useRef = <T>(value: T) => {
  const object = { value } as { value: T } as UseRef<T>
  // Track component instances that read this ref so we can notify all of them on change
  const subscribers = new Set<any>()

  Object.defineProperty(object, 'value', {
    configurable: false,
    get: () => {
      track(object, 'value')
      const instance = getCurrentInstance()
      if (instance) subscribers.add(instance)
      return value
    },
    set: (v: T) => {
      const old = value
      if (Object.is(old, v)) return
      value = v
      // Notify all subscribed component instances
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
      subscribers.forEach((inst) => inst.requestUpdate?.(undefined, old))
      // Notify effects
      trigger(object, 'value')
    },
  })
  return object
}

export type ComputedGetter<T> = () => T
export type ComputedSetter<T> = (v: T) => void
export interface ComputedRef<T> extends UseRef<T> {}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(options: { get: ComputedGetter<T>; set?: ComputedSetter<T> }): ComputedRef<T>
export function computed<T>(
  arg: ComputedGetter<T> | { get: ComputedGetter<T>; set?: ComputedSetter<T> }
): ComputedRef<T> {
  const getFn: ComputedGetter<T> = typeof arg === 'function' ? arg : arg.get
  const setFn: ComputedSetter<T> | undefined = typeof arg === 'function' ? undefined : arg.set

  let dirty = true
  let cached: T

  // A dummy ref-like target to host dependency for 'value'
  const target = {} as { value: T }
  // Track components that consume this computed value
  const subscribers = new Set<any>()

  const notifySubscribers = (old?: T) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    subscribers.forEach((inst) => inst.requestUpdate?.(undefined, old))
  }

  const recompute = () => {
    const old = cached
    cached = getFn()
    dirty = false
    if (!Object.is(old, cached)) {
      notifySubscribers(old)
      trigger(target, 'value')
    }
  }

  // Track dependencies of getter via effect
  effect(() => {
    // When dependencies change, mark as dirty
    // We read them within an effect to register the dep graph.
    getFn()
    dirty = true
    // Notify readers (both effects and components) that value became stale/changed
    notifySubscribers()
    trigger(target, 'value')
  })

  const obj = {} as ComputedRef<T>
  Object.defineProperty(obj, 'value', {
    configurable: false,
    get: () => {
      track(target, 'value')
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
      trigger(target, 'value')
    },
  })
  return obj
}
