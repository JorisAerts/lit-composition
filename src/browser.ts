import type { ValidCustomElementName } from './types.js'

export const defineCustomElement = (name: ValidCustomElementName, constructor: CustomElementConstructor) =>
  customElements.define(name, constructor)
