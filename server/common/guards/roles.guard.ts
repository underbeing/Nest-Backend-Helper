import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly requiredRole: string;

  constructor(role: string) {
    this.requiredRole = role;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== this.requiredRole) {
      throw new ForbiddenException(`Access denied. Requires ${this.requiredRole} role.`);
    }

    return true;
  }
}
