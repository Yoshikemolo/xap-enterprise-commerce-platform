import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { Permission } from '../../../domain/entities/user.entity';
import { PermissionRepository } from '../../../domain/repositories';
import { QueryOptions, PaginatedResult } from '@enterprise/shared';

@Injectable()
export class TypeOrmPermissionRepository implements PermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionEntityRepository: Repository<PermissionEntity>
  ) {}

  async save(permission: Permission): Promise<Permission> {
    const permissionEntity = this.domainToEntity(permission);
    const savedEntity = await this.permissionEntityRepository.save(permissionEntity);
    return this.entityToDomain(savedEntity);
  }

  async findById(id: string): Promise<Permission | null> {
    const entity = await this.permissionEntityRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['users', 'roles']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByUuid(uuid: string): Promise<Permission | null> {
    const entity = await this.permissionEntityRepository.findOne({
      where: { uuid },
      relations: ['users', 'roles']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const entity = await this.permissionEntityRepository.findOne({
      where: { name },
      relations: ['users', 'roles']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    const entity = await this.permissionEntityRepository.findOne({
      where: { resource, action },
      relations: ['users', 'roles']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findMany(options: QueryOptions = {}): Promise<PaginatedResult<Permission>> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const findOptions: FindManyOptions<PermissionEntity> = {
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['users', 'roles']
    };

    const [entities, total] = await this.permissionEntityRepository.findAndCount(findOptions);
    
    return {
      data: entities.map(entity => this.entityToDomain(entity)),
      total,
      hasMore: skip + take < total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take)
    };
  }

  async findPermissionsByResource(resource: string, options: QueryOptions = {}): Promise<Permission[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'action',
      order = 'ASC'
    } = options;

    const entities = await this.permissionEntityRepository.find({
      where: { resource },
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['users', 'roles']
    });

    return entities.map(entity => this.entityToDomain(entity));
  }

  async searchPermissions(searchTerm: string, options: QueryOptions = {}): Promise<Permission[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'name',
      order = 'ASC'
    } = options;

    const entities = await this.permissionEntityRepository.find({
      where: [
        { name: Like(`%${searchTerm}%`) },
        { resource: Like(`%${searchTerm}%`) },
        { action: Like(`%${searchTerm}%`) }
      ],
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['users', 'roles']
    });

    return entities.map(entity => this.entityToDomain(entity));
  }

  async findPermissionsForUser(userId: string): Promise<Permission[]> {
    const entities = await this.permissionEntityRepository
      .createQueryBuilder('permission')
      .leftJoin('permission.users', 'user')
      .leftJoin('permission.roles', 'role')
      .leftJoin('role.users', 'roleUser')
      .where('user.id = :userId', { userId: parseInt(userId) })
      .orWhere('roleUser.id = :userId', { userId: parseInt(userId) })
      .getMany();

    return entities.map(entity => this.entityToDomain(entity));
  }

  async findPermissionsForRole(roleId: string): Promise<Permission[]> {
    const entities = await this.permissionEntityRepository
      .createQueryBuilder('permission')
      .leftJoin('permission.roles', 'role')
      .where('role.id = :roleId', { roleId: parseInt(roleId) })
      .getMany();

    return entities.map(entity => this.entityToDomain(entity));
  }

  async getResourcesWithPermissions(): Promise<Record<string, Permission[]>> {
    const entities = await this.permissionEntityRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
      relations: ['users', 'roles']
    });

    const result: Record<string, Permission[]> = {};
    
    entities.forEach(entity => {
      const permission = this.entityToDomain(entity);
      if (!result[permission.resource]) {
        result[permission.resource] = [];
      }
      result[permission.resource].push(permission);
    });

    return result;
  }

  async countPermissions(): Promise<number> {
    return this.permissionEntityRepository.count();
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.permissionEntityRepository.count({
      where: { name }
    });
    return count > 0;
  }

  async existsByResourceAndAction(resource: string, action: string): Promise<boolean> {
    const count = await this.permissionEntityRepository.count({
      where: { resource, action }
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.permissionEntityRepository.delete({ id: parseInt(id) });
  }

  // Mapping methods
  private domainToEntity(domain: Permission): PermissionEntity {
    const entity = new PermissionEntity();
    
    if (domain.id) {
      entity.id = parseInt(domain.id);
    }
    
    entity.uuid = domain.uuid;
    entity.name = domain.name;
    entity.resource = domain.resource;
    entity.action = domain.action;
    entity.conditions = domain.conditions || null;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.version = domain.version;

    return entity;
  }

  private entityToDomain(entity: PermissionEntity): Permission {
    return new Permission({
      id: entity.id.toString(),
      uuid: entity.uuid,
      name: entity.name,
      resource: entity.resource,
      action: entity.action,
      conditions: entity.conditions
    });
  }
}
