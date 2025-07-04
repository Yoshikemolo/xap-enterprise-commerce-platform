import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  UserReadModel, 
  RoleReadModel, 
  PermissionReadModel,
  UserDto,
  UserAuthDto,
  UserProfileDto,
  UserLockStatusDto,
  RoleDto,
  RoleHierarchyDto,
  PermissionDto,
  ResourcePermissionDto
} from '../../domain/repositories';
import { QueryOptions, QueryFilter, PaginatedResult, NotFoundError } from '@enterprise/shared';

// Import all query definitions
export * from './user.queries';
export * from './role.queries';
export * from './permission.queries';
export * from './security.queries';
export * from './analytics.queries';
export * from './group.queries'; // Add Group queries

// Import specific queries for handlers
import { 
  GetUserByIdQuery,
  GetUserByUuidQuery,
  GetUserByEmailQuery,
  GetUserByEmailForAuthQuery,
  GetUserProfileQuery,
  GetUsersQuery,
  GetActiveUsersQuery,
  SearchUsersQuery,
  GetUserPermissionsQuery,
  GetUserRolesQuery,
  CountActiveUsersQuery,
  GetUsersWithExpiredSessionsQuery,
  GetUsersWithLockStatusQuery
} from './user.queries';

import {
  GetRoleByIdQuery,
  GetRoleByUuidQuery,
  GetRoleByNameQuery,
  GetRolesQuery,
  GetActiveRolesQuery,
  SearchRolesQuery,
  GetRolePermissionsQuery,
  GetRoleUsersQuery,
  GetRoleHierarchyQuery,
  CountActiveRolesQuery
} from './role.queries';

import {
  GetPermissionByIdQuery,
  GetPermissionByUuidQuery,
  GetPermissionByNameQuery,
  GetPermissionsQuery,
  GetPermissionsByResourceQuery,
  SearchPermissionsQuery,
  GetPermissionUsersQuery,
  GetPermissionRolesQuery,
  GetResourcesWithPermissionsQuery
} from './permission.queries';

import {
  CheckUserPermissionQuery,
  CheckUserRoleQuery,
  CheckMultiplePermissionsQuery
} from './security.queries';

import {
  GetUserStatisticsQuery,
  GetRoleStatisticsQuery,
  GetPermissionStatisticsQuery
} from './analytics.queries';

// Import Group queries
import { GroupQueryHandlers } from './group.queries';

// User Query Handlers
@QueryHandler(GetUserByIdQuery)
@Injectable()
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    const user = await this.userReadModel.findById(query.userId);
    if (!user) {
      throw new NotFoundError('User', query.userId);
    }
    return user;
  }
}

@QueryHandler(GetUserByUuidQuery)
@Injectable()
export class GetUserByUuidQueryHandler implements IQueryHandler<GetUserByUuidQuery, UserDto> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserByUuidQuery): Promise<UserDto> {
    const user = await this.userReadModel.findByUuid(query.uuid);
    if (!user) {
      throw new NotFoundError('User', query.uuid);
    }
    return user;
  }
}

@QueryHandler(GetUserByEmailQuery)
@Injectable()
export class GetUserByEmailQueryHandler implements IQueryHandler<GetUserByEmailQuery, UserDto | null> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserByEmailQuery): Promise<UserDto | null> {
    return this.userReadModel.findByField('email', query.email);
  }
}

@QueryHandler(GetUserByEmailForAuthQuery)
@Injectable()
export class GetUserByEmailForAuthQueryHandler implements IQueryHandler<GetUserByEmailForAuthQuery, UserAuthDto | null> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserByEmailForAuthQuery): Promise<UserAuthDto | null> {
    return this.userReadModel.findByEmailForAuth(query.email);
  }
}

@QueryHandler(GetUserProfileQuery)
@Injectable()
export class GetUserProfileQueryHandler implements IQueryHandler<GetUserProfileQuery, UserProfileDto> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserProfileQuery): Promise<UserProfileDto> {
    const profile = await this.userReadModel.findUserProfile(query.userId);
    if (!profile) {
      throw new NotFoundError('User profile', query.userId);
    }
    return profile;
  }
}

@QueryHandler(GetUsersQuery)
@Injectable()
export class GetUsersQueryHandler implements IQueryHandler<GetUsersQuery, PaginatedResult<UserDto>> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUsersQuery): Promise<PaginatedResult<UserDto>> {
    const filters: QueryFilter[] = [];
    
    if (query.isActive !== undefined) {
      filters.push({ field: 'isActive', operator: 'eq', value: query.isActive });
    }
    if (query.isEmailVerified !== undefined) {
      filters.push({ field: 'isEmailVerified', operator: 'eq', value: query.isEmailVerified });
    }
    if (query.isLocked !== undefined) {
      filters.push({ field: 'isLocked', operator: 'eq', value: query.isLocked });
    }
    if (query.roleName) {
      filters.push({ field: 'role', operator: 'eq', value: query.roleName });
    }
    if (query.permissionName) {
      filters.push({ field: 'permission', operator: 'eq', value: query.permissionName });
    }

    if (query.searchTerm) {
      return this.userReadModel.searchPaginated(query.searchTerm, query.options);
    }

    return this.userReadModel.findPaginated(filters, query.options);
  }
}

@QueryHandler(GetActiveUsersQuery)
@Injectable()
export class GetActiveUsersQueryHandler implements IQueryHandler<GetActiveUsersQuery, UserDto[]> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetActiveUsersQuery): Promise<UserDto[]> {
    const conditions = { isActive: true };
    return this.userReadModel.findBy(conditions, query.options);
  }
}

@QueryHandler(SearchUsersQuery)
@Injectable()
export class SearchUsersQueryHandler implements IQueryHandler<SearchUsersQuery, UserDto[]> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: SearchUsersQuery): Promise<UserDto[]> {
    return this.userReadModel.searchUsers(query.searchTerm, query.options);
  }
}

@QueryHandler(GetUserPermissionsQuery)
@Injectable()
export class GetUserPermissionsQueryHandler implements IQueryHandler<GetUserPermissionsQuery, string[]> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserPermissionsQuery): Promise<string[]> {
    return this.userReadModel.findUserPermissions(query.userId);
  }
}

@QueryHandler(GetUserRolesQuery)
@Injectable()
export class GetUserRolesQueryHandler implements IQueryHandler<GetUserRolesQuery, string[]> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserRolesQuery): Promise<string[]> {
    return this.userReadModel.findUserRoles(query.userId);
  }
}

@QueryHandler(CountActiveUsersQuery)
@Injectable()
export class CountActiveUsersQueryHandler implements IQueryHandler<CountActiveUsersQuery, number> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: CountActiveUsersQuery): Promise<number> {
    return this.userReadModel.count({ isActive: true });
  }
}

@QueryHandler(GetUsersWithExpiredSessionsQuery)
@Injectable()
export class GetUsersWithExpiredSessionsQueryHandler implements IQueryHandler<GetUsersWithExpiredSessionsQuery, UserDto[]> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUsersWithExpiredSessionsQuery): Promise<UserDto[]> {
    return this.userReadModel.getUsersWithExpiredSessions();
  }
}

@QueryHandler(GetUsersWithLockStatusQuery)
@Injectable()
export class GetUsersWithLockStatusQueryHandler implements IQueryHandler<GetUsersWithLockStatusQuery, UserLockStatusDto[]> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUsersWithLockStatusQuery): Promise<UserLockStatusDto[]> {
    return this.userReadModel.getUsersWithLockStatus();
  }
}

// Role Query Handlers
@QueryHandler(GetRoleByIdQuery)
@Injectable()
export class GetRoleByIdQueryHandler implements IQueryHandler<GetRoleByIdQuery, RoleDto> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRoleByIdQuery): Promise<RoleDto> {
    const role = await this.roleReadModel.findById(query.roleId);
    if (!role) {
      throw new NotFoundError('Role', query.roleId);
    }
    return role;
  }
}

@QueryHandler(GetRoleByUuidQuery)
@Injectable()
export class GetRoleByUuidQueryHandler implements IQueryHandler<GetRoleByUuidQuery, RoleDto> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRoleByUuidQuery): Promise<RoleDto> {
    const role = await this.roleReadModel.findByUuid(query.uuid);
    if (!role) {
      throw new NotFoundError('Role', query.uuid);
    }
    return role;
  }
}

@QueryHandler(GetRoleByNameQuery)
@Injectable()
export class GetRoleByNameQueryHandler implements IQueryHandler<GetRoleByNameQuery, RoleDto | null> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRoleByNameQuery): Promise<RoleDto | null> {
    return this.roleReadModel.findByField('name', query.name);
  }
}

