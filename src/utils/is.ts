import type { Fn } from '../types'

const is = (value: unknown, type: string): boolean => Object.prototype.toString.call(value) === `[object ${type}]`

export const isUndefined = (value: unknown): value is undefined => value === undefined
export const isFunction = (value: unknown): value is Fn => is(value, 'Function')
export const isString = (value: unknown): value is string => is(value, 'String')
