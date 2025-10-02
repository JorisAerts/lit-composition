import type { Fn } from '../types'

const is = (value: unknown, type: string): boolean => Object.prototype.toString.call(value) === `[object ${type}]`

export const isArray = Array.isArray
export const isFunction = (value: unknown): value is Fn => is(value, 'Function')
export const isObject = (value: unknown): value is typeof Object => is(value, 'Object')
export const isString = (value: unknown): value is string => is(value, 'String')
export const isUndefined = (value: unknown): value is undefined => value === undefined
