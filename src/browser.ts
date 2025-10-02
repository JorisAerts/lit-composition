import type { ValidCustomElementName } from './types'

export const defineCustomElement = (name: ValidCustomElementName, constructor: CustomElementConstructor) =>
  customElements.define(name, constructor)
