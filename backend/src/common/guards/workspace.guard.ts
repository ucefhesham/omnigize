import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const workspaceId = request.headers['x-workspace-id'];

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    request.workspaceId = workspaceId;
    return true;
  }
}
