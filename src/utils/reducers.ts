const createJoiner =
  <Type = unknown, Result = Type>(reducer: (acc: Result, value: Type) => Result, initial: Result) =>
  (...values: Type[]) =>
    values.reduce(reducer, initial) as unknown as Result

const asyncJoiner =
  <Type = unknown, Result = Type>(reducer: (acc: Result, value: Type) => Result, initial: Result) =>
  async (...values: Type[]) =>
    (await Promise.all(values).then((results) => results.reduce(reducer, initial))) as Result

type Acc<R = boolean, T = unknown> = (acc: R, value: T) => R
const andJoin: Acc = <T, R>(acc: R, value: T) => (acc ?? value) as R
const orJoin: Acc = <T, R>(acc: R, value: T) => (acc || value) as R
const nullishJoin: Acc = <T, R>(acc: R, value: T) => (acc ?? value) as R

export const nullish = createJoiner(nullishJoin, false)
export const or = createJoiner(orJoin, false)
export const and = createJoiner(andJoin, true)

export const nullishAsync = asyncJoiner(nullishJoin, false)
export const orAsync = asyncJoiner(orJoin, false)
export const andAsync = asyncJoiner(andJoin, true)
