import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Like, In } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories';
import { QueryOptions, PaginatedResult } from '@enterprise/shared';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>
  ) {}

  async save(user: User): Promise<User> {
    const userEntity = this.domainToEntity(user);
    const savedEntity = await this.userEntityRepository.save(userEntity);
    return this.entityToDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userEntityRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['roles', 'roles.permissions', 'directPermissions']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByUuid(uuid: string): Promise<User | null> {
    const entity = await this.userEntityRepository.findOne({
      where: { uuid },
      relations: ['roles', 'roles.permissions', 'directPermissions']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userEntityRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions', 'directPermissions']
    });
    
    return entity ? this.entityToDomain(entity) : null;
  }

  async findMany(options: QueryOptions = {}): Promise<PaginatedResult<User>> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const findOptions: FindManyOptions<UserEntity> = {
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['roles', 'roles.permissions', 'directPermissions']
    };

    const [entities, total] = await this.userEntityRepository.findAndCount(findOptions);
    
    return {
      data: entities.map(entity => this.entityToDomain(entity)),
      total,
      hasMore: skip + take < total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take)
    };
  }

  async findActiveUsers(options: QueryOptions = {}): Promise<User[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const entities = await this.userEntityRepository.find({
      where: { isActive: true },
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['roles', 'roles.permissions', 'directPermissions']
    });

    return entities.map(entity => this.entityToDomain(entity));
  }

  async searchUsers(searchTerm: string, options: QueryOptions = {}): Promise<User[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const entities = await this.userEntityRepository.find({
      where: [
        { firstName: Like(`%${searchTerm}%`) },
        { lastName: Like(`%${searchTerm}%`) },
        { email: Like(`%${searchTerm}%`) }
      ],
      take,
      skip,
      order: { [sortBy]: order },
      relations: ['roles', 'roles.permissions', 'directPermissions']
    });

    return entities.map(entity => this.entityToDomain(entity));
  }

  async findUsersWithRole(roleName: string, options: QueryOptions = {}): Promise<User[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const entities = await this.userEntityRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.directPermissions', 'directPermissions')
      .leftJoinAndSelect('role.permissions', 'rolePermissions')
      .where('role.name = :roleName', { roleName })
      .take(take)
      .skip(skip)
      .orderBy(`user.${sortBy}`, order)
      .getMany();

    return entities.map(entity => this.entityToDomain(entity));
  }

  async findUsersWithPermission(permissionName: string, options: QueryOptions = {}): Promise<User[]> {
    const {
      take = 25,
      skip = 0,
      sortBy = 'createdAt',
      order = 'DESC'
    } = options;

    const entities = await this.userEntityRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.directPermissions', 'directPermissions')
      .leftJoinAndSelect('role.permissions', 'rolePermissions')
      .where('directPermissions.name = :permissionName', { permissionName })
      .orWhere('rolePermissions.name = :permissionName', { permissionName })
      .take(take)
      .skip(skip)
      .orderBy(`user.${sortBy}`, order)
      .getMany();

    return entities.map(entity => this.entityToDomain(entity));
  }

  async countActiveUsers(): Promise<number> {
    return this.userEntityRepository.count({
      where: { isActive: true }
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userEntityRepository.count({
      where: { email }
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.userEntityRepository.delete({ id: parseInt(id) });
  }

  // Mapping methods
  private domainToEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    
    if (domain.id) {
      entity.id = parseInt(domain.id);
    }
    
    entity.uuid = domain.uuid;
    entity.email = domain.email.value;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.passwordHash = domain.passwordHash;
    entity.isActive = domain.isActive;
    entity.isEmailVerified = domain.isEmailVerified;
    entity.lastLoginAt = domain.lastLoginAt || null;
    entity.loginAttempts = domain.loginAttempts;
    entity.lockedUntil = domain.lockedUntil || null;
    entity.preferences = domain.preferences;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.version = domain.version;

    return entity;
  }

  private entityToDomain(entity: UserEntity): User {
    return new User({
      id: entity.id.toString(),
      uuid: entity.uuid,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      passwordHash: entity.passwordHash,
      isActive: entity.isActive,
      isEmailVerified: entity.isEmailVerified,
      lastLoginAt: entity.lastLoginAt,
      loginAttempts: entity.loginAttempts,
      lockedUntil: entity.lockedUntil,
      preferences: entity.preferences,
      roles: entity.roles || [],
      permissions: entity.directPermissions || []
    });
  }
}
