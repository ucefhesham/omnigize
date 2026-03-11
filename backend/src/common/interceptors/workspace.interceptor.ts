import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { AppClsStore } from '../../database/database.service';

@Injectable()
export class WorkspaceInterceptor implements NestInterceptor {
  constructor(private cls: ClsService<AppClsStore>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let request: any;

    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    const user = request?.user;
    
    if (user?.workspaceId) {
      this.cls.set('workspaceId', user.workspaceId);
    }
    if (user?.id) {
      this.cls.set('userId', user.id);
    }

    return next.handle();
  }
}
