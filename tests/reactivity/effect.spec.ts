import { describe, expect, it } from 'vitest'
import { computed, isRef, useRef } from '../../src'

describe('isRef', () => {
  it('useRef', () => {
    const ref = useRef(false)
    expect(isRef(ref)).toBe(true)

    const object = {}
    expect(isRef(object)).toBe(false)
  })

  it('computed', () => {
    const ref = computed(() => false)
    expect(isRef(ref)).toBe(true)

    const object = {}
    expect(isRef(object)).toBe(false)
  })
})