@QueryHandler(GetRolesQuery)
@Injectable()
export class GetRolesQueryHandler implements IQueryHandler<GetRolesQuery, PaginatedResult<RoleDto>> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRolesQuery): Promise<PaginatedResult<RoleDto>> {
    const filters: QueryFilter[] = [];
    
    if (query.isActive !== undefined) {
      filters.push({ field: 'isActive', operator: 'eq', value: query.isActive });
    }
    if (query.permissionName) {
      filters.push({ field: 'permission', operator: 'eq', value: query.permissionName });
    }

    if (query.searchTerm) {
      return this.roleReadModel.searchPaginated(query.searchTerm, query.options);
    }

    return this.roleReadModel.findPaginated(filters, query.options);
  }
}

@QueryHandler(GetActiveRolesQuery)
@Injectable()
export class GetActiveRolesQueryHandler implements IQueryHandler<GetActiveRolesQuery, RoleDto[]> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetActiveRolesQuery): Promise<RoleDto[]> {
    const conditions = { isActive: true };
    return this.roleReadModel.findBy(conditions, query.options);
  }
}

@QueryHandler(SearchRolesQuery)
@Injectable()
export class SearchRolesQueryHandler implements IQueryHandler<SearchRolesQuery, RoleDto[]> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: SearchRolesQuery): Promise<RoleDto[]> {
    return this.roleReadModel.searchRoles(query.searchTerm, query.options);
  }
}

@QueryHandler(GetRolePermissionsQuery)
@Injectable()
export class GetRolePermissionsQueryHandler implements IQueryHandler<GetRolePermissionsQuery, string[]> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRolePermissionsQuery): Promise<string[]> {
    return this.roleReadModel.findRolePermissions(query.roleId);
  }
}

@QueryHandler(GetRoleUsersQuery)
@Injectable()
export class GetRoleUsersQueryHandler implements IQueryHandler<GetRoleUsersQuery, UserDto[]> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRoleUsersQuery): Promise<UserDto[]> {
    return this.roleReadModel.findRoleUsers(query.roleId, query.options);
  }
}

@QueryHandler(GetRoleHierarchyQuery)
@Injectable()
export class GetRoleHierarchyQueryHandler implements IQueryHandler<GetRoleHierarchyQuery, RoleHierarchyDto[]> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRoleHierarchyQuery): Promise<RoleHierarchyDto[]> {
    return this.roleReadModel.getRoleHierarchy();
  }
}

@QueryHandler(CountActiveRolesQuery)
@Injectable()
export class CountActiveRolesQueryHandler implements IQueryHandler<CountActiveRolesQuery, number> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: CountActiveRolesQuery): Promise<number> {
    return this.roleReadModel.count({ isActive: true });
  }
}

// Permission Query Handlers
@QueryHandler(GetPermissionByIdQuery)
@Injectable()
export class GetPermissionByIdQueryHandler implements IQueryHandler<GetPermissionByIdQuery, PermissionDto> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionByIdQuery): Promise<PermissionDto> {
    const permission = await this.permissionReadModel.findById(query.permissionId);
    if (!permission) {
      throw new NotFoundError('Permission', query.permissionId);
    }
    return permission;
  }
}

@QueryHandler(GetPermissionByUuidQuery)
@Injectable()
export class GetPermissionByUuidQueryHandler implements IQueryHandler<GetPermissionByUuidQuery, PermissionDto> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionByUuidQuery): Promise<PermissionDto> {
    const permission = await this.permissionReadModel.findByUuid(query.uuid);
    if (!permission) {
      throw new NotFoundError('Permission', query.uuid);
    }
    return permission;
  }
}

@QueryHandler(GetPermissionByNameQuery)
@Injectable()
export class GetPermissionByNameQueryHandler implements IQueryHandler<GetPermissionByNameQuery, PermissionDto | null> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionByNameQuery): Promise<PermissionDto | null> {
    return this.permissionReadModel.findByField('name', query.name);
  }
}

@QueryHandler(GetPermissionsQuery)
@Injectable()
export class GetPermissionsQueryHandler implements IQueryHandler<GetPermissionsQuery, PaginatedResult<PermissionDto>> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionsQuery): Promise<PaginatedResult<PermissionDto>> {
    const filters: QueryFilter[] = [];
    
