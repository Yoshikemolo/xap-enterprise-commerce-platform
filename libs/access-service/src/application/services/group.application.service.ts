import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateGroupCommand,
  UpdateGroupCommand,
  DeleteGroupCommand,
  ActivateGroupCommand,
  DeactivateGroupCommand,
  SetGroupParentCommand,
  RemoveGroupParentCommand,
  AddUserToGroupCommand,
  RemoveUserFromGroupCommand,
  AssignPermissionToGroupCommand,
  RemovePermissionFromGroupCommand,
  CreateDefaultGroupCommand,
  EnsureUserInDefaultGroupCommand
} from '../commands/group.commands';
import {
  GetGroupByIdQuery,
  GetGroupByNameQuery,
  GetGroupsQuery,
  GetRootGroupsQuery,
  GetGroupChildrenQuery,
  GetGroupAncestorsQuery,
  GetGroupDescendantsQuery,
  GetGroupUsersQuery,
  GetUserGroupsQuery,
  GetGroupPermissionsQuery,
  GetGroupsByPermissionQuery,
  SearchGroupsQuery,
  GetActiveGroupsQuery,
  GetDefaultGroupQuery,
  GetGroupHierarchyQuery,
  GetGroupTreeQuery,
  GetGroupStatisticsQuery,
  CheckGroupHierarchyQuery,
  GetGroupPathQuery,
  GroupStatisticsDto,
  GroupPathDto
} from '../queries/group.queries';
import {
  CreateGroupData,
  UpdateGroupData,
  GroupDto,
  GroupHierarchyDto,
  GroupTreeDto,
  UserDto,
  PermissionDto
} from '../../domain/repositories';
import { QueryFilter, QueryOptions, PaginatedResponse } from '@enterprise/shared';
import { Group } from '../../domain/entities/group.entity';

