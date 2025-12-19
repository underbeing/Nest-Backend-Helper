import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const organizationId = req.headers['x-organization-id'] as string;
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;

    if (!organizationId) {
      throw new BadRequestException('X-Organization-Id header is missing');
    }

    // Mock user context
    req['user'] = {
      organizationId,
      userId: userId || 'anonymous',
      role: role || 'MEMBER', // Default to MEMBER
    };

    next();
  }
}
