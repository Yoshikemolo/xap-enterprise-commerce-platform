import {
  StringField,
  OptionalStringField,
  EmailField,
  OptionalEmailField,
  BooleanField,
  OptionalBooleanField,
  UuidField,
  OptionalUuidField,
  ArrayField,
  OptionalArrayField,
  PaginationField,
  SkipField,
  SortByField,
  OrderField,
  EnumField,
  OptionalEnumField,
  CreateEntityDto,
  UpdateEntityDto
} from '@enterprise/shared';

// Base Query DTO
export class BaseQueryDto {
  @PaginationField()
  take?: number = 10;

  @SkipField()
  skip?: number = 0;

  @SortByField(['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'name'])
  sortBy?: string = 'createdAt';

  @OrderField()
  order?: 'ASC' | 'DESC' = 'ASC';
}

// User DTOs
@CreateEntityDto()
export class CreateUserDto {
  @EmailField({ description: 'User email address' })
  email: string;

  @StringField({ description: 'User first name', min: 1, max: 100 })
  firstName: string;

  @StringField({ description: 'User last name', min: 1, max: 100 })
  lastName: string;

  @StringField({ description: 'User password', min: 8, max: 128 })
  password: string;

  @OptionalBooleanField({ description: 'Whether the user is active' })
  isActive?: boolean = true;

  @OptionalArrayField(String, { description: 'Role names to assign to the user' })
  roles?: string[] = [];

  @OptionalArrayField(String, { description: 'Permission names to assign to the user' })
  permissions?: string[] = [];

  @OptionalStringField({ description: 'Preferred language', max: 10 })
  language?: string = 'es';

  @OptionalStringField({ description: 'Preferred timezone', max: 50 })
  timezone?: string = 'Europe/Madrid';

  @OptionalEnumField(['light', 'dark'], { description: 'UI theme preference' })
  theme?: 'light' | 'dark' = 'light';

  @OptionalBooleanField({ description: 'Email notifications enabled' })
  emailNotifications?: boolean = true;

  @OptionalBooleanField({ description: 'SMS notifications enabled' })
  smsNotifications?: boolean = false;

  @OptionalBooleanField({ description: 'Push notifications enabled' })
  pushNotifications?: boolean = true;
}

@UpdateEntityDto()
export class UpdateUserDto {
  @OptionalStringField({ description: 'User first name', min: 1, max: 100 })
  firstName?: string;

  @OptionalStringField({ description: 'User last name', min: 1, max: 100 })
  lastName?: string;

  @OptionalBooleanField({ description: 'Whether the user is active' })
  isActive?: boolean;

  @OptionalArrayField(String, { description: 'Role names to assign to the user' })
  roles?: string[];

  @OptionalArrayField(String, { description: 'Permission names to assign to the user' })
  permissions?: string[];

  @OptionalStringField({ description: 'Preferred language', max: 10 })
  language?: string;

  @OptionalStringField({ description: 'Preferred timezone', max: 50 })
  timezone?: string;

  @OptionalEnumField(['light', 'dark'], { description: 'UI theme preference' })
  theme?: 'light' | 'dark';

  @OptionalBooleanField({ description: 'Email notifications enabled' })
  emailNotifications?: boolean;

  @OptionalBooleanField({ description: 'SMS notifications enabled' })
  smsNotifications?: boolean;

  @OptionalBooleanField({ description: 'Push notifications enabled' })
  pushNotifications?: boolean;
}

export class ChangePasswordDto {
  @StringField({ description: 'Current password', min: 8, max: 128 })
  currentPassword: string;

  @StringField({ description: 'New password', min: 8, max: 128 })
  newPassword: string;

  @StringField({ description: 'Confirm new password', min: 8, max: 128 })
  confirmPassword: string;
}

export class ResetPasswordDto {
  @EmailField({ description: 'User email address' })
  email: string;
}

export class LoginDto {
  @EmailField({ description: 'User email address' })
  email: string;

  @StringField({ description: 'User password', min: 1 })
  password: string;

  @OptionalBooleanField({ description: 'Remember login for extended session' })
  rememberMe?: boolean = false;
}

export class RefreshTokenDto {
  @StringField({ description: 'Refresh token' })
  refreshToken: string;
}

export class VerifyEmailDto {
  @StringField({ description: 'Email verification token' })
  token: string;
}

export class ResendVerificationDto {
  @EmailField({ description: 'User email address' })
  email: string;
}

export class UserQueryDto extends BaseQueryDto {
  @OptionalStringField({ description: 'Search term for email, first name, or last name' })
  search?: string;

  @OptionalBooleanField({ description: 'Filter by active status' })
  isActive?: boolean;

  @OptionalBooleanField({ description: 'Filter by email verification status' })
  isEmailVerified?: boolean;

  @OptionalBooleanField({ description: 'Filter by lock status' })
  isLocked?: boolean;

  @OptionalStringField({ description: 'Filter by role name' })
  role?: string;

  @OptionalStringField({ description: 'Filter by permission name' })
  permission?: string;

  @SortByField(['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'lastLoginAt'])
  sortBy?: string = 'createdAt';
}

// Role DTOs
@CreateEntityDto()
export class CreateRoleDto {
  @StringField({ description: 'Role name', min: 1, max: 100 })
  name: string;

  @StringField({ description: 'Role description', min: 1, max: 500 })
  description: string;

  @OptionalBooleanField({ description: 'Whether the role is active' })
  isActive?: boolean = true;

  @OptionalArrayField(String, { description: 'Permission names to assign to the role' })
  permissions?: string[] = [];
}

@UpdateEntityDto()
export class UpdateRoleDto {
  @OptionalStringField({ description: 'Role name', min: 1, max: 100 })
  name?: string;

  @OptionalStringField({ description: 'Role description', min: 1, max: 500 })
  description?: string;

  @OptionalBooleanField({ description: 'Whether the role is active' })
  isActive?: boolean;

  @OptionalArrayField(String, { description: 'Permission names to assign to the role' })
  permissions?: string[];
}

export class RoleQueryDto extends BaseQueryDto {
  @OptionalStringField({ description: 'Search term for name or description' })
  search?: string;

  @OptionalBooleanField({ description: 'Filter by active status' })
  isActive?: boolean;

  @OptionalStringField({ description: 'Filter by permission name' })
  permission?: string;

  @SortByField(['createdAt', 'updatedAt', 'name'])
  sortBy?: string = 'createdAt';
}

// Permission DTOs
@CreateEntityDto()
export class CreatePermissionDto {
  @StringField({ description: 'Permission name', min: 1, max: 100 })
  name: string;

  @StringField({ description: 'Resource name', min: 1, max: 100 })
  resource: string;

  @StringField({ description: 'Action name', min: 1, max: 100 })
  action: string;

  @OptionalStringField({ description: 'JSON conditions for the permission' })
  conditions?: string;
}

@UpdateEntityDto()
export class UpdatePermissionDto {
  @OptionalStringField({ description: 'Permission name', min: 1, max: 100 })
  name?: string;

  @OptionalStringField({ description: 'Resource name', min: 1, max: 100 })
  resource?: string;

  @OptionalStringField({ description: 'Action name', min: 1, max: 100 })
  action?: string;

  @OptionalStringField({ description: 'JSON conditions for the permission' })
  conditions?: string;
}

// Group DTOs
@CreateEntityDto()
export class CreateGroupDto {
  @StringField({ description: 'Group name', min: 1, max: 100 })
  name: string;

  @StringField({ description: 'Group description', min: 1, max: 500 })
  description: string;

  @OptionalBooleanField({ description: 'Whether the group is active' })
  isActive?: boolean = true;

  @OptionalUuidField({ description: 'Parent group ID for hierarchical structure' })
  parentId?: string;

  @OptionalArrayField(String, { description: 'Permission names to assign to the group' })
  permissions?: string[] = [];

  @OptionalArrayField(String, { description: 'User IDs to add to the group' })
  users?: string[] = [];
}

@UpdateEntityDto()
export class UpdateGroupDto {
  @OptionalStringField({ description: 'Group name', min: 1, max: 100 })
  name?: string;

  @OptionalStringField({ description: 'Group description', min: 1, max: 500 })
  description?: string;

  @OptionalBooleanField({ description: 'Whether the group is active' })
  isActive?: boolean;

  @OptionalUuidField({ description: 'Parent group ID for hierarchical structure' })
  parentId?: string;

  @OptionalArrayField(String, { description: 'Permission names to assign to the group' })
  permissions?: string[];

  @OptionalArrayField(String, { description: 'User IDs to add to the group' })
  users?: string[];
}

export class GroupQueryDto extends BaseQueryDto {
  @OptionalStringField({ description: 'Search term for name or description' })
  search?: string;

  @OptionalBooleanField({ description: 'Filter by active status' })
  isActive?: boolean;

  @OptionalUuidField({ description: 'Filter by parent group ID' })
  parentId?: string;

  @OptionalBooleanField({ description: 'Filter only root groups (no parent)' })
  rootOnly?: boolean;

  @OptionalStringField({ description: 'Filter by permission name' })
  permission?: string;

  @OptionalUuidField({ description: 'Filter groups that contain this user ID' })
  userId?: string;

  @SortByField(['createdAt', 'updatedAt', 'name', 'level'])
  sortBy?: string = 'createdAt';
}

export class AddUserToGroupDto {
  @UuidField({ description: 'User ID to add to the group' })
  userId: string;
}

export class RemoveUserFromGroupDto {
  @UuidField({ description: 'User ID to remove from the group' })
  userId: string;
}

export class AssignPermissionToGroupDto {
  @StringField({ description: 'Permission name to assign to the group', max: 100 })
  permissionName: string;
}

export class RemovePermissionFromGroupDto {
  @StringField({ description: 'Permission name to remove from the group', max: 100 })
  permissionName: string;
}

export class SetGroupParentDto {
  @UuidField({ description: 'Parent group ID' })
  parentId: string;
}

export class CheckGroupHierarchyDto {
  @UuidField({ description: 'Group ID' })
  groupId: string;

  @UuidField({ description: 'Potential parent group ID' })
  parentId: string;
}

// Response DTOs
export class GroupResponseDto {
  id: string;
  uuid: string;
  name: string;
  description: string;
  isActive: boolean;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
    path: string;
  };
  children: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
  users: {
    id: string;
    email: string;
    fullName: string;
  }[];
  permissions: PermissionResponseDto[];
  allPermissions: PermissionResponseDto[];
  path: string;
  level: number;
  isRootGroup: boolean;
  hasChildren: boolean;
  hasUsers: boolean;
  hasPermissions: boolean;
  isDefaultGroup: boolean;
  userCount: number;
  permissionCount: number;
  childrenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class GroupHierarchyResponseDto {
  id: string;
  uuid: string;
  name: string;
  description: string;
  isActive: boolean;
  path: string;
  level: number;
  permissions: PermissionResponseDto[];
  children: GroupHierarchyResponseDto[];
  userCount: number;
}

export class GroupTreeResponseDto {
  id: string;
  name: string;
  isActive: boolean;
  children: GroupTreeResponseDto[];
  userCount: number;
  permissionCount: number;
}

export class GroupStatisticsResponseDto {
  totalGroups: number;
  activeGroups: number;
  inactiveGroups: number;
  rootGroups: number;
  groupsWithUsers: number;
  groupsWithPermissions: number;
  averageUsersPerGroup: number;
  averagePermissionsPerGroup: number;
  maxDepthLevel: number;
  groupsByLevel: Record<number, number>;
}

export class GroupPathResponseDto {
  groupId: string;
  groupName: string;
  path: string;
  level: number;
  ancestors: Array<{
    id: string;
    name: string;
  }>;
}

export class PermissionQueryDto extends BaseQueryDto {
  @OptionalStringField({ description: 'Search term for name, resource, or action' })
  search?: string;

  @OptionalStringField({ description: 'Filter by resource name' })
  resource?: string;

  @OptionalStringField({ description: 'Filter by action name' })
  action?: string;

  @SortByField(['createdAt', 'updatedAt', 'name', 'resource', 'action'])
  sortBy?: string = 'createdAt';
}

export class CheckPermissionDto {
  @UuidField({ description: 'User ID' })
  userId: string;

  @StringField({ description: 'Resource name', max: 100 })
  resource: string;

  @StringField({ description: 'Action name', max: 100 })
  action: string;

  @OptionalStringField({ description: 'JSON context for condition evaluation' })
  context?: string;
}

// Response DTOs
export class UserResponseDto {
  id: string;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  isLocked: boolean;
  lockedUntil?: Date;
  loginAttempts: number;
  preferences: {
    language: string;
    timezone: string;
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class RoleResponseDto {
  id: string;
  uuid: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PermissionResponseDto {
  id: string;
  uuid: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  roleCount: number;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export class PermissionCheckResponseDto {
  hasPermission: boolean;
  reason?: string;
  conditions?: Record<string, any>;
}

// Health Check DTOs
export class HealthCheckResponseDto {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime: number;
      connections: number;
    };
    cache: {
      status: 'up' | 'down';
      responseTime: number;
      memoryUsage: number;
    };
    keycloak: {
      status: 'up' | 'down';
      responseTime: number;
    };
    messageBus: {
      status: 'up' | 'down';
      responseTime: number;
      queueSize: number;
    };
  };
  metrics: {
    activeUsers: number;
    totalSessions: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}

// Missing DTOs that are referenced in domain repositories
export class UserProfileDto {
  id: string;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  preferences: {
    language: string;
    timezone: string;
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  roles: RoleResponseDto[];
  permissions: PermissionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserLockStatusDto {
  id: string;
  uuid: string;
  email: string;
  fullName: string;
  isLocked: boolean;
  lockedUntil?: Date;
  loginAttempts: number;
  lastFailedAttempt?: Date;
}

export class RoleHierarchyDto {
  id: string;
  uuid: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: PermissionResponseDto[];
  childRoles: RoleHierarchyDto[];
  userCount: number;
}

export class ResourcePermissionDto {
  resource: string;
  permissions: {
    action: string;
    permissionId: string;
    permissionName: string;
    conditions?: Record<string, any>;
  }[];
}