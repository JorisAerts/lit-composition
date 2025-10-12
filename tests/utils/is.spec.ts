import { describe, expect, it } from 'vitest'
import { isClass, isFunction, isNumber, isObject, isString, isUndefined } from '../../src/utils/is'

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

describe('isNumber', () => {
  it("doesn't match against a null or undefined", () => {
    expect(isNumber(null)).toBe(false)
    expect(isNumber(undefined)).toBe(false)
  })

  it("doesn't match against a non-number", () => {
    expect(isNumber(new Date())).toBe(false)
    expect(isNumber({})).toBe(false)
    expect(isNumber('')).toBe(false)
    expect(isNumber('0')).toBe(false)
    expect(isNumber('1')).toBe(false)
    expect(isNumber(false)).toBe(false)
    expect(isNumber(true)).toBe(false)
  })

  it("doesn't match against NaN", () => {
    expect(isNumber(Number.NaN)).toBe(false)
  })

  it('matches against numbers', () => {
    expect(isNumber(0)).toBe(true)
    expect(isNumber(1)).toBe(true)
    expect(isNumber(Number.MAX_VALUE)).toBe(true)
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true)
    expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(true)
    expect(isNumber(Number.MIN_VALUE)).toBe(true)
    expect(isNumber(Number.MIN_SAFE_INTEGER)).toBe(true)
    expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true)
    expect(isNumber(Infinity)).toBe(true)
  })
})

describe('isObject', () => {
  it("doesn't match against a null or undefined", () => {
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
  })

  it("doesn't match non-objects", () => {
    expect(isObject(0)).toBe(false)
    expect(isObject(Number.NaN)).toBe(false)
    expect(isObject(new String())).toBe(false)
    expect(isObject([])).toBe(false)
  })

  it('matches objects', () => {
    class Test {}
    expect(isObject({})).toBe(true)
    expect(isObject(new Object())).toBe(true)
    expect(isObject(new Test())).toBe(true)
  })
})

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
  it('matches against undefined', () => {
    expect(isUndefined(undefined)).toBe(true)
  })

  it("doesn't match against a null", () => {
    expect(isUndefined(null)).toBe(false)
    expect(isUndefined(0)).toBe(false)
    expect(isUndefined('')).toBe(false)
  })

  it("doesn't match against a non-undefined value", () => {
    expect(isUndefined(Number.NaN)).toBe(false)
    expect(isUndefined('')).toBe(false)
    expect(isUndefined(1)).toBe(false)
    expect(isUndefined(0)).toBe(false)
    expect(isUndefined(false)).toBe(false)
    expect(isUndefined(new Boolean())).toBe(false)
    expect(isUndefined(new Date())).toBe(false)
    expect(isUndefined(new String())).toBe(false)
    expect(isUndefined(new Number())).toBe(false)
    expect(isUndefined(-1)).toBe(false)
    expect(isUndefined('undefined')).toBe(false)
  })
})
