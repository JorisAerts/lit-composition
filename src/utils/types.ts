export type Class<T = {}> = new (...args: any[]) => T

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fn<Args extends unknown[] = any[], Result = any> = (...args: Args) => Result
