import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository, TreeRepository } from 'typeorm';
import { GroupRepository } from '../../../domain/repositories/group.repository';
import { Group } from '../../../domain/entities/group.entity';
import { GroupEntity } from '../entities/group.entity';
import { UserEntity } from '../entities/user.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { User, Permission } from '../../../domain/entities/user.entity';
import { NotFoundError } from '@enterprise/shared';

@Injectable()
export class TypeOrmGroupRepository implements GroupRepository {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: TypeOrmRepository<GroupEntity>,
    
    @InjectRepository(GroupEntity)
    private readonly treeRepository: TreeRepository<GroupEntity>,
  ) {}

  async findById(id: string): Promise<Group | null> {
    const entity = await this.groupRepository.findOne({
      where: { uuid: id },
      relations: ['parent', 'children', 'users', 'permissions']
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Group | null> {
    const entity = await this.groupRepository.findOne({
      where: { name },
      relations: ['parent', 'children', 'users', 'permissions']
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByParentId(parentId: string): Promise<Group[]> {
    const parentEntity = await this.groupRepository.findOne({
      where: { uuid: parentId }
    });

    if (!parentEntity) {
      return [];
    }

    const entities = await this.groupRepository.find({
      where: { parentId: parentEntity.id },
      relations: ['parent', 'children', 'users', 'permissions'],
      order: { name: 'ASC' }
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findRootGroups(): Promise<Group[]> {
    const entities = await this.groupRepository.find({
      where: { parentId: null },
      relations: ['children', 'users', 'permissions'],
      order: { name: 'ASC' }
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findDescendants(groupId: string): Promise<Group[]> {
    const entity = await this.groupRepository.findOne({
      where: { uuid: groupId }
    });

    if (!entity) {
      return [];
    }

    const descendants = await this.treeRepository.findDescendants(entity, {
      relations: ['parent', 'children', 'users', 'permissions']
    });

    // Remove the group itself, only return descendants
    return descendants
      .filter(desc => desc.id !== entity.id)
      .map(desc => this.toDomain(desc));
  }

  async findAncestors(groupId: string): Promise<Group[]> {
    const entity = await this.groupRepository.findOne({
      where: { uuid: groupId }
    });

    if (!entity) {
      return [];
    }

    const ancestors = await this.treeRepository.findAncestors(entity, {
      relations: ['parent', 'children', 'users', 'permissions']
    });

    // Remove the group itself, only return ancestors
    return ancestors
      .filter(anc => anc.id !== entity.id)
      .map(anc => this.toDomain(anc));
  }

  async findWithUsers(groupId: string): Promise<Group | null> {
    const entity = await this.groupRepository.findOne({
      where: { uuid: groupId },
      relations: ['parent', 'children', 'users', 'users.roles', 'permissions']
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findWithPermissions(groupId: string): Promise<Group | null> {
    const entity = await this.groupRepository.findOne({
      where: { uuid: groupId },
      relations: ['parent', 'children', 'users', 'permissions']
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findUserGroups(userId: string): Promise<Group[]> {
    const entities = await this.groupRepository
      .createQueryBuilder('group')
      .innerJoin('group.users', 'user')
      .where('user.uuid = :userId', { userId })
      .leftJoinAndSelect('group.parent', 'parent')
      .leftJoinAndSelect('group.children', 'children')
      .leftJoinAndSelect('group.permissions', 'permissions')
      .orderBy('group.name', 'ASC')
      .getMany();

    return entities.map(entity => this.toDomain(entity));
  }

  async findByPermissionName(permissionName: string): Promise<Group[]> {
    const entities = await this.groupRepository
      .createQueryBuilder('group')
      .innerJoin('group.permissions', 'permission')
      .where('permission.name = :permissionName', { permissionName })
      .leftJoinAndSelect('group.parent', 'parent')
      .leftJoinAndSelect('group.children', 'children')
      .leftJoinAndSelect('group.users', 'users')
      .leftJoinAndSelect('group.permissions', 'allPermissions')
      .orderBy('group.name', 'ASC')
      .getMany();

    return entities.map(entity => this.toDomain(entity));
  }

  async findActiveGroups(): Promise<Group[]> {
    const entities = await this.groupRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children', 'users', 'permissions'],
      order: { name: 'ASC' }
    });

    return entities.map(entity => this.toDomain(entity));
  }

  async findDefaultGroup(): Promise<Group> {
    const entity = await this.groupRepository.findOne({
      where: { name: 'DefaultGroup' },
      relations: ['children', 'users', 'permissions']
    });

    if (!entity) {
      throw new NotFoundError('Group', 'DefaultGroup');
    }

    return this.toDomain(entity);
  }

  async searchGroups(searchTerm: string): Promise<Group[]> {
    const entities = await this.groupRepository
      .createQueryBuilder('group')
      .where('group.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('group.description ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .leftJoinAndSelect('group.parent', 'parent')
      .leftJoinAndSelect('group.children', 'children')
      .leftJoinAndSelect('group.users', 'users')
      .leftJoinAndSelect('group.permissions', 'permissions')
      .orderBy('group.name', 'ASC')
      .getMany();

    return entities.map(entity => this.toDomain(entity));
  }

  async countGroupUsers(groupId: string): Promise<number> {
    const result = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.users', 'user')
      .where('group.uuid = :groupId', { groupId })
      .select('COUNT(user.id)', 'count')
      .getRawOne();

    return parseInt(result.count) || 0;
  }

  async countGroupPermissions(groupId: string): Promise<number> {
    const result = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.permissions', 'permission')
      .where('group.uuid = :groupId', { groupId })
      .select('COUNT(permission.id)', 'count')
      .getRawOne();

    return parseInt(result.count) || 0;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('group')
      .where('group.name = :name', { name });

    if (excludeId) {
      queryBuilder.andWhere('group.uuid != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async validateGroupHierarchy(groupId: string, parentId: string): Promise<boolean> {
    // Check if setting parentId as parent of groupId would create a cycle
    const descendants = await this.findDescendants(groupId);
    return !descendants.some(desc => desc.id === parentId);
  }

  async save(group: Group): Promise<void> {
    const entity = await this.toEntity(group);
    await this.groupRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.groupRepository.findOne({
      where: { uuid: id }
    });

    if (entity) {
      await this.groupRepository.remove(entity);
    }
  }

  // Mapping methods
  private toDomain(entity: GroupEntity): Group {
    return new Group({
      id: entity.uuid,
      uuid: entity.uuid,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      parentId: entity.parent?.uuid,
      parent: entity.parent ? this.toDomain(entity.parent) : undefined,
      children: entity.children?.map(child => this.toDomain(child)) || [],
      users: entity.users?.map(user => this.userEntityToDomain(user)) || [],
      permissions: entity.permissions?.map(permission => this.permissionEntityToDomain(permission)) || [],
    });
  }

  private async toEntity(group: Group): Promise<GroupEntity> {
    let entity = await this.groupRepository.findOne({
      where: { uuid: group.id }
    });

    if (!entity) {
      entity = new GroupEntity();
      entity.uuid = group.id;
    }

    entity.name = group.name;
    entity.description = group.description;
    entity.isActive = group.isActive;

    if (group.parentId) {
      const parentEntity = await this.groupRepository.findOne({
        where: { uuid: group.parentId }
      });
      entity.parent = parentEntity || null;
      entity.parentId = parentEntity?.id || null;
    } else {
      entity.parent = null;
      entity.parentId = null;
    }

    return entity;
  }

  private userEntityToDomain(entity: UserEntity): User {
    // This is a simplified version - in reality, you'd need to import and use the full User domain mapping
    return {
      id: entity.uuid,
      email: { value: entity.email },
      fullName: entity.fullName,
    } as User;
  }

  private permissionEntityToDomain(entity: PermissionEntity): Permission {
    // This is a simplified version - in reality, you'd need to import and use the full Permission domain mapping
    return {
      id: entity.uuid,
      name: entity.name,
      resource: entity.resource,
      action: entity.action,
      toPlainObject: () => ({
        id: entity.uuid,
        name: entity.name,
        resource: entity.resource,
        action: entity.action,
      })
    } as Permission;
  }
}
