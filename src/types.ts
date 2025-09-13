//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class<T = {}> = new (...args: any[]) => T

export type Nullable<T> = T | null | undefined

export type Optional<T> = T | undefined

export type Prettify<T> = { [K in keyof T]: T[K] } & {}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fn<Args extends unknown[] = any[], Result = any> = (...args: Args) => Result
