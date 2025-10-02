import { isObject } from '../utils/is.js'

type Reactive<T> = T extends object //
  ? {
      [K in keyof T]: T[K] extends object //
        ? Reactive<T[K]>
        : T[K]
    }
  : T

export const reactive = <T extends {}>(target: T): Reactive<T> =>
  Object.fromEntries(
    Object.entries(target).map((val) => {
      if (isObject(val[1])) {
        return [val[0], reactive(val[1])]
      }
      return val
    })
  ) as Reactive<T>
