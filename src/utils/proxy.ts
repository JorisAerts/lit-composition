import { property } from 'lit/decorators.js'
import type { PropertyDeclaration } from 'lit'
import { NotAllowedException } from '../exception'

const PROXY_SYMBOL = Symbol('proxy')
type Proxy<T> = T & { [PROXY_SYMBOL]: T }

// eslint-disable-next-line @typescript-eslint/unbound-method
export const createProxy = <T extends object>(obj: T, { get, set }: ProxyHandler<T>) =>
  new Proxy<T>(obj, {
    get(target, prop, receiver) {
      if (prop === PROXY_SYMBOL) {
        return obj
      }
      return (get?.(target, prop, receiver) as T) ?? Reflect.get(target, prop, receiver)
    },
    set(target, prop, newValue, receiver) {
      if (prop === PROXY_SYMBOL) {
        throw new NotAllowedException()
      }
      set?.(target, prop, newValue, receiver)
      return Reflect.set(target, prop, receiver)
    },
  }) as Proxy<T>

//
export function reactiveProperty(options?: PropertyDeclaration) {
  return property(options)
}
