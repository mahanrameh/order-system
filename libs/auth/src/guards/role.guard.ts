import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/prisma/generated';
import { AuthMessage, RoleMessage } from 'libs/common/src/enums/message.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(AuthMessage.LoginRequired);
    }

    if (!user.role) {
      throw new ForbiddenException(RoleMessage.NoRoleAssigned);
    }

    if (requiredRoles.includes(user.role)) {
      return true;
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    throw new ForbiddenException(
      `${RoleMessage.AccessDenied}: نیاز به یکی از نقش‌های [${requiredRoles.join(', ')}] دارید، نقش فعلی شما: ${user.role}`,
    );
  }
}
