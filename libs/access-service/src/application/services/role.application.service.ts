import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateRoleCommand,
  UpdateRoleCommand,
  DeleteRoleCommand,
  ActivateRoleCommand,
  DeactivateRoleCommand,
  AssignPermissionToRoleCommand,
  RemovePermissionFromRoleCommand
} from '../commands';
import {
  GetRoleByIdQuery,
  GetRoleByNameQuery,
  GetRolesQuery,
  GetActiveRolesQuery,
  SearchRolesQuery,
  GetRolePermissionsQuery,
  GetRoleUsersQuery,
  GetRoleHierarchyQuery,
  CountActiveRolesQuery,
  GetRoleStatisticsQuery
} from '../queries';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleQueryDto,
  RoleResponseDto,
  RoleHierarchyDto
} from '../dto';
import { PaginatedResult, QueryOptions } from '@enterprise/shared';

@Injectable()
export class RoleApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // Command Operations
  async createRole(createRoleDto: CreateRoleDto, createdBy: string): Promise<RoleResponseDto> {
    const command = new CreateRoleCommand({
      name: createRoleDto.name,
      description: createRoleDto.description,
      isActive: createRoleDto.isActive,
      permissions: createRoleDto.permissions
    }, createdBy);

    const role = await this.commandBus.execute(command);
    return this.mapToRoleResponse(role);
  }

  async updateRole(roleId: string, updateRoleDto: UpdateRoleDto, updatedBy: string): Promise<RoleResponseDto> {
    const command = new UpdateRoleCommand(roleId, {
      name: updateRoleDto.name,
      description: updateRoleDto.description,
      isActive: updateRoleDto.isActive,
      permissions: updateRoleDto.permissions
    }, updatedBy);

    const role = await this.commandBus.execute(command);
    return this.mapToRoleResponse(role);
  }

  async deleteRole(roleId: string, deletedBy: string, reason?: string): Promise<void> {
    const command = new DeleteRoleCommand(roleId, deletedBy, reason);
    await this.commandBus.execute(command);
  }

  async activateRole(roleId: string, activatedBy: string): Promise<void> {
    const command = new ActivateRoleCommand(roleId, activatedBy);
    await this.commandBus.execute(command);
  }

  async deactivateRole(roleId: string, deactivatedBy: string, reason?: string): Promise<void> {
    const command = new DeactivateRoleCommand(roleId, deactivatedBy, reason);
    await this.commandBus.execute(command);
  }

  async assignPermissionToRole(roleId: string, permissionName: string, assignedBy: string): Promise<void> {
    const command = new AssignPermissionToRoleCommand(roleId, permissionName, assignedBy);
    await this.commandBus.execute(command);
  }

  async removePermissionFromRole(roleId: string, permissionName: string, removedBy: string): Promise<void> {
    const command = new RemovePermissionFromRoleCommand(roleId, permissionName, removedBy);
    await this.commandBus.execute(command);
  }

  // Query Operations
  async getRoleById(roleId: string): Promise<RoleResponseDto> {
    const query = new GetRoleByIdQuery(roleId);
    const role = await this.queryBus.execute(query);
    return this.mapToRoleResponse(role);
  }

  async getRoleByName(name: string): Promise<RoleResponseDto | null> {
    const query = new GetRoleByNameQuery(name);
    const role = await this.queryBus.execute(query);
    return role ? this.mapToRoleResponse(role) : null;
  }

  async getRoles(roleQueryDto: RoleQueryDto): Promise<PaginatedResult<RoleResponseDto>> {
    const options: QueryOptions = {
      take: roleQueryDto.take,
      skip: roleQueryDto.skip,
      sortBy: roleQueryDto.sortBy,
      order: roleQueryDto.order
    };

    const query = new GetRolesQuery(
      options,
      roleQueryDto.search,
      roleQueryDto.isActive,
      roleQueryDto.permission
    );

    const result = await this.queryBus.execute(query);
    
    return {
      ...result,
      data: result.data.map(role => this.mapToRoleResponse(role))
    };
  }

  async getActiveRoles(options: QueryOptions = {}): Promise<RoleResponseDto[]> {
    const query = new GetActiveRolesQuery(options);
    const roles = await this.queryBus.execute(query);
    return roles.map(role => this.mapToRoleResponse(role));
  }

  async searchRoles(searchTerm: string, options: QueryOptions = {}): Promise<RoleResponseDto[]> {
    const query = new SearchRolesQuery(searchTerm, options);
    const roles = await this.queryBus.execute(query);
    return roles.map(role => this.mapToRoleResponse(role));
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const query = new GetRolePermissionsQuery(roleId);
    return this.queryBus.execute(query);
  }

  async getRoleUsers(roleId: string, options: QueryOptions = {}): Promise<any[]> {
    const query = new GetRoleUsersQuery(roleId, options);
    return this.queryBus.execute(query);
  }

  async getRoleHierarchy(): Promise<RoleHierarchyDto[]> {
    const query = new GetRoleHierarchyQuery();
    return this.queryBus.execute(query);
  }

  async countActiveRoles(): Promise<number> {
    const query = new CountActiveRolesQuery();
    return this.queryBus.execute(query);
  }

  // Analytics Operations
  async getRoleStatistics(): Promise<any> {
    const query = new GetRoleStatisticsQuery();
    return this.queryBus.execute(query);
  }

  // Helper Methods
  private mapToRoleResponse(role: any): RoleResponseDto {
    return {
      id: role.id,
      uuid: role.uuid,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: Array.isArray(role.permissions) ? role.permissions.map(p => typeof p === 'string' ? p : p.name) : [],
      userCount: role.userCount || 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }
}
