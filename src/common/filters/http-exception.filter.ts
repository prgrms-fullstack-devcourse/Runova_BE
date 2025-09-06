import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { BusinessException } from "../exceptions/business.exception";
import { ErrorCode } from "../constants/error-code";
import { QueryFailedError } from "typeorm";

type AnyObj = Record<string, any>;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isProd = process.env.NODE_ENV === "production";

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception as any);
    
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const timestamp = new Date().toISOString();
    const requestId = (req.headers["x-request-id"] as string) || undefined;

    if (exception instanceof BusinessException) {
      const status = exception.getStatus();
      const body = {
        code: exception.code,
        message: exception.message ?? exception.error.message,
        details: exception.details ?? null,
        path: req.originalUrl,
        method: req.method,
        timestamp,
        requestId,
      };
      this.log(status, body, exception);
      return res.status(status).json({ error: body });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse() as AnyObj | string;

      let details: any = null;
      let message =
        typeof payload === "string"
          ? payload
          : (payload?.message ?? exception.message);

      if (Array.isArray(message)) {
        details = message;
        message = ErrorCode.Common.VALIDATION_FAILED.message;
      } else if (typeof payload === "object" && payload?.errors) {
        details = payload.errors;
      }

      const code =
        (typeof payload === "object" && payload?.code) ||
        this.mapStatusToDefaultCode(status);

      const body = {
        code,
        message,
        details,
        path: req.originalUrl,
        method: req.method,
        timestamp,
        requestId,
      };
      this.log(status, body, exception);
      return res.status(status).json({ error: body });
    }

    if (this.isQueryFailedError(exception)) {
      const { status, code, message, details } = this.mapQueryError(
        exception as QueryFailedError
      );
      const body = {
        code,
        message,
        details,
        path: req.originalUrl,
        method: req.method,
        timestamp,
        requestId,
      };
      this.log(status, body, exception);
      return res.status(status).json({ error: body });
    }

    const jwtMapped = this.mapJwtLikeError(exception);
    if (jwtMapped) {
      const body = {
        code: jwtMapped.code,
        message: jwtMapped.message,
        details: null,
        path: req.originalUrl,
        method: req.method,
        timestamp,
        requestId,
      };
      this.log(jwtMapped.status, body, exception);
      return res.status(jwtMapped.status).json({ error: body });
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const body = {
      code: ErrorCode.Common.INTERNAL.code,
      message: ErrorCode.Common.INTERNAL.message,
      details: this.isProd ? null : this.safeStack(exception),
      path: req.originalUrl,
      method: req.method,
      timestamp,
      requestId,
    };
    this.log(status, body, exception);
    return res.status(status).json({ error: body });
  }

  private mapStatusToDefaultCode(status: number): string {
    if (status === 400) return ErrorCode.Common.VALIDATION_FAILED.code;
    if (status === 401) return ErrorCode.Auth.UNAUTHORIZED.code;
    if (status === 403) return ErrorCode.Common.FORBIDDEN.code;
    if (status === 404) return ErrorCode.Common.NOT_FOUND.code;
    if (status === 409) return ErrorCode.Common.CONFLICT.code;
    return ErrorCode.Common.INTERNAL.code;
  }

  private isQueryFailedError(e: unknown): e is QueryFailedError {
    return !!e && (e as any).name === "QueryFailedError";
  }

  private mapQueryError(e: QueryFailedError): {
    status: number;
    code: string;
    message: string;
    details?: any;
  } {
    const driverCode = (e as any)?.driverError?.code;
    if (driverCode === "23505") {
      return {
        status: 409,
        code: ErrorCode.Common.CONFLICT.code,
        message: "중복된 값이 존재합니다.",
        details: this.isProd
          ? undefined
          : { driverCode, detail: (e as any)?.driverError?.detail },
      };
    }
    return {
      status: 500,
      code: ErrorCode.Common.INTERNAL.code,
      message: ErrorCode.Common.INTERNAL.message,
      details: this.isProd
        ? undefined
        : { driverCode, message: (e as any)?.message },
    };
  }

  private mapJwtLikeError(
    e: unknown
  ): { status: number; code: string; message: string } | null {
    const name = (e as any)?.name;
    if (name === "TokenExpiredError") {
      return {
        status: 401,
        code: ErrorCode.Auth.TOKEN_EXPIRED.code,
        message: ErrorCode.Auth.TOKEN_EXPIRED.message,
      };
    }
    if (name === "JsonWebTokenError" || name === "UnauthorizedError") {
      return {
        status: 401,
        code: ErrorCode.Auth.INVALID_TOKEN.code,
        message: ErrorCode.Auth.INVALID_TOKEN.message,
      };
    }
    return null;
  }

  private safeStack(e: unknown) {
    if (!e || typeof e !== "object") return e;
    const { name, message, stack } = e as any;
    return { name, message, stack };
  }

  private log(status: number, body: AnyObj, exception: unknown) {
    const level = status >= 500 ? "error" : "warn";
    const msg = `[${status}] ${body.method} ${body.path} - ${body.code}: ${body.message}`;
    if (level === "error" && !this.isProd && exception instanceof Error) {
      this.logger.error(msg, exception.stack);
    } else {
      (this.logger as any)[level](msg);
    }
  }
}