@Injectable()
export class GroupApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // Command operations
  async createGroup(groupData: CreateGroupData, createdBy: string): Promise<Group> {
    return await this.commandBus.execute(
      new CreateGroupCommand(groupData, createdBy)
    );
  }

  async updateGroup(groupId: string, groupData: UpdateGroupData, updatedBy: string): Promise<Group> {
    return await this.commandBus.execute(
      new UpdateGroupCommand(groupId, groupData, updatedBy)
    );
  }

  async deleteGroup(groupId: string, deletedBy: string, reason?: string): Promise<void> {
    return await this.commandBus.execute(
      new DeleteGroupCommand(groupId, deletedBy, reason)
    );
  }

  async activateGroup(groupId: string, activatedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new ActivateGroupCommand(groupId, activatedBy)
    );
  }

  async deactivateGroup(groupId: string, deactivatedBy: string, reason?: string): Promise<void> {
    return await this.commandBus.execute(
      new DeactivateGroupCommand(groupId, deactivatedBy, reason)
    );
  }

  async setGroupParent(groupId: string, parentId: string, updatedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new SetGroupParentCommand(groupId, parentId, updatedBy)
    );
  }

  async removeGroupParent(groupId: string, updatedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new RemoveGroupParentCommand(groupId, updatedBy)
    );
  }

  async addUserToGroup(groupId: string, userId: string, addedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new AddUserToGroupCommand(groupId, userId, addedBy)
    );
  }

  async removeUserFromGroup(groupId: string, userId: string, removedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new RemoveUserFromGroupCommand(groupId, userId, removedBy)
    );
  }

  async assignPermissionToGroup(groupId: string, permissionName: string, assignedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new AssignPermissionToGroupCommand(groupId, permissionName, assignedBy)
    );
  }

  async removePermissionFromGroup(groupId: string, permissionName: string, removedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new RemovePermissionFromGroupCommand(groupId, permissionName, removedBy)
    );
  }

  async createDefaultGroup(createdBy: string): Promise<Group> {
    return await this.commandBus.execute(
      new CreateDefaultGroupCommand(createdBy)
    );
  }

  async ensureUserInDefaultGroup(userId: string, processedBy: string): Promise<void> {
    return await this.commandBus.execute(
      new EnsureUserInDefaultGroupCommand(userId, processedBy)
    );
  }

  // Query operations
  async getGroupById(groupId: string): Promise<GroupDto | null> {
    return await this.queryBus.execute(
      new GetGroupByIdQuery(groupId)
    );
  }

  async getGroupByName(name: string): Promise<GroupDto | null> {
    return await this.queryBus.execute(
      new GetGroupByNameQuery(name)
    );
  }

  async getGroups(filter?: QueryFilter, options?: QueryOptions): Promise<PaginatedResponse<GroupDto>> {
    return await this.queryBus.execute(
      new GetGroupsQuery(filter, options)
    );
  }

  async getRootGroups(options?: QueryOptions): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new GetRootGroupsQuery(options)
    );
  }

  async getGroupChildren(groupId: string, options?: QueryOptions): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new GetGroupChildrenQuery(groupId, options)
    );
  }

  async getGroupAncestors(groupId: string): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new GetGroupAncestorsQuery(groupId)
    );
  }

  async getGroupDescendants(groupId: string): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new GetGroupDescendantsQuery(groupId)
    );
  }

  async getGroupUsers(groupId: string, options?: QueryOptions): Promise<UserDto[]> {
    return await this.queryBus.execute(
      new GetGroupUsersQuery(groupId, options)
    );
  }

  async getUserGroups(userId: string, options?: QueryOptions): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new GetUserGroupsQuery(userId, options)
    );
  }

  async getGroupPermissions(groupId: string, includeInherited?: boolean): Promise<PermissionDto[]> {
    return await this.queryBus.execute(
      new GetGroupPermissionsQuery(groupId, includeInherited)
    );
  }

  async getGroupsByPermission(permissionName: string, options?: QueryOptions): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new GetGroupsByPermissionQuery(permissionName, options)
    );
  }

  async searchGroups(searchTerm: string, options?: QueryOptions): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new SearchGroupsQuery(searchTerm, options)
    );
  }

  async getActiveGroups(options?: QueryOptions): Promise<GroupDto[]> {
    return await this.queryBus.execute(
      new GetActiveGroupsQuery(options)
    );
  }

  async getDefaultGroup(): Promise<GroupDto> {
    return await this.queryBus.execute(
      new GetDefaultGroupQuery()
    );
  }

  async getGroupHierarchy(rootGroupId?: string): Promise<GroupHierarchyDto[]> {
    return await this.queryBus.execute(
      new GetGroupHierarchyQuery(rootGroupId)
    );
  }

  async getGroupTree(rootGroupId?: string): Promise<GroupTreeDto[]> {
    return await this.queryBus.execute(
      new GetGroupTreeQuery(rootGroupId)
    );
  }

  async getGroupStatistics(groupId?: string): Promise<GroupStatisticsDto> {
    return await this.queryBus.execute(
      new GetGroupStatisticsQuery(groupId)
    );
  }

  async checkGroupHierarchy(groupId: string, parentId: string): Promise<boolean> {
    return await this.queryBus.execute(
      new CheckGroupHierarchyQuery(groupId, parentId)
    );
  }

  async getGroupPath(groupId: string): Promise<GroupPathDto> {
    return await this.queryBus.execute(
      new GetGroupPathQuery(groupId)
    );
  }

  // Helper methods for common operations
  async createGroupWithDefaults(
    name: string,
    description: string,
    createdBy: string,
    parentId?: string,
    permissions?: string[],
    users?: string[]
  ): Promise<Group> {
    const groupData: CreateGroupData = {
      name,
      description,
      isActive: true,
      parentId,
      permissions: permissions || [],
      users: users || []
    };

    return await this.createGroup(groupData, createdBy);
  }

  async moveGroupToParent(groupId: string, newParentId: string, updatedBy: string): Promise<void> {
    // Validate the hierarchy first
    const isValidHierarchy = await this.checkGroupHierarchy(groupId, newParentId);
    if (!isValidHierarchy) {
      throw new Error('Invalid group hierarchy - would create a cycle');
    }

    await this.setGroupParent(groupId, newParentId, updatedBy);
  }

  async makeGroupRoot(groupId: string, updatedBy: string): Promise<void> {
    await this.removeGroupParent(groupId, updatedBy);
  }

  async bulkAddUsersToGroup(groupId: string, userIds: string[], addedBy: string): Promise<void> {
    const promises = userIds.map(userId => 
      this.addUserToGroup(groupId, userId, addedBy)
    );
    await Promise.all(promises);
  }

  async bulkRemoveUsersFromGroup(groupId: string, userIds: string[], removedBy: string): Promise<void> {
    const promises = userIds.map(userId => 
      this.removeUserFromGroup(groupId, userId, removedBy)
    );
    await Promise.all(promises);
  }

  async bulkAssignPermissionsToGroup(groupId: string, permissionNames: string[], assignedBy: string): Promise<void> {
    const promises = permissionNames.map(permissionName => 
      this.assignPermissionToGroup(groupId, permissionName, assignedBy)
    );
    await Promise.all(promises);
  }

  async bulkRemovePermissionsFromGroup(groupId: string, permissionNames: string[], removedBy: string): Promise<void> {
    const promises = permissionNames.map(permissionName => 
      this.removePermissionFromGroup(groupId, permissionName, removedBy)
    );
    await Promise.all(promises);
  }

  async getGroupFullHierarchy(groupId: string): Promise<{
    group: GroupDto;
    ancestors: GroupDto[];
    descendants: GroupDto[];
    path: GroupPathDto;
  }> {
    const [group, ancestors, descendants, path] = await Promise.all([
      this.getGroupById(groupId),
      this.getGroupAncestors(groupId),
      this.getGroupDescendants(groupId),
      this.getGroupPath(groupId)
    ]);

    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }

    return {
      group,
      ancestors,
      descendants,
      path
    };
  }

  async getGroupWithAllRelations(groupId: string): Promise<{
    group: GroupDto;
    users: UserDto[];
    permissions: PermissionDto[];
    allPermissions: PermissionDto[];
    children: GroupDto[];
    ancestors: GroupDto[];
  }> {
    const [group, users, permissions, allPermissions, children, ancestors] = await Promise.all([
      this.getGroupById(groupId),
      this.getGroupUsers(groupId),
      this.getGroupPermissions(groupId, false),
      this.getGroupPermissions(groupId, true),
      this.getGroupChildren(groupId),
      this.getGroupAncestors(groupId)
    ]);

    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }

    return {
      group,
      users,
      permissions,
      allPermissions,
      children,
      ancestors
    };
  }
}
