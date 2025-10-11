import { reactive } from '../../src/signals'
import { describe, expect, it } from 'vitest'
import { signal, Signal } from '@lit-labs/signals'

describe('reactivity', () => {
  it('reactive(obj) should work as expected', () => {
    const subject = {
      num: 1,
      txt: 'text',
      refNum: signal(3),
      refObj: signal({ r: 2 }),
      obj: { c: 4 },

      ld: () => 'ok',
      fn: function () {},
    }
    const reactiveSubject = reactive(subject)

    expect(Object.keys(reactiveSubject)).toMatchObject(Object.keys(subject))
    expect(Signal.isState(reactiveSubject.num)).toBe(false)
    expect(Signal.isState(reactiveSubject.refNum)).toBe(false)

    reactiveSubject.refNum = 3

    expect(reactiveSubject.num).toBe(1)
    expect(reactiveSubject.txt).toBe('text')
    expect(reactiveSubject.obj).toMatchObject({ c: 4 })
    expect(reactiveSubject.refNum).toBe(3)
    expect(reactiveSubject.refObj).toMatchObject({ r: 2 })

    expect(reactiveSubject.ld).toBeTypeOf('function')
    expect(reactiveSubject.fn).toBeTypeOf('function')

    expect(subject.refNum.get()).toBe(3)
  })
})
