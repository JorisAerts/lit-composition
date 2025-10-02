import { isRef, reactive, useRef } from '../../src'
import { describe, expect, it } from 'vitest'

describe('reactivity', () => {
  it('reactive(obj) should work as expected', () => {
    const subject = { a: 1, b: useRef(3) }
    const reactiveSubject = reactive(subject)

    console.log(reactiveSubject)

    expect(Object.keys(reactiveSubject)).toMatchObject(Object.keys(subject))
    expect(isRef(reactiveSubject.a)).toBe(false)
    expect(isRef(reactiveSubject.b)).toBe(false)

    reactiveSubject.b = 3

    expect(reactiveSubject.b).toBe(3)
    expect(subject.b.value).toBe(3)
  })
})
