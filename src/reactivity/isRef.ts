import type { Effect } from './effect'
import { isObject } from '../utils/is'
import { REF_SYMBOL } from '../symbols'

/**
 * Determine whether a value is a reactive ref (Effect).
 *
 * @param value - The value to test.
 * @returns True if the value is a ref created by useRef or computed.
 */
export const isRef = (value: unknown): value is Effect<unknown> => isObject(value) && REF_SYMBOL in value
