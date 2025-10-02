import { isRef, useRef } from '../../src'
import { describe, expect, it } from 'vitest'

describe('refs', () => {
  it('isRef should return the correct value', () => {
    const subject = { a: 1, b: useRef(3) }

    expect(isRef(subject.a)).toBe(false)
    expect(isRef(subject.b)).toBe(true)
  })
})
