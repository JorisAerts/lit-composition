import { Signal } from '@lit-labs/signals'
import { REACTIVE_OBJECT_SYMBOL } from '../symbols'
import { isObject } from '../utils/is'

type Reactive<T> = T extends object //
  ? {
      [K in keyof T]: T[K] extends Signal.State<infer V> //
        ? V
        : T[K] extends (...args: any[]) => unknown
          ? T[K]
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
        const ref = Signal.isState(value)
        let get: () => T[keyof T]
        let set: (value: T[keyof T]) => void

        if (ref) {
          const state = value as Signal.State<T[keyof T]>
          set = state.set.bind(state)
          get = state.get.bind(state)
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
          enumerable: props.enumerable ?? true,
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
