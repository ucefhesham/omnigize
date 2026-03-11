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
    const req = ctx.getContext().req as {
      headers: Record<string, string>;
      workspaceId?: string;
    };
    const workspaceId = req?.headers?.['x-workspace-id'];

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    req.workspaceId = workspaceId;
    return true;
  }
}
