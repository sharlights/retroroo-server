export class SocketSuccessResponse<T = any> {
  success = true as const;
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class SocketErrorResponse {
  success = false as const;
  error: {
    code: string;
    message: string;
  };

  constructor(code: ErrorCode, message: string) {
    this.error = { code, message };
  }
}

export type ErrorCode = 'FORBIDDEN' | 'NOT_FOUND';

export type SocketResponse<T = any> = SocketSuccessResponse<T> | SocketErrorResponse;