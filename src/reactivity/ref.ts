import type { ReactiveElement } from 'lit'
import { getCurrentInstance } from '../currentInstance'
import { REF_SYMBOL } from '../symbols'
import type { Effect } from './effect'
import { createEffect, track, trigger, VALUE } from './effect'

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
