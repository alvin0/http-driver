export class HttpDriverError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends HttpDriverError {
  constructor(message: string) {
    super(message, 500);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TimeoutError extends HttpDriverError {
  constructor(message: string) {
    super(message, 408);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends HttpDriverError {
  constructor(message: string) {
    super(message, 401);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
