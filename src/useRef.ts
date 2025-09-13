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
  const instance = getCurrentInstance()
  Object.defineProperty(object, 'value', {
    configurable: false,
    get: () => {
      track(object, 'value')
      return value
    },
    set: (v: T) => {
      const old = value
      if (Object.is(old, v)) return
      value = v
      instance.requestUpdate(undefined, old)
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
  const instance = getCurrentInstance()
  const getFn: ComputedGetter<T> = typeof arg === 'function' ? arg : arg.get
  const setFn: ComputedSetter<T> | undefined = typeof arg === 'function' ? undefined : arg.set

  let dirty = true
  let cached: T

  // A dummy ref-like target to host dependency for 'value'
  const target = {} as { value: T }

  const recompute = () => {
    const old = cached
    cached = getFn()
    dirty = false
    if (!Object.is(old, cached)) {
      instance.requestUpdate(undefined, old)
      trigger(target, 'value')
    }
  }

  // Track dependencies of getter via effect
  effect(() => {
    // When dependencies change, mark as dirty
    // We read them within an effect to register the dep graph.
    getFn()
    dirty = true
    // Notify readers that value became stale/changed
    trigger(target, 'value')
  })

  const obj = {} as ComputedRef<T>
  Object.defineProperty(obj, 'value', {
    configurable: false,
    get: () => {
      track(target, 'value')
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
      trigger(target, 'value')
    },
  })
  return obj
}
