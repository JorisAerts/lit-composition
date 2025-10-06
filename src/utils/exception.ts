export class NotAllowedException extends Error {
  constructor(message = "Couldn't do that.") {
    super(message)
  }
}
