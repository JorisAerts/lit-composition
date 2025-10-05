import { reactive, useRef } from '../../src'
import { describe, expectTypeOf, it } from 'vitest'

describe('reactivity', () => {
  it('reactive(obj) should work as expected', () => {
    const subject = {
      num: 1,
      refNum: useRef(3),
      refStr: useRef('Hello'),
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
