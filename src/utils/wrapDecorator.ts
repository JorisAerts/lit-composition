// @ts-ignore
import type { PropertyDecorator } from 'lit/decorators.js'
import type { ReactiveElement } from 'lit'

//type PropertyDecorator = ReturnType<typeof property>

type PropertyDecoratorFn = <T>(opts: T) => PropertyDecorator
//type PropertyDecoratorParams = Parameters<PropertyDecorator>

// ja ja we gaan hier wel nog eens naar kijken
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const wrapDecorator = <DecoratorOptions>(thisArg: ReactiveElement, decorator: PropertyDecoratorFn) => {
  // ja ja we gaan hier wel nog eens naar kijken (2)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const decorate = ({ opts }: { opts: DecoratorOptions }) => decorator(opts)
  /*
  const result = decorate()
  result(target, 'value', {
    get,
    set,
  } as PropertyDecoratorParams[2])
  */
  return void 0
}
