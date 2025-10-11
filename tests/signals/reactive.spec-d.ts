import { reactive } from '../../src/signals'
import { describe, expectTypeOf, it } from 'vitest'
import { signal } from '@lit-labs/signals'

describe('reactivity', () => {
  it('reactive(obj) should work as expected', () => {
    const subject = {
      num: 1,
      refNum: signal(3),
      refStr: signal('Hello'),
      txt: 'text',
      bool: true,
      ld: () => 1,
      fn: function () {},
    }
    const reactiveSubject = reactive(subject)

    expectTypeOf(reactiveSubject.num).toEqualTypeOf<number>()
    expectTypeOf(reactiveSubject.refNum).toEqualTypeOf<number>()
    expectTypeOf(reactiveSubject.refStr).toEqualTypeOf<string>()
    expectTypeOf(reactiveSubject.txt).toEqualTypeOf<string>()
    expectTypeOf(reactiveSubject.bool).toEqualTypeOf<boolean>()
    expectTypeOf(reactiveSubject.ld).toEqualTypeOf<() => number>()
    expectTypeOf(reactiveSubject.fn).toEqualTypeOf<() => void>()
  })
})
