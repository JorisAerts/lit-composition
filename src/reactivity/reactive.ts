import { REACTIVE_OBJECT_SYMBOL } from '../symbols.js'
import type { Effect } from './effect.js'
import { isRef } from './effect.js'
import { isObject } from '../utils/is.js'

type Reactive<T> = T extends object //
  ? {
      [K in keyof T]: T[K] extends Effect<infer V> //
        ? V
        : T[K] extends object
          ? Reactive<T[K]>
          : T[K]
    }
  : T

/**
 * Check if a value is a reactive proxy created by reactive().
 *
 * @typeParam T - The target object type.
 * @param target - The value to test.
 * @returns True if the value is a reactive object produced by reactive().
 */
export const isReactive = <T extends {}>(target: T): target is Reactive<never> =>
  REACTIVE_OBJECT_SYMBOL in target && target[REACTIVE_OBJECT_SYMBOL] === REACTIVE_OBJECT_SYMBOL

/**
 * Turn an object containing Effects into a reactive object.
 * @param target
 * @param deep - if true, recursively make all properties reactive
 */
export const reactive = <T extends {}>(target: T, deep = true): Reactive<T> => {
  if (isReactive(target)) {
    return target
  }
  return Object.defineProperties(
    Object.create({}) as Reactive<T>,
    Object.entries(target).reduce(
      (result, [key, value]) => {
        const k = key as keyof T
        const props = Object.getOwnPropertyDescriptor(target, key)!
        const isWritable = props.writable ?? true
        const ref = isRef(value)
        let get: () => T[keyof T]
        let set: (value: T[keyof T]) => void

        if (ref) {
          set = (newValue) => (value.value = newValue)
          get = () => value.value as T[keyof T]
        } else if (isObject(value)) {
          set = (newValue) => (target[k] = newValue)
          get = deep //
            ? () => reactive(target[k] as {}, deep) as T[keyof T]
            : () => target[k]
        } else {
          set = (newValue) => (target[k] = newValue)
          get = () => target[k]
        }

        delete props.writable
        delete props.value

        result[key] = {
          ...props,
          configurable: false,
          get,
          set: isWritable ? set : undefined,
        }
        return result
      },
      {
        [REACTIVE_OBJECT_SYMBOL]: {
          value: REACTIVE_OBJECT_SYMBOL,
          enumerable: false,
          writable: false,
          configurable: false,
        },
      } as PropertyDescriptorMap
    )
  )
}
