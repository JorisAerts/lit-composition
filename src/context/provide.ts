import { type Context, ContextProvider, type ContextType } from '@lit/context'
import { getCurrentInstance } from '../currentInstance'

export const provide = <Value, C extends Context<Value, Value>>(context: C, initialValue: ContextType<C>) =>
  new ContextProvider(getCurrentInstance(), { context, initialValue })
