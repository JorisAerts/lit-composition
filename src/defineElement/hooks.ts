import type { LitElement } from 'lit'
import { type PropertyValues, type ReactiveElement } from 'lit'
import { DEFINE_COMPONENT_OPTIONS_SYMBOL } from '../symbols'
import { getCurrentOptions } from '../currentInstance'
import { dummyFn } from '../utils/dummyFn'

type LitRender = LitElement['render']

interface InternalOptions<DefinedComponents extends ReactiveElement> {
  render: LitRender
  connectedCallback: FnSubscriber<() => void>
  disconnectedCallback: FnSubscriber<() => void>
  performUpdate: FnSubscriber<() => void>
  shouldUpdate: FnSubscriber<ChangedPropertiesPredicate<DefinedComponents>>
  willUpdate: FnSubscriber<ChangedPropertiesConsumer<DefinedComponents>>
  update: FnSubscriber<ChangedPropertiesConsumer<DefinedComponents>>
  firstUpdated: FnSubscriber<ChangedPropertiesConsumer<DefinedComponents>>
  updated: FnSubscriber<ChangedPropertiesConsumer<DefinedComponents>>
}

type ChangedPropertiesPredicate<DefinedComponents extends ReactiveElement> = (
  changedProperties: PropertyValues<DefinedComponents>
) => boolean

type ChangedPropertiesConsumer<DefinedComponents extends ReactiveElement> = (
  changedProperties: PropertyValues<DefinedComponents>
) => void

const fnSubscriber = <FN extends (...args: any[]) => unknown>() => {
  const subscribers = [] as FN[]
  return {
    add: (fn: FN) => subscribers.push(fn),
    run: (t: unknown, ...args: Parameters<FN>) => subscribers.map((fn) => fn.apply(t, args)),
  }
}

type FnSubscriber<T extends (...args: any[]) => unknown> = ReturnType<typeof fnSubscriber<T>>

export const withHooks = <
  Base extends new (...args: any[]) => LitElement,
  Result = new () => LitElement &
    InstanceType<Base> & {
      __opts: InternalOptions<InstanceType<Base>>
    },
>(
  Base: Base
): Result => {
  abstract class Mixin extends Base {
    /** @internal */
    [DEFINE_COMPONENT_OPTIONS_SYMBOL]: InternalOptions<this> = {
      render: dummyFn,
      connectedCallback: fnSubscriber(),
      disconnectedCallback: fnSubscriber(),
      willUpdate: fnSubscriber<ChangedPropertiesConsumer<typeof this>>(),
      performUpdate: fnSubscriber(),
      shouldUpdate: fnSubscriber<ChangedPropertiesPredicate<typeof this>>(),
      update: fnSubscriber<ChangedPropertiesConsumer<typeof this>>(),
      firstUpdated: fnSubscriber<ChangedPropertiesConsumer<typeof this>>(),
      updated: fnSubscriber<ChangedPropertiesConsumer<typeof this>>(),
    }

    protected get __opts() {
      return this[DEFINE_COMPONENT_OPTIONS_SYMBOL]
    }

    connectedCallback() {
      super.connectedCallback()
      return this.__opts.connectedCallback.run(this)
    }

    disconnectedCallback() {
      super.disconnectedCallback()
      return this.__opts.disconnectedCallback.run(this)
    }

    protected willUpdate(_changedProperties: PropertyValues<this>) {
      super.willUpdate(_changedProperties)
      return this.__opts.willUpdate.run(this, _changedProperties)
    }

    protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
      return (
        super.shouldUpdate(_changedProperties) || this.__opts.shouldUpdate.run(this, _changedProperties)?.some(Boolean)
      )
    }

    protected updated(_changedProperties: PropertyValues<this>) {
      super.updated(_changedProperties)
      return this.__opts.updated.run(this, _changedProperties)
    }

    protected firstUpdated(_changedProperties: PropertyValues<this>) {
      super.firstUpdated(_changedProperties)
      return this.__opts.firstUpdated.run(this, _changedProperties)
    }

    protected performUpdate() {
      super.performUpdate()
      return this.__opts.performUpdate.run(this)
    }
  }
  return Mixin as unknown as Result
}

type SomeFunction = (...args: unknown[]) => unknown

export const onConnected = <Type extends LitElement>(cb: SomeFunction) =>
  getCurrentOptions<InternalOptions<Type>>().connectedCallback.add(cb)
export const onDisconnected = <Type extends LitElement>(cb: SomeFunction) =>
  getCurrentOptions<InternalOptions<Type>>().disconnectedCallback.add(cb)
export const onShouldUpdate = <Type extends LitElement>(cb: ChangedPropertiesPredicate<Type>) =>
  getCurrentOptions<InternalOptions<Type>>().shouldUpdate.add(cb)
export const onWillUpdate = <Type extends LitElement>(cb: ChangedPropertiesConsumer<Type>) =>
  getCurrentOptions<InternalOptions<Type>>().willUpdate.add(cb)
export const onPerformUpdate = <Type extends LitElement>(cb: SomeFunction) =>
  getCurrentOptions<InternalOptions<Type>>().performUpdate.add(cb)
export const onUpdate = <Type extends LitElement>(cb: ChangedPropertiesConsumer<Type>) =>
  getCurrentOptions<InternalOptions<Type>>().update.add(cb)
export const onFirstUpdated = <Type extends LitElement>(cb: ChangedPropertiesConsumer<Type>) =>
  getCurrentOptions<InternalOptions<Type>>().firstUpdated.add(cb)
export const onUpdated = <Type extends LitElement>(cb: ChangedPropertiesConsumer<Type>) =>
  getCurrentOptions<InternalOptions<Type>>().updated.add(cb)
