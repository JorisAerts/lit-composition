import { isFunction } from '../utils/is'
import type { Effect } from './effect'
import { createEffect, track, trigger, VALUE, watchEffect } from './effect'
import type { ReactiveElement } from 'lit'
import { getCurrentInstance } from '../currentInstance'

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
