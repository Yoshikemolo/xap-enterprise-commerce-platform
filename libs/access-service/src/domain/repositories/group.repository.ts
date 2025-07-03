import { Repository } from '@enterprise/shared';
import { Group } from '../entities/group.entity';

export interface GroupRepository extends Repository<Group> {
  findByName(name: string): Promise<Group | null>;
  findByParentId(parentId: string): Promise<Group[]>;
  findRootGroups(): Promise<Group[]>;
  findDescendants(groupId: string): Promise<Group[]>;
  findAncestors(groupId: string): Promise<Group[]>;
  findWithUsers(groupId: string): Promise<Group | null>;
  findWithPermissions(groupId: string): Promise<Group | null>;
  findUserGroups(userId: string): Promise<Group[]>;
  findByPermissionName(permissionName: string): Promise<Group[]>;
  findActiveGroups(): Promise<Group[]>;
  findDefaultGroup(): Promise<Group>;
  searchGroups(searchTerm: string): Promise<Group[]>;
  countGroupUsers(groupId: string): Promise<number>;
  countGroupPermissions(groupId: string): Promise<number>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
  validateGroupHierarchy(groupId: string, parentId: string): Promise<boolean>;
}
