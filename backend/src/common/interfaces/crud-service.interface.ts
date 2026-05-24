export type MaybePromise<T> = T | Promise<T>;

export interface ICrudService<
  Entity,
  CreateDto,
  UpdateDto,
  QueryDto = void,
  Scope = void,
> {
  findAll(scope: Scope, query?: QueryDto): MaybePromise<Entity[]>;
  findOne(scope: Scope, id: number): MaybePromise<Entity>;
  create(scope: Scope, dto: CreateDto): MaybePromise<Entity>;
  update(scope: Scope, id: number, dto: UpdateDto): MaybePromise<Entity>;
  remove(scope: Scope, id: number): MaybePromise<Entity>;
}

export interface TenantScopedCrudService<
  Entity,
  CreateDto,
  UpdateDto,
  QueryDto = void,
> extends ICrudService<Entity, CreateDto, UpdateDto, QueryDto, number> {}
