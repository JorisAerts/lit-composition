import { isArray } from '../utils/is'
import type { Effect } from './effect'
import { watchEffect } from './effect'
import { isRef } from './isRef'

/** A source for watch: a ref or a getter function. */
export type WatchSource<T> = Effect<T> | (() => T)

/** Stop handle for a watcher. */
export type WatchStopHandle = () => void

/** Options for watch. */
export interface WatchOptions {
  /** Whether to invoke the callback immediately with the current value(s). */
  immediate?: boolean
}

const resolveSourceValue = <T>(src: WatchSource<T>): T => (isRef(src) ? src.value : (src as () => T)())

const hasArrayChanged = (a: unknown[], b: unknown[]) => a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))

const isArrayOfWatchSource = (x: unknown): x is WatchSource<unknown>[] => isArray(x)

/**
 * Watch one or multiple reactive sources (ref(s) or getter function(s)) and call `cb`
 * when the value(s) change. Returns a stop function.
 *
 * - watch(ref, (newVal, oldVal) => {})
 * - watch(getter, (newVal, oldVal) => {})
 * - watch([ref1, getter2], ([new1, new2], [old1, old2]) => {})
 */
export function watch<T>(
  source: WatchSource<T>,
  cb: (newVal: T, oldVal: T | undefined) => void,
  options?: WatchOptions
): WatchStopHandle
export function watch<T extends unknown[]>(
  source: { [K in keyof T]: WatchSource<T[K]> },
  cb: (newVal: T, oldVal: T | undefined) => void,
  options?: WatchOptions
): WatchStopHandle
export function watch(
  source: WatchSource<unknown> | WatchSource<unknown>[],
  cb: (newVal: unknown, oldVal: unknown) => void,
  options?: WatchOptions
): WatchStopHandle {
  const getter = isArrayOfWatchSource(source)
    ? () => source.map((s) => resolveSourceValue(s))
    : () => resolveSourceValue(source)

  const clone = (val: unknown) => (isArray(val) ? val.slice() : val)

  let oldVal: unknown
  let initialized = false

  const runner = () => {
    const newVal = getter()
    if (!initialized) {
      initialized = true
      if (options?.immediate) {
        cb(newVal, undefined)
      }
      oldVal = clone(newVal)
      return
    }
    const changed = isArray(newVal) && isArray(oldVal) ? hasArrayChanged(newVal, oldVal) : !Object.is(newVal, oldVal)
    if (changed) {
      const prev = oldVal
      oldVal = clone(newVal)
      cb(newVal, prev)
    }
  }
  // return stop-handle
  return watchEffect(runner)
}
