import type { CSSResultGroup, PropertyDeclaration, PropertyValues } from 'lit'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import type { Mixin } from './utils'
import { dummyFn } from './utils'
import type { Class } from './types'
import { isFunction, isUndefined } from './utils/is'
import { getCurrentInstance, getCurrentOptions, setCurrentInstance } from './currentInstance'
import { DEFINE_COMPONENT_OPTIONS } from './symbols'

type ExtractProperties<Props extends Record<string, PropertyDeclaration>> = {
  [K in keyof Props]: Props[K] extends PropertyDeclaration
    ? Props[K]['type'] extends Class<infer Type>
      ? Type
      : Props[K]['type']
    : never
}

type LitRender = LitElement['render']

type ChangedPropertiesPredicate<DefinedComponents extends LitElement> = (
  changedProperties: PropertyValues<DefinedComponents>
) => boolean

type ChangedPropertiesConsumer<DefinedComponents extends LitElement> = (
  changedProperties: PropertyValues<DefinedComponents>
) => void

interface InternalOptions<DefinedComponents extends LitElement> {
  render: LitRender
  connectedCallback: FnSubscriber<() => void>
  disconnectedCallback: FnSubscriber<() => void>
  performUpdate: FnSubscriber<() => void>
  shouldUpdate: FnSubscriber<ChangedPropertiesPredicate<DefinedComponents>>
  willUpdate: FnSubscriber<ChangedPropertiesPredicate<DefinedComponents>>
  update: FnSubscriber<ChangedPropertiesConsumer<DefinedComponents>>
  firstUpdated: FnSubscriber<ChangedPropertiesConsumer<DefinedComponents>>
  updated: FnSubscriber<ChangedPropertiesConsumer<DefinedComponents>>
}

interface DefinePropertyDeclaration<T = unknown> extends PropertyDeclaration {
  default?: T | (() => T)
}

const assignDefaultValues = <T extends HTMLElement>(obj: T, props?: Record<string, DefinePropertyDeclaration>) =>
  props &&
  Object.entries(props).forEach(([key, prop]: [unknown, DefinePropertyDeclaration]) => {
    if (isUndefined(prop.default)) return
    const value = (isFunction(prop.default) ? prop.default.call(null) : prop.default) as T[keyof T]
    obj[key as keyof T] ??= value
  })

type SomeFunction = (...args: unknown[]) => unknown

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fnSubscriber = <FN extends (...args: any[]) => unknown>() => {
  const subscribers = [] as FN[]
  return {
    add: (fn: FN) => subscribers.push(fn),
    run: (t: unknown, ...args: Parameters<FN>) => subscribers.map((fn) => fn.apply(t, args)),
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FnSubscriber<T extends (...args: any[]) => unknown> = ReturnType<typeof fnSubscriber<T>>

export const onConnected = <Type extends DefinedComponentInstance>(cb: SomeFunction) => {
  getCurrentOptions<InternalOptions<Type>>().connectedCallback.add(cb)
}

type ComponentName = `${string}-${string}`

export const defineComponent = <
  Name extends ComponentName = ComponentName,
  Properties extends Record<string, DefinePropertyDeclaration> = Record<string, DefinePropertyDeclaration>,
  Styles extends CSSResultGroup = CSSResultGroup,
  Mixins extends Mixin<unknown>[] = Mixin<unknown>[],
  Parent extends typeof LitElement = typeof LitElement,
  Instance extends InstanceType<Parent> = InstanceType<Parent> & ExtractProperties<Properties> & {},
  Render extends (this: Instance) => unknown = (this: Instance) => unknown,
  Setup extends (this: Instance, comp?: Instance) => void | Render = (this: Instance, comp?: Instance) => void | Render,
>(options: {
  name: Name
  parent?: typeof LitElement
  styles?: Styles
  props?: Properties
  mixins?: Mixins

  shadowRoot?: boolean

  setup?: Setup
  render?: Render
}) => {
  options = Object.create(options) as typeof options

  const { name, parent: BaseClass = LitElement } = options
  const render = options.render ?? dummyFn

  @customElement(name)
  class DefinedComponent extends BaseClass {
    /** @internal */
    [DEFINE_COMPONENT_OPTIONS]: InternalOptions<this> = {
      render,
      connectedCallback: fnSubscriber(),
      disconnectedCallback: fnSubscriber(),
      willUpdate: fnSubscriber<ChangedPropertiesPredicate<typeof this>>(),
      performUpdate: fnSubscriber(),
      shouldUpdate: fnSubscriber<ChangedPropertiesPredicate<typeof this>>(),
      update: fnSubscriber<ChangedPropertiesConsumer<typeof this>>(),
      firstUpdated: fnSubscriber<ChangedPropertiesConsumer<typeof this>>(),
      updated: fnSubscriber<ChangedPropertiesConsumer<typeof this>>(),
    }

    static properties = options.props ?? ({} as Properties)
    static styles = options.styles ?? undefined

    protected createRenderRoot(): HTMLElement | DocumentFragment {
      return options.shadowRoot === false ? this : super.createRenderRoot()
    }

    private get __opts() {
      return this[DEFINE_COMPONENT_OPTIONS]
    }

    constructor() {
      super()
      const old = getCurrentInstance()
      setCurrentInstance(this)
      const setupResult = options.setup?.call(this as unknown as Instance, this as unknown as Instance)
      this.__opts.render = isFunction(setupResult) //
        ? setupResult
        : (options.render ?? super.render.bind(this) ?? dummyFn)
      assignDefaultValues(this, options.props)
      setCurrentInstance(old)
    }

    render() {
      return this.__opts.render?.call(this)
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

  return DefinedComponent
}

type DefinedComponent = ReturnType<typeof defineComponent>
type DefinedComponentInstance = InstanceType<DefinedComponent>
