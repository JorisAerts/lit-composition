import type { LitElement } from 'lit'
import { DEFINE_COMPONENT_OPTIONS_SYMBOL } from './symbols'
import type { Fn } from './utils/types'

interface DefinedComponentInstance<Options = Record<string, unknown>> extends LitElement {
  [DEFINE_COMPONENT_OPTIONS_SYMBOL]: Options
}

let currentInstance: unknown = null

/**
 * Set the current instance of a LitElement, _not_ exported.
 * @param instance the instance to set as current
 */
const setCurrentInstance = <T extends LitElement>(instance: T) => (currentInstance = instance)

/**
 * Get the current instance of a LitElement.
 * There is only one thread of execution, so there is only one current instance at a time.
 */
export const getCurrentInstance = <T extends LitElement>() => currentInstance as T

/**
 * Execute a callback within the given "current instance" scope
 * @param instance the getCurrentInstance() instance to use
 * @param callback the callback to execute with the current instance
 */
export const withCurrentInstance = <T extends LitElement, Result>(instance: T, callback: Fn<[], Result>): Result => {
  const old = getCurrentInstance<T>()
  try {
    setCurrentInstance(instance)
    return callback()
  } finally {
    setCurrentInstance(old)
  }
}

/**
 * Get the options of the current LitElement.
 * These are internal storage for storing hook callbacks.
 */
export const getCurrentOptions = <
  //
  Options extends {},
  Element extends DefinedComponentInstance<Options> = LitElement & { [DEFINE_COMPONENT_OPTIONS_SYMBOL]: Options },
>(): Options => getCurrentInstance<Element>()?.[DEFINE_COMPONENT_OPTIONS_SYMBOL]
