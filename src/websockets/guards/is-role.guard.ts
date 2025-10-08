import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { Socket } from 'socket.io';

export const IsRole = (...roles: string[]): Type<CanActivate> => {
  @Injectable()
  class IsRoleGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
      const client = ctx.switchToWs().getClient<Socket>();
      const user = client.data?.user;
      return !!user && roles.includes(user.role);
    }
  }
  return mixin(IsRoleGuard);
};
