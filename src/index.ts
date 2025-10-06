export { getCurrentInstance } from './currentInstance'
export { mixin, type Mixin, $ref } from './utils'

export * from './defineElement'
export * from './reactivity'
export * from './utils/mixin'

export type * from './defineElement'

export {
  onConnected,
  onDisconnected,
  onShouldUpdate,
  onWillUpdate,
  onFirstUpdated,
  onUpdated,
  onPerformUpdate,
  onUpdate,
} from './defineElement/hooks'
