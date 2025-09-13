import type { Fn } from '../types'

export const dummyFn: Fn = <Result>(): Result => {
  return void 0 as unknown as Result
}
