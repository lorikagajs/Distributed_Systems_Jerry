import { ForbiddenException } from '@nestjs/common';

export abstract class BaseController<Service> {
  protected constructor(protected readonly service: Service) {}

  protected tenantIdFrom(user: { tenantId: number }) {
    return user.tenantId;
  }

  protected forbidUnless(condition: boolean, message = 'Access denied') {
    if (!condition) {
      throw new ForbiddenException(message);
    }
  }
}
