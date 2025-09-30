import { getCurrentInstance } from './currentInstance'
import { isFunction } from './utils/is.js'
import type { ReactiveElement } from 'lit'

const VALUE = 'value'

export interface Effect<T> {
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

export const useRef = <T>(value: T) => {
  const object = { value } as { value: T } as Effect<T>
  // Track component instances that read this ref so we can notify all of them on change
  const subscribers = new Set<any>()

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
      subscribers.forEach((inst) => inst.requestUpdate?.(undefined, old))
      // Notify effects
      trigger(object, VALUE)
    },
  })
  return object
}

export type ComputedGetter<T> = () => T
export type ComputedSetter<T> = (v: T) => void
export interface ComputedRef<T> extends Effect<T> {}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(options: { get: ComputedGetter<T>; set?: ComputedSetter<T> }): ComputedRef<T>
export function computed<T>(
  arg: ComputedGetter<T> | { get: ComputedGetter<T>; set?: ComputedSetter<T> }
): ComputedRef<T> {
  const getFn: ComputedGetter<T> = isFunction(arg) ? arg : arg.get
  const setFn: ComputedSetter<T> | undefined = isFunction(arg) ? undefined : arg.set

  let dirty = true
  let cached: T

  // A dummy ref-like target to host dependency for VALUE
  const target = {} as { value: T }
  // Track components that consume this computed value
  const subscribers = new Set<unknown>()

  const notifySubscribers = (old?: T) => {
    subscribers.forEach((inst) => (inst as ReactiveElement).requestUpdate?.(undefined, old))
  }

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
