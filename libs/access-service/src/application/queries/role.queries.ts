import { IQuery } from '@nestjs/cqrs';
import { QueryOptions } from '@enterprise/shared';

// Role Queries
export class GetRoleByIdQuery implements IQuery {
  constructor(public readonly roleId: string) {}
}

export class GetRoleByUuidQuery implements IQuery {
  constructor(public readonly uuid: string) {}
}

export class GetRoleByNameQuery implements IQuery {
  constructor(public readonly name: string) {}
}

export class GetRoleByNameWithPermissionsQuery implements IQuery {
  constructor(public readonly name: string) {}
}

export class GetRolesQuery implements IQuery {
  constructor(
    public readonly options: QueryOptions = {},
    public readonly searchTerm?: string,
    public readonly isActive?: boolean,
    public readonly permissionName?: string
  ) {}
}

export class GetActiveRolesQuery implements IQuery {
  constructor(public readonly options: QueryOptions = {}) {}
}

export class GetRolesWithPermissionQuery implements IQuery {
  constructor(
    public readonly permissionName: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class SearchRolesQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetRolePermissionsQuery implements IQuery {
  constructor(public readonly roleId: string) {}
}

export class GetRoleUsersQuery implements IQuery {
  constructor(
    public readonly roleId: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetRoleHierarchyQuery implements IQuery {
  constructor() {}
}

export class CountActiveRolesQuery implements IQuery {
  constructor() {}
}

export class CheckRoleExistsByNameQuery implements IQuery {
  constructor(public readonly name: string) {}
}

export class GetSystemRolesQuery implements IQuery {
  constructor() {}
}

export class GetCustomRolesQuery implements IQuery {
  constructor(public readonly options: QueryOptions = {}) {}
}

export class GetRolesByPermissionCountQuery implements IQuery {
  constructor(
    public readonly minPermissions?: number,
    public readonly maxPermissions?: number,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetRolesByUserCountQuery implements IQuery {
  constructor(
    public readonly minUsers?: number,
    public readonly maxUsers?: number,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetMostUsedRolesQuery implements IQuery {
  constructor(public readonly limit: number = 10) {}
}

export class GetLeastUsedRolesQuery implements IQuery {
  constructor(public readonly limit: number = 10) {}
}

export class GetRoleUsageStatisticsQuery implements IQuery {
  constructor(public readonly roleId: string) {}
}

export class GetRoleConflictsQuery implements IQuery {
  constructor() {}
}

export class GetOrphanedRolesQuery implements IQuery {
  constructor() {}
}

export class GetRoleAssignmentHistoryQuery implements IQuery {
  constructor(
    public readonly roleId: string,
    public readonly options: QueryOptions = {}
  ) {}
}
