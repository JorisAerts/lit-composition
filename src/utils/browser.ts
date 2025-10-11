import type { ValidCustomElementName } from './ValidCustomElementName'

export const registerCustomElement = (name: ValidCustomElementName, constructor: CustomElementConstructor) =>
  customElements.define(name, constructor)
