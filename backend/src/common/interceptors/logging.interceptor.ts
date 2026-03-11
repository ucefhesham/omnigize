import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const operationName = info.operation.operation;
    const fieldName = info.fieldName;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`GraphQL ${operationName} ${fieldName} - ${Date.now() - now}ms`);
      }),
    );
  }
}
