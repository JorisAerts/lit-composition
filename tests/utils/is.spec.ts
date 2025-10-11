import { describe, expect, it } from 'vitest'
import { isClass, isFunction, isString, isUndefined } from '../../src/utils/is'

describe('isString', () => {
  it("doesn't match against a null or undefined", () => {
    expect(isString(null)).toBe(false)
    expect(isString(undefined)).toBe(false)
  })

  it("doesn't match against an array", () => {
    expect(isString([])).toBe(false)
    expect(isString(['a', 'b', 'c'])).toBe(false)
  })

  it('match against String object', () => {
    expect(isString(new String('test'))).toBe(true)
  })

  it('match against string primitive', () => {
    expect(isString('test')).toBe(true)
  })
})

describe('isUndefined', () => {
  it("doesn't match against a null or undefined", () => {
    expect(isUndefined(null)).toBe(false)
    expect(isUndefined(0)).toBe(false)
    expect(isUndefined('')).toBe(false)
    expect(isUndefined(undefined)).toBe(true)
  })
})

describe('isFunction', () => {
  class TestClass {}
  function TestFunction() {}
  const TestArrowFunction = () => {}

  it("doesn't match against a null or undefined", () => {
    expect(isFunction(null)).toBe(false)
    expect(isFunction(undefined)).toBe(false)
  })

  it('match against a function', () => {
    expect(isFunction(TestFunction)).toBe(true)
  })

  it('match against a lambda', () => {
    expect(isFunction(TestArrowFunction)).toBe(true)
  })

  it('match against a class', () => {
    expect(isFunction(TestClass)).toBe(true)
  })
})

describe('isClass', () => {
  class TestClass {}
  function TestFunction() {}
  const TestArrowFunction = () => {}

  it("doesn't match against a null or undefined", () => {
    expect(isClass(null)).toBe(false)
    expect(isClass(undefined)).toBe(false)
  })

  it("doesn't match against a function", () => {
    expect(isClass(TestFunction)).toBe(false)
  })

  it("doesn't match against a lambda", () => {
    expect(isClass(TestArrowFunction)).toBe(false)
  })

  it('match against a class', () => {
    expect(isClass(TestClass)).toBe(true)
  })
})
