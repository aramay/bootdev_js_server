class BadRequestError extends Error {
    constructor(message: string) {
        super(message)
    }
}

class NotFoundError extends Error {
    constructor(message: string) {
        super(message)
    }
}

class UserNotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export { BadRequestError, NotFoundError, UserNotAuthenticatedError };