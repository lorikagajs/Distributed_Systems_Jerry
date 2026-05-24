import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export abstract class BaseService<Entity = unknown> {
  protected constructor(private readonly defaultResourceName = 'Resource') {}

  protected ensureFound<FoundEntity>(
    entity: FoundEntity | null | undefined,
    resourceName: string,
    id: number | string,
  ): FoundEntity {
    if (!entity) {
      throw new NotFoundException(`${resourceName} with id ${id} not found`);
    }

    return entity;
  }

  protected ensureEntityFound(
    entity: Entity | null | undefined,
    id: number | string,
  ): Entity {
    return this.ensureFound(entity, this.defaultResourceName, id);
  }

  protected handleUniqueConstraint(error: unknown, message: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(message);
    }

    throw error;
  }
}
