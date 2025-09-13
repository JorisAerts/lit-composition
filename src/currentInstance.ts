import type { LitElement } from 'lit'
import { DEFINE_COMPONENT_OPTIONS } from './symbols'

interface DefinedComponentInstance<Options = Record<string, unknown>> extends LitElement {
  [DEFINE_COMPONENT_OPTIONS]: Options
}

let currentInstance: unknown = null

export const setCurrentInstance = <T extends LitElement>(instance: T) => (currentInstance = instance)
export const getCurrentInstance = <T extends LitElement>() => currentInstance as T

export const getCurrentOptions = <
  //
  Options extends {},
  Element extends DefinedComponentInstance<Options> = LitElement & { [DEFINE_COMPONENT_OPTIONS]: Options },
>(): Options => getCurrentInstance<Element>()?.[DEFINE_COMPONENT_OPTIONS]
