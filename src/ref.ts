import { getCurrentInstance } from './currentInstance'

export interface Ref<T> {
  value: T
}

export const ref = <T>(value: T) => {
  const object = { value } as { value: T } as Ref<T>
  const instance = getCurrentInstance()
  Object.defineProperty(object, 'value', {
    configurable: false,
    get: () => {
      return value
    },
    set: (v: T) => {
      const old = value
      value = v
      instance.requestUpdate(undefined, old)
    },
  })
  return object
}
