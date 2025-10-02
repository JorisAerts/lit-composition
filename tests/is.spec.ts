import { describe, expect, it } from 'vitest'
import { isFunction } from '../src/utils/is'

describe('isFunction', () => {
  it('match against a function', () => {
    expect(
      isFunction(function () {
        //
      })
    ).toBe(true)
  })

  it('match against a lambda', () => {
    expect(isFunction((): unknown => [])).toBe(true)
  })

  it.skip('match against a class', () => {
    // TODO: false?
    expect(isFunction(class {})).toBe(false)
  })
})
