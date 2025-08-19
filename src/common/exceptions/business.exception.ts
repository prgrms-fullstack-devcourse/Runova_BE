import { HttpException } from "@nestjs/common";

export type ErrorConstant = { code: string; message: string; status?: number };

export class BusinessException extends HttpException {
  constructor(
    public readonly error: ErrorConstant,
    public readonly details?: any,
    overrideMessage?: string
  ) {
    super(overrideMessage ?? error.message, error.status ?? 400);
  }
  get code() {
    return this.error.code;
  }
}
