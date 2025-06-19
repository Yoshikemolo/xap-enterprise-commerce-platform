import { IQuery } from '@nestjs/cqrs';
import { QueryOptions } from '@enterprise/shared';

// Permission Queries
export class GetPermissionByIdQuery implements IQuery {
  constructor(public readonly permissionId: string) {}
}

export class GetPermissionByUuidQuery implements IQuery {
  constructor(public readonly uuid: string) {}
}

export class GetPermissionByNameQuery implements IQuery {
  constructor(public readonly name: string) {}
}

export class GetPermissionByResourceAndActionQuery implements IQuery {
  constructor(
    public readonly resource: string,
    public readonly action: string
  ) {}
}

export class GetPermissionsQuery implements IQuery {
  constructor(
    public readonly options: QueryOptions = {},
    public readonly searchTerm?: string,
    public readonly resource?: string,
    public readonly action?: string
  ) {}
}

export class GetPermissionsByResourceQuery implements IQuery {
  constructor(
    public readonly resource: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetPermissionsForUserQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetPermissionsForRoleQuery implements IQuery {
  constructor(public readonly roleId: string) {}
}

export class SearchPermissionsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetPermissionUsersQuery implements IQuery {
  constructor(
    public readonly permissionId: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetPermissionRolesQuery implements IQuery {
  constructor(
    public readonly permissionId: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetResourcesWithPermissionsQuery implements IQuery {
  constructor() {}
}

export class CheckPermissionExistsByNameQuery implements IQuery {
  constructor(public readonly name: string) {}
}

export class CheckPermissionExistsByResourceAndActionQuery implements IQuery {
  constructor(
    public readonly resource: string,
    public readonly action: string
  ) {}
}

export class GetAllResourcesQuery implements IQuery {
  constructor() {}
}

export class GetAllActionsQuery implements IQuery {
  constructor() {}
}

export class GetActionsForResourceQuery implements IQuery {
  constructor(public readonly resource: string) {}
}

export class GetResourcesForActionQuery implements IQuery {
  constructor(public readonly action: string) {}
}

export class GetSystemPermissionsQuery implements IQuery {
  constructor() {}
}

export class GetCustomPermissionsQuery implements IQuery {
  constructor(public readonly options: QueryOptions = {}) {}
}

export class GetPermissionsWithConditionsQuery implements IQuery {
  constructor(public readonly options: QueryOptions = {}) {}
}

export class GetUnusedPermissionsQuery implements IQuery {
  constructor() {}
}

export class GetMostUsedPermissionsQuery implements IQuery {
  constructor(public readonly limit: number = 10) {}
}

export class GetPermissionUsageStatisticsQuery implements IQuery {
  constructor(public readonly permissionId: string) {}
}

export class GetPermissionDependenciesQuery implements IQuery {
  constructor(public readonly permissionId: string) {}
}

export class GetPermissionConflictsQuery implements IQuery {
  constructor() {}
}

export class GetPermissionsByComplexityQuery implements IQuery {
  constructor(
    public readonly hasConditions?: boolean,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetPermissionMatrixQuery implements IQuery {
  constructor() {}
}

export class GetPermissionAssignmentHistoryQuery implements IQuery {
  constructor(
    public readonly permissionId: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class ValidatePermissionConditionsQuery implements IQuery {
  constructor(
    public readonly permissionId: string,
    public readonly context: Record<string, any>
  ) {}
}
