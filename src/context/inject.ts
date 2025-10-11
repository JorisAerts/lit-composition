import { type Context, ContextConsumer } from '@lit/context'
import { getCurrentInstance } from '../currentInstance'

export const consume = <Value, C extends Context<Value, Value>>(context: C) =>
  new ContextConsumer(getCurrentInstance(), { context, subscribe: true })