    if (query.resource) {
      filters.push({ field: 'resource', operator: 'eq', value: query.resource });
    }
    if (query.action) {
      filters.push({ field: 'action', operator: 'eq', value: query.action });
    }

    if (query.searchTerm) {
      return this.permissionReadModel.searchPaginated(query.searchTerm, query.options);
    }

    return this.permissionReadModel.findPaginated(filters, query.options);
  }
}

@QueryHandler(GetPermissionsByResourceQuery)
@Injectable()
export class GetPermissionsByResourceQueryHandler implements IQueryHandler<GetPermissionsByResourceQuery, PermissionDto[]> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionsByResourceQuery): Promise<PermissionDto[]> {
    return this.permissionReadModel.getPermissionsByResource(query.resource);
  }
}

@QueryHandler(SearchPermissionsQuery)
@Injectable()
export class SearchPermissionsQueryHandler implements IQueryHandler<SearchPermissionsQuery, PermissionDto[]> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: SearchPermissionsQuery): Promise<PermissionDto[]> {
    return this.permissionReadModel.searchPermissions(query.searchTerm, query.options);
  }
}

@QueryHandler(GetPermissionUsersQuery)
@Injectable()
export class GetPermissionUsersQueryHandler implements IQueryHandler<GetPermissionUsersQuery, UserDto[]> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionUsersQuery): Promise<UserDto[]> {
    return this.permissionReadModel.findPermissionUsers(query.permissionId, query.options);
  }
}

@QueryHandler(GetPermissionRolesQuery)
@Injectable()
export class GetPermissionRolesQueryHandler implements IQueryHandler<GetPermissionRolesQuery, RoleDto[]> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionRolesQuery): Promise<RoleDto[]> {
    return this.permissionReadModel.findPermissionRoles(query.permissionId, query.options);
  }
}

@QueryHandler(GetResourcesWithPermissionsQuery)
@Injectable()
export class GetResourcesWithPermissionsQueryHandler implements IQueryHandler<GetResourcesWithPermissionsQuery, ResourcePermissionDto[]> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetResourcesWithPermissionsQuery): Promise<ResourcePermissionDto[]> {
    return this.permissionReadModel.getResourcesWithPermissions();
  }
}

// Security Query Handlers
@QueryHandler(CheckUserPermissionQuery)
@Injectable()
export class CheckUserPermissionQueryHandler implements IQueryHandler<CheckUserPermissionQuery, boolean> {
  constructor(
    private readonly userReadModel: UserReadModel,
    private readonly permissionReadModel: PermissionReadModel
  ) {}

  async execute(query: CheckUserPermissionQuery): Promise<boolean> {
    const userPermissions = await this.userReadModel.findUserPermissions(query.userId);
    
    // Check direct permission name match
    const directPermission = userPermissions.find(p => p === `${query.resource}:${query.action}`);
    if (directPermission) return true;

    // Check with context evaluation if needed
    if (query.context) {
      // Note: We need to implement a method to get user permissions with full details
      // For now, we'll skip context evaluation and return false
      // TODO: Implement proper permission context evaluation
      return false;
    }

    return false;
  }

  private evaluateConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    // Simple condition evaluation - can be extended with a rules engine
    for (const [key, expectedValue] of Object.entries(conditions)) {
      if (context[key] !== expectedValue) {
        return false;
      }
    }
    return true;
  }
}

@QueryHandler(CheckUserRoleQuery)
@Injectable()
export class CheckUserRoleQueryHandler implements IQueryHandler<CheckUserRoleQuery, boolean> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: CheckUserRoleQuery): Promise<boolean> {
    const userRoles = await this.userReadModel.findUserRoles(query.userId);
    return userRoles.includes(query.roleName);
  }
}

@QueryHandler(CheckMultiplePermissionsQuery)
@Injectable()
export class CheckMultiplePermissionsQueryHandler implements IQueryHandler<CheckMultiplePermissionsQuery, Record<string, boolean>> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: CheckMultiplePermissionsQuery): Promise<Record<string, boolean>> {
    const userPermissions = await this.userReadModel.findUserPermissions(query.userId);
    const result: Record<string, boolean> = {};

    for (const permission of query.permissions) {
      const permissionKey = `${permission.resource}:${permission.action}`;
      result[permissionKey] = userPermissions.includes(permissionKey);
    }

