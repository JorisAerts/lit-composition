import type { CSSResultGroup, LitElement } from 'lit'
import { SignalWatcher } from '@lit-labs/signals'
import { isString, isSubclassOf } from '../utils/is'
import type {
  DefinePropertyDeclaration,
  FunctionComponentOptions,
  SkipLastParam,
  UnwrapProps,
} from '../defineElement/defineElement'
import { defineElementWithOptions, defineFunctionalComponent } from '../defineElement/defineElement'
import type { ValidCustomElementName } from '../utils'
import type { ValidatedCustomElementName } from '../utils/ValidCustomElementName'

export * from '../defineElement/hooks'

const withSignals = (superClass: typeof LitElement) =>
  isSubclassOf(superClass, SignalWatcher) ? superClass : SignalWatcher(superClass)

export function defineElement(
  name: ValidCustomElementName,
  render: () => unknown,
  opts?: FunctionComponentOptions
): typeof LitElement
export function defineElement<
  Name extends ValidCustomElementName,
  UseShadowRoot extends boolean,
  Properties extends Record<string, DefinePropertyDeclaration>,
  Styles extends UseShadowRoot extends true | undefined ? CSSResultGroup | undefined : undefined,
  Parent extends typeof LitElement,
  Instance extends InstanceType<Parent> & UnwrapProps<Properties>,
  Render extends (this: Instance) => unknown,
  Setup extends (this: Instance, comp?: Instance) => void | Render,
>(options: {
  name?: ValidatedCustomElementName<Name>
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
    | [name: ValidCustomElementName, render: () => unknown, opts?: FunctionComponentOptions]
    | SkipLastParam<Parameters<typeof defineElementWithOptions>>
) {
  return isString(args[0])
    ? defineFunctionalComponent(args[0], args[1] as () => unknown, args[2], withSignals)
    : defineElementWithOptions(args[0], withSignals)
}
