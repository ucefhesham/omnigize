import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const req = ctx.getContext().req;

    const operationType = info?.parentType?.name || 'Unknown';
    const fieldName = info?.fieldName || 'unknown';
    const now = Date.now();

    const userId = req?.user?.id || 'anonymous';
    const workspaceId = req?.user?.workspaceId || 'none';

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - now;
        this.logger.log(
          JSON.stringify({
            level: 'info',
            type: 'Request',
            userId,
            workspaceId,
            operationType,
            fieldName,
            durationMs,
          }),
        );
      }),
      catchError((error) => {
        const durationMs = Date.now() - now;
        this.logger.error(
          JSON.stringify({
            level: 'error',
            type: 'Request',
            userId,
            workspaceId,
            operationType,
            fieldName,
            durationMs,
            errorMessage: error.message,
            stack: error.stack,
          }),
        );
        return throwError(() => error);
      }),
    );
  }
}
