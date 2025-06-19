import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreatePermissionCommand,
  UpdatePermissionCommand,
  DeletePermissionCommand
} from '../commands';
import {
  GetPermissionByIdQuery,
  GetPermissionByNameQuery,
  GetPermissionByResourceAndActionQuery,
  GetPermissionsQuery,
  GetPermissionsByResourceQuery,
  SearchPermissionsQuery,
  GetPermissionUsersQuery,
  GetPermissionRolesQuery,
  GetResourcesWithPermissionsQuery,
  GetPermissionStatisticsQuery,
  CheckPermissionExistsByNameQuery,
  CheckPermissionExistsByResourceAndActionQuery
} from '../queries';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionQueryDto,
  PermissionResponseDto,
  ResourcePermissionDto
} from '../dto';
import { PaginatedResult, QueryOptions } from '@enterprise/shared';

@Injectable()
export class PermissionApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // Command Operations
  async createPermission(createPermissionDto: CreatePermissionDto, createdBy: string): Promise<PermissionResponseDto> {
    const command = new CreatePermissionCommand({
      name: createPermissionDto.name,
      resource: createPermissionDto.resource,
      action: createPermissionDto.action,
      conditions: createPermissionDto.conditions ? JSON.parse(createPermissionDto.conditions) : undefined
    }, createdBy);

    const permission = await this.commandBus.execute(command);
    return this.mapToPermissionResponse(permission);
  }

  async updatePermission(permissionId: string, updatePermissionDto: UpdatePermissionDto, updatedBy: string): Promise<PermissionResponseDto> {
    const command = new UpdatePermissionCommand(permissionId, {
      name: updatePermissionDto.name,
      resource: updatePermissionDto.resource,
      action: updatePermissionDto.action,
      conditions: updatePermissionDto.conditions ? JSON.parse(updatePermissionDto.conditions) : undefined
    }, updatedBy);

    const permission = await this.commandBus.execute(command);
    return this.mapToPermissionResponse(permission);
  }

  async deletePermission(permissionId: string, deletedBy: string, reason?: string): Promise<void> {
    const command = new DeletePermissionCommand(permissionId, deletedBy, reason);
    await this.commandBus.execute(command);
  }

  // Query Operations
  async getPermissionById(permissionId: string): Promise<PermissionResponseDto> {
    const query = new GetPermissionByIdQuery(permissionId);
    const permission = await this.queryBus.execute(query);
    return this.mapToPermissionResponse(permission);
  }

  async getPermissionByName(name: string): Promise<PermissionResponseDto | null> {
    const query = new GetPermissionByNameQuery(name);
    const permission = await this.queryBus.execute(query);
    return permission ? this.mapToPermissionResponse(permission) : null;
  }

  async getPermissionByResourceAndAction(resource: string, action: string): Promise<PermissionResponseDto | null> {
    const query = new GetPermissionByResourceAndActionQuery(resource, action);
    const permission = await this.queryBus.execute(query);
    return permission ? this.mapToPermissionResponse(permission) : null;
  }

  async getPermissions(permissionQueryDto: PermissionQueryDto): Promise<PaginatedResult<PermissionResponseDto>> {
    const options: QueryOptions = {
      take: permissionQueryDto.take,
      skip: permissionQueryDto.skip,
      sortBy: permissionQueryDto.sortBy,
      order: permissionQueryDto.order
    };

    const query = new GetPermissionsQuery(
      options,
      permissionQueryDto.search,
      permissionQueryDto.resource,
      permissionQueryDto.action
    );

    const result = await this.queryBus.execute(query);
    
    return {
      ...result,
      data: result.data.map(permission => this.mapToPermissionResponse(permission))
    };
  }

  async getPermissionsByResource(resource: string, options: QueryOptions = {}): Promise<PermissionResponseDto[]> {
    const query = new GetPermissionsByResourceQuery(resource, options);
    const permissions = await this.queryBus.execute(query);
    return permissions.map(permission => this.mapToPermissionResponse(permission));
  }

  async searchPermissions(searchTerm: string, options: QueryOptions = {}): Promise<PermissionResponseDto[]> {
    const query = new SearchPermissionsQuery(searchTerm, options);
    const permissions = await this.queryBus.execute(query);
    return permissions.map(permission => this.mapToPermissionResponse(permission));
  }

  async getPermissionUsers(permissionId: string, options: QueryOptions = {}): Promise<any[]> {
    const query = new GetPermissionUsersQuery(permissionId, options);
    return this.queryBus.execute(query);
  }

  async getPermissionRoles(permissionId: string, options: QueryOptions = {}): Promise<any[]> {
    const query = new GetPermissionRolesQuery(permissionId, options);
    return this.queryBus.execute(query);
  }

  async getResourcesWithPermissions(): Promise<ResourcePermissionDto[]> {
    const query = new GetResourcesWithPermissionsQuery();
    return this.queryBus.execute(query);
  }

  async checkPermissionExistsByName(name: string): Promise<boolean> {
    const query = new CheckPermissionExistsByNameQuery(name);
    return this.queryBus.execute(query);
  }

  async checkPermissionExistsByResourceAndAction(resource: string, action: string): Promise<boolean> {
    const query = new CheckPermissionExistsByResourceAndActionQuery(resource, action);
    return this.queryBus.execute(query);
  }

  // Analytics Operations
  async getPermissionStatistics(): Promise<any> {
    const query = new GetPermissionStatisticsQuery();
    return this.queryBus.execute(query);
  }

  // Utility Methods
  async getAllResources(): Promise<string[]> {
    const resourcesWithPermissions = await this.getResourcesWithPermissions();
    return resourcesWithPermissions.map(rp => rp.resource);
  }

  async getAllActions(): Promise<string[]> {
    const resourcesWithPermissions = await this.getResourcesWithPermissions();
    const allActions = new Set<string>();
    
    resourcesWithPermissions.forEach(rp => {
      rp.permissions.forEach(p => {
        allActions.add(p.action);
      });
    });

    return Array.from(allActions);
  }

  async getActionsForResource(resource: string): Promise<string[]> {
    const permissions = await this.getPermissionsByResource(resource);
    return permissions.map(p => p.action);
  }

  async generatePermissionMatrix(): Promise<any> {
    const resourcesWithPermissions = await this.getResourcesWithPermissions();
    const matrix: Record<string, string[]> = {};

    resourcesWithPermissions.forEach(rp => {
      matrix[rp.resource] = rp.permissions.map(p => p.action);
    });

    return matrix;
  }

  // Helper Methods
  private mapToPermissionResponse(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      uuid: permission.uuid,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      conditions: permission.conditions,
      roleCount: permission.roleCount || 0,
      userCount: permission.userCount || 0,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    };
  }
}
