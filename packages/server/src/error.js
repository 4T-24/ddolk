/* eslint-disable max-classes-per-file */

export class ddolkError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = this.constructor.name
    this.cause = cause
  }
}

export class InstanceExistsError extends ddolkError {}

export class InstanceCreationError extends ddolkError {}
