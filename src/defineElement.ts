import type { CSSResultGroup, PropertyDeclaration } from 'lit'
import { LitElement } from 'lit'
import { dummyFn } from './utils'
import type { Class } from './types'
import { isFunction, isString, isUndefined } from './utils/is'
import { getCurrentInstance, setCurrentInstance } from './currentInstance'
import { withHooks } from './hooks'

type ExtractProperties<Props extends Record<string, PropertyDeclaration>> = {
  [K in keyof Props]: Props[K] extends PropertyDeclaration
    ? Props[K]['type'] extends Class<infer Type>
      ? Type
      : Props[K]['type']
    : never
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

// END-OF-HOOKS

type ValidHtmlTagName = `${string}-${string}`

const defineElementWithOptions = <
  Name extends ValidHtmlTagName,
  Properties extends Record<string, DefinePropertyDeclaration>,
  Styles extends CSSResultGroup,
  Parent extends typeof LitElement,
  Instance extends InstanceType<Parent> & ExtractProperties<Properties>,
  Render extends (this: Instance) => unknown,
  Setup extends (this: Instance, comp?: Instance) => void | Render,
>(options: {
  name?: Name
  parent?: typeof LitElement
  styles?: Styles
  props?: Properties

  register?: boolean
  shadowRoot?: boolean

  setup?: Setup
  render?: Render
}): typeof LitElement => {
  options = Object.create(options) as typeof options
  const { name, parent: BaseClass = LitElement, register } = options
  const SuperClass = withHooks(BaseClass)

  //@customElement(name)
  const result = class extends SuperClass {
    static properties = options.props ?? ({} as Properties)
    static styles = options.styles ?? undefined

    protected createRenderRoot(): HTMLElement | DocumentFragment {
      return options.shadowRoot === false ? this : super.createRenderRoot()
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
  }

  if (register != false && name) {
    customElements.define(name, result)
  }
  return result as unknown as typeof LitElement
}

export type DefinedComponent = ReturnType<typeof defineElement>
export type DefinedComponentInstance = InstanceType<DefinedComponent>

const defineFunctionalComponent = (name: ValidHtmlTagName, render: () => unknown) =>
  defineElementWithOptions({ name, render, shadowRoot: false })

export function defineElement(name: ValidHtmlTagName, render: () => unknown): typeof LitElement
export function defineElement(options: Parameters<typeof defineElementWithOptions>[0]): typeof LitElement
export function defineElement(
  ...args: [ValidHtmlTagName, () => unknown] | [Parameters<typeof defineElementWithOptions>[0]]
) {
  return isString(args[0])
    ? defineFunctionalComponent(args[0], args[1] as () => unknown)
    : defineElementWithOptions(args[0])
}
