import type { CSSResultGroup, PropertyDeclaration, ReactiveElement } from 'lit'
import { LitElement } from 'lit'
import { dummyFn } from '../utils/dummyFn'
import type { ValidCustomElementName } from '../utils/types'
import { isFunction, isString, isSubclassOf, isUndefined } from '../utils/is'
import { registerCustomElement } from '../utils/browser'
import { SignalWatcher } from '@lit-labs/signals'
import { withHooks } from './hooks'
import { withCurrentInstance } from '../currentInstance'

export type UnwrapProps<Props extends Record<string, DefinePropertyDeclaration>> = {
  [K in keyof Props]: InferPropType<Props[K]>
}

type TypeConstructor<T = unknown> = (new (...args: unknown[]) => T & {}) | (() => T) | TypeMethod<T>
type TypeMethod<T, Ctor = unknown> = [T] extends [((...args: unknown[]) => unknown) | undefined]
  ? { new (): Ctor; (): T; readonly prototype: Ctor }
  : never

type InferPropType<T, NullAsAny = true> = [T] extends [null]
  ? NullAsAny extends true
    ? unknown
    : null
  : [T] extends [{ type: null | true }]
    ? unknown
    : [T] extends [DefinePropertyDeclaration<unknown, ObjectConstructor>]
      ? Record<string, unknown>
      : [T] extends [DefinePropertyDeclaration<unknown, BooleanConstructor>]
        ? boolean
        : [T] extends [DefinePropertyDeclaration<unknown, DateConstructor>]
          ? Date
          : [T] extends [DefinePropertyDeclaration<unknown, (infer U)[]>]
            ? U extends DateConstructor
              ? Date | InferPropType<U, false>
              : InferPropType<U, false>
            : [T] extends [DefinePropertyDeclaration<unknown, infer V>]
              ? V extends StringConstructor
                ? string
                : V extends NumberConstructor
                  ? number
                  : V extends BooleanConstructor
                    ? boolean
                    : V extends DateConstructor
                      ? Date
                      : V extends PropType<infer P>
                        ? P
                        : V
              : T

export type PropType<T> = TypeConstructor<T> | (TypeConstructor<T> | null)[]

interface DefinePropertyDeclaration<Type = unknown, TypeHint = unknown> extends PropertyDeclaration<Type, TypeHint> {
  readonly type?: TypeHint
  readonly default?: TypeHint | (() => TypeHint)
}

type ReactiveElementConstructor = new (...args: any[]) => ReactiveElement

const assignDefaultValues = <T extends HTMLElement>(obj: T, props?: Record<string, DefinePropertyDeclaration>) =>
  props &&
  Object.entries(props).forEach(([key, prop]: [unknown, DefinePropertyDeclaration]) => {
    if (isUndefined(prop.default)) return
    const value = (isFunction(prop.default) ? prop.default.call(null) : prop.default) as T[keyof T]
    obj[key as keyof T] ??= value
  })

const withSignals = (superClass: ReactiveElementConstructor) =>
  isSubclassOf(superClass, SignalWatcher) ? superClass : SignalWatcher(superClass)

// END-OF-HOOKS

const defineElementWithOptions = <
  Name extends ValidCustomElementName,
  UseShadowRoot extends boolean,
  Properties extends Record<string, DefinePropertyDeclaration>,
  Styles extends UseShadowRoot extends true | undefined ? CSSResultGroup : never,
  Parent extends typeof LitElement,
  Instance extends InstanceType<Parent> & UnwrapProps<Properties>,
  Render extends (this: Instance) => unknown,
  Setup extends (this: Instance, comp?: Instance) => void | Render,
>(options: {
  name?: Name
  parent?: Parent
  styles?: Styles
  props?: Properties

  register?: boolean
  shadowRoot?: UseShadowRoot

  setup?: Setup
  render?: Render
}): typeof LitElement => {
  options = Object.create(options) as typeof options
  const { name, parent: BaseClass = LitElement, register } = options
  const SuperClass = withHooks(withSignals(BaseClass) as typeof LitElement)

  const result = class extends SuperClass {
    static properties = options.props ?? ({} as Properties)
    static styles = options.styles ?? undefined

    protected createRenderRoot(): HTMLElement | DocumentFragment {
      return options.shadowRoot === false ? this : super.createRenderRoot()
    }

    constructor() {
      super()
      withCurrentInstance(this, () => {
        assignDefaultValues(this, options.props)
        const setupResult = options.setup?.call(this as unknown as Instance, this as unknown as Instance)
        this.__opts.render = isFunction(setupResult) //
          ? setupResult
          : (options.render ?? super.render.bind(this) ?? dummyFn)
      })
    }

    render() {
      return withCurrentInstance(this, () => this.__opts.render?.call(this))
    }
  }

  // register the component
  if (register != false && name) {
    registerCustomElement(name, result)
  }
  return result as unknown as typeof LitElement
}

export type DefinedComponent = ReturnType<typeof defineElement>
export type DefinedComponentInstance = InstanceType<DefinedComponent>

const defineFunctionalComponent = <Name extends ValidCustomElementName>(
  name: Name,
  render: () => unknown,
  opts = {} as {
    [K in keyof Parameters<typeof defineElementWithOptions>[0]]: Parameters<typeof defineElementWithOptions>[0][K]
  } & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    styles: any
  }
) => defineElementWithOptions({ ...opts, name, render, shadowRoot: false })

export function defineElement(name: ValidCustomElementName, render: () => unknown): typeof LitElement
export function defineElement<
  Name extends ValidCustomElementName,
  UseShadowRoot extends boolean,
  Properties extends Record<string, DefinePropertyDeclaration>,
  Styles extends UseShadowRoot extends true | undefined ? CSSResultGroup : undefined,
  Parent extends typeof LitElement,
  Instance extends InstanceType<Parent> & UnwrapProps<Properties>,
  Render extends (this: Instance) => unknown,
  Setup extends (this: Instance, comp?: Instance) => void | Render,
>(options: {
  name?: Name
  parent?: Parent
  styles?: Styles
  props?: Properties
  register?: boolean
  shadowRoot?: UseShadowRoot
  setup?: Setup
  render?: Render
}): typeof LitElement
export function defineElement(
  ...args:
    | [ValidCustomElementName, () => unknown]
    | [
        {
          name?: ValidCustomElementName
          parent?: typeof LitElement
          styles?: CSSResultGroup
          props?: Record<string, DefinePropertyDeclaration>
          register?: boolean
          shadowRoot?: boolean
          setup?: (this: unknown, comp?: unknown) => void | ((this: unknown) => unknown)
          render?: (this: unknown) => unknown
        },
      ]
) {
  return isString(args[0])
    ? defineFunctionalComponent(args[0], args[1] as () => unknown)
    : defineElementWithOptions(args[0])
}
