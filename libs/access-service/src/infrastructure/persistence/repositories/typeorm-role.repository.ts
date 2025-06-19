import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { Role } from '../../../domain/entities/user.entity';
import { RoleRepository } from '../../../domain/repositories';
import { QueryOptions, PaginatedResult } from '@enterprise/shared';

@Injectable()
export class TypeOrmRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleEntityRepository: Repository<RoleEntity>
  ) {}

  async save(role: Role): Promise<Role> {
    const roleEntity = this.domainToEntity(role);
    const savedEntity = await this.roleEntityRepository.save(roleEntity);
    return this.entityToDomain(savedEntity);
  }

  async findById(id: string): Promise<Role | null> {
    const entity = await this.roleEntityRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['permissions', 'users']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByUuid(uuid: string): Promise<Role | null> {
    const entity = await this.roleEntityRepository.findOne({
      where: { uuid },
      relations: ['permissions', 'users']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.roleEntityRepository.findOne({
      where: { name },
      relations: ['permissions', 'users']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findMany(options: QueryOptions = {}): Promise<PaginatedResult<Role>> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const findOptions: FindManyOptions<RoleEntity> = {
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['permissions', 'users']
    };

    const [entities, total] = await this.roleEntityRepository.findAndCount(findOptions);
    
    return {
      data: entities.map(entity => this.entityToDomain(entity)),
      total,
      hasMore: skip + take < total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take)
    };
  }

  async findActiveRoles(options: QueryOptions = {}): Promise<Role[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const entities = await this.roleEntityRepository.find({
      where: { isActive: true },
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['permissions', 'users']
    });

    return entities.map(entity => this.entityToDomain(entity));
  }

  async searchRoles(searchTerm: string, options: QueryOptions = {}): Promise<Role[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const entities = await this.roleEntityRepository.find({
      where: [
        { name: Like(`%${searchTerm}%`) },
        { description: Like(`%${searchTerm}%`) }
      ],
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['permissions', 'users']
    });

    return entities.map(entity => this.entityToDomain(entity));
  }

  async findRolesWithPermission(permissionName: string, options: QueryOptions = {}): Promise<Role[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const entities = await this.roleEntityRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .leftJoinAndSelect('role.users', 'users')
      .where('permission.name = :permissionName', { permissionName })
      .take(take)
      .skip(skip)
      .orderBy(`role.${sortBy}`, order)
      .getMany();

    return entities.map(entity => this.entityToDomain(entity));
  }

  async countActiveRoles(): Promise<number> {
    return this.roleEntityRepository.count({
      where: { isActive: true }
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.roleEntityRepository.count({
      where: { name }
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.roleEntityRepository.delete({ id: parseInt(id) });
  }

  // Mapping methods
  private domainToEntity(domain: Role): RoleEntity {
    const entity = new RoleEntity();
    
    if (domain.id) {
      entity.id = parseInt(domain.id);
    }
    
    entity.uuid = domain.uuid;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.version = domain.version;

    return entity;
  }

  private entityToDomain(entity: RoleEntity): Role {
    return new Role({
      id: entity.id.toString(),
      uuid: entity.uuid,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      permissions: entity.permissions || []
    });
  }
}
