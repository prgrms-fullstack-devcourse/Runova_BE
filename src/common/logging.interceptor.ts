import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
        const {method, url, headers, query, body, cookies} = ctx
      .switchToHttp()
            .getRequest<Request>();

        Logger.log({headers, query, body, cookies}, `[Request] ${method} ${url}`);

        return next.handle().pipe(
            tap((data) => {
                const {statusCode} = ctx.switchToHttp().getResponse<Response>();
                const delay = `${Date.now() - now}ms`;

                Logger.log({statusCode, data, delay}, `[Response] ${method} ${url}`);
            }),
        );
    }
}