    return result;
  }
}

// Analytics Query Handlers
@QueryHandler(GetUserStatisticsQuery)
@Injectable()
export class GetUserStatisticsQueryHandler implements IQueryHandler<GetUserStatisticsQuery, any> {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserStatisticsQuery): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      lockedUsers
    ] = await Promise.all([
      this.userReadModel.count(),
      this.userReadModel.count([{ field: 'isActive', operator: 'eq', value: true }]),
      this.userReadModel.count([{ field: 'isEmailVerified', operator: 'eq', value: true }]),
      this.userReadModel.count([{ field: 'isLocked', operator: 'eq', value: true }])
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      verified: verifiedUsers,
      unverified: totalUsers - verifiedUsers,
      locked: lockedUsers,
      unlocked: totalUsers - lockedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    };
  }
}

@QueryHandler(GetRoleStatisticsQuery)
@Injectable()
export class GetRoleStatisticsQueryHandler implements IQueryHandler<GetRoleStatisticsQuery, any> {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async execute(query: GetRoleStatisticsQuery): Promise<any> {
    const [
      totalRoles,
      activeRoles
    ] = await Promise.all([
      this.roleReadModel.count(),
      this.roleReadModel.count([{ field: 'isActive', operator: 'eq', value: true }])
    ]);

    return {
      total: totalRoles,
      active: activeRoles,
      inactive: totalRoles - activeRoles,
      activeRate: totalRoles > 0 ? (activeRoles / totalRoles) * 100 : 0
    };
  }
}

@QueryHandler(GetPermissionStatisticsQuery)
@Injectable()
export class GetPermissionStatisticsQueryHandler implements IQueryHandler<GetPermissionStatisticsQuery, any> {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async execute(query: GetPermissionStatisticsQuery): Promise<any> {
    const totalPermissions = await this.permissionReadModel.count();
    const resourcesWithPermissions = await this.permissionReadModel.getResourcesWithPermissions();
    
    const resourceCount = resourcesWithPermissions.length;
    const avgPermissionsPerResource = resourceCount > 0 ? totalPermissions / resourceCount : 0;

    return {
      total: totalPermissions,
      resources: resourceCount,
      averagePerResource: Math.round(avgPermissionsPerResource * 100) / 100,
      resourcesWithPermissions
    };
  }
}

// Export all Query Handlers
export const QueryHandlers = [
  // User Query Handlers
  GetUserByIdQueryHandler,
  GetUserByUuidQueryHandler,
  GetUserByEmailQueryHandler,
  GetUserByEmailForAuthQueryHandler,
  GetUserProfileQueryHandler,
  GetUsersQueryHandler,
  GetActiveUsersQueryHandler,
  SearchUsersQueryHandler,
  GetUserPermissionsQueryHandler,
  GetUserRolesQueryHandler,
  CountActiveUsersQueryHandler,
  GetUsersWithExpiredSessionsQueryHandler,
  GetUsersWithLockStatusQueryHandler,

  // Role Query Handlers
  GetRoleByIdQueryHandler,
  GetRoleByUuidQueryHandler,
  GetRoleByNameQueryHandler,
  GetRolesQueryHandler,
  GetActiveRolesQueryHandler,
  SearchRolesQueryHandler,
  GetRolePermissionsQueryHandler,
  GetRoleUsersQueryHandler,
  GetRoleHierarchyQueryHandler,
  CountActiveRolesQueryHandler,

  // Permission Query Handlers
  GetPermissionByIdQueryHandler,
  GetPermissionByUuidQueryHandler,
  GetPermissionByNameQueryHandler,
  GetPermissionsQueryHandler,
  GetPermissionsByResourceQueryHandler,
  SearchPermissionsQueryHandler,
  GetPermissionUsersQueryHandler,
  GetPermissionRolesQueryHandler,
  GetResourcesWithPermissionsQueryHandler,

  // Security Query Handlers
  CheckUserPermissionQueryHandler,
  CheckUserRoleQueryHandler,
  CheckMultiplePermissionsQueryHandler,

  // Analytics Query Handlers
  GetUserStatisticsQueryHandler,
  GetRoleStatisticsQueryHandler,
  GetPermissionStatisticsQueryHandler,

  // Group Query Handlers
  ...GroupQueryHandlers, // Include all Group query handlers
];
