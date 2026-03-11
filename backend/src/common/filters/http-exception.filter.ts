import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { GqlExceptionFilter, GqlExecutionContext } from '@nestjs/graphql';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter, ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const isHttp = ctx.getResponse<Response>();
    const isGraphQL = !isHttp;
    
    if (isGraphQL) {
      return this.handleGraphQLException(exception);
    }

    return this.handleHttpException(exception, host);
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : ''
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private handleGraphQLException(exception: unknown) {
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? (exception.getResponse() as any).message || exception.message
      : 'Internal server error';

    this.logger.error(
      `GraphQL Error: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : ''
    );

    return {
      statusCode: status,
      message,
      error: exception instanceof HttpException ? 'Http Exception' : 'Internal Server Error',
    };
  }
}
