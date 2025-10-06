export { getCurrentInstance } from './currentInstance'
export * from './utils'
export * from './defineElement'
export * from './reactivity'

/**
 * The ref() directive is a Lit directive that creates a reactive reference to a DOM node.
 * It's exported as $ref for convenience.
 */
export { ref as $ref } from 'lit/directives/ref.js'
