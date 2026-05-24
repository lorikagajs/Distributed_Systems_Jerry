import { MaybePromise } from './crud-service.interface';

export interface IRepository<Entity, CreateInput, UpdateInput, Query = void> {
  findMany(query?: Query): MaybePromise<Entity[]>;
  findById(id: number): MaybePromise<Entity | null>;
  create(data: CreateInput): MaybePromise<Entity>;
  update(id: number, data: UpdateInput): MaybePromise<Entity>;
  delete(id: number): MaybePromise<Entity>;
}

export interface ITenantScopedRepository<
  Entity,
  CreateInput,
  UpdateInput,
  Query = void,
> {
  findMany(tenantId: number, query?: Query): MaybePromise<Entity[]>;
  findById(tenantId: number, id: number): MaybePromise<Entity | null>;
  create(tenantId: number, data: CreateInput): MaybePromise<Entity>;
  update(tenantId: number, id: number, data: UpdateInput): MaybePromise<Entity>;
  delete(tenantId: number, id: number): MaybePromise<Entity>;
}
