export class HTTPError extends Error {
  public status?: number;
  public data?: any;
  
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}

export class TimeoutError extends HTTPError {
  constructor(message: string = 'timeout') {
    super(message, 408); // HTTP 408 Request Timeout
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class NetworkError extends HTTPError {
  constructor(message: string = 'Network error occurred') {
    super(message, 503); // HTTP 503 Service Unavailable
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class RedirectError extends HTTPError {
  constructor(message: string = 'Maximum redirects exceeded') {
    super(message, 310); // HTTP 310 Too many redirects
    Object.setPrototypeOf(this, RedirectError.prototype);
  }
}

export class MalformedResponseError extends HTTPError {
  constructor(message: string = 'Malformed response') {
    super(message, 500); // HTTP 500 Internal Server Error
    Object.setPrototypeOf(this, MalformedResponseError.prototype);
  }
}

export class AuthenticationError extends HTTPError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401); // HTTP 401 Unauthorized
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class TLSError extends HTTPError {
  constructor(message: string = 'TLS/SSL error occurred') {
    super(message, 525); // HTTP 525 SSL Handshake Failed
    Object.setPrototypeOf(this, TLSError.prototype);
  }
}
