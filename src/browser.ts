import type { ValidCustomElementName } from './types'

export const registerCustomElement = (name: ValidCustomElementName, constructor: CustomElementConstructor) =>
  customElements.define(name, constructor)
