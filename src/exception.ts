import type { Optional, Prettify } from './types'

const defineException = <
  Name extends Optional<string>,
  Message extends Optional<string>,
  Parent extends Optional<typeof Error>,
  Cause extends typeof Error,
  NamedError extends string extends Name ? { name: Name } : never,
  ResultType extends Cause & NamedError & { message: Message },
  ReturnType extends ResultType = Prettify<ResultType>,
>({ name = undefined as Name, message = undefined as Message, parent = Error as Parent } = {}) =>
  class extends (parent ?? Error) {
    get name() {
      return name ?? super.name
    }

    constructor(cause?: Cause) {
      super(message, { cause })
    }
  } as ReturnType

export class NotAllowedException extends Error {
  constructor(message = "Couldn't do that.") {
    super(message)
  }
}
