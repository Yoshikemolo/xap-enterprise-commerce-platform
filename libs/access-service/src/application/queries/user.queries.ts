import { IQuery } from '@nestjs/cqrs';
import { QueryOptions } from '@enterprise/shared';

// User Queries
export class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserByUuidQuery implements IQuery {
  constructor(public readonly uuid: string) {}
}

export class GetUserByEmailQuery implements IQuery {
  constructor(public readonly email: string) {}
}

export class GetUserByEmailForAuthQuery implements IQuery {
  constructor(public readonly email: string) {}
}

export class GetUserProfileQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetUsersQuery implements IQuery {
  constructor(
    public readonly options: QueryOptions = {},
    public readonly searchTerm?: string,
    public readonly isActive?: boolean,
    public readonly isEmailVerified?: boolean,
    public readonly isLocked?: boolean,
    public readonly roleName?: string,
    public readonly permissionName?: string
  ) {}
}

export class GetActiveUsersQuery implements IQuery {
  constructor(public readonly options: QueryOptions = {}) {}
}

export class GetUsersWithRoleQuery implements IQuery {
  constructor(
    public readonly roleName: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetUsersWithPermissionQuery implements IQuery {
  constructor(
    public readonly permissionName: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetUsersWithExpiredSessionsQuery implements IQuery {
  constructor() {}
}

export class GetUsersWithLockStatusQuery implements IQuery {
  constructor() {}
}

export class SearchUsersQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetUserPermissionsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserRolesQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class CountActiveUsersQuery implements IQuery {
  constructor() {}
}

export class CheckUserExistsByEmailQuery implements IQuery {
  constructor(public readonly email: string) {}
}

export class GetUserLoginHistoryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetUserSessionsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserSecurityEventsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetUserPreferencesQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

export class GetRecentlyActiveUsersQuery implements IQuery {
  constructor(
    public readonly hours: number = 24,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetInactiveUsersQuery implements IQuery {
  constructor(
    public readonly days: number = 30,
    public readonly options: QueryOptions = {}
  ) {}
}

export class GetUsersNeedingVerificationQuery implements IQuery {
  constructor(public readonly options: QueryOptions = {}) {}
}

export class GetUsersWithFailedLoginsQuery implements IQuery {
  constructor(
    public readonly threshold: number = 3,
    public readonly options: QueryOptions = {}
  ) {}
}
