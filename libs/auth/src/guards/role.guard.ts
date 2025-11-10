import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/common/src/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler()) 
      || this.reflector.get<Role[]>(ROLES_KEY, context.getClass());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) throw new ForbiddenException('No role assigned');

    if (requiredRoles.includes(user.role)) return true;

    throw new ForbiddenException('Insufficient role');
  }
}