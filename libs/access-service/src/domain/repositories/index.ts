import { Repository, QueryFilter, QueryOptions, ReadModel } from '@enterprise/shared';
import { User, Role, Permission } from '../entities/user.entity';
import { Group } from '../entities/group.entity';

// User Repository Interface
export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithRoles(email: string): Promise<User | null>;
  findActiveUsers(options?: QueryOptions): Promise<User[]>;
  findUsersWithRole(roleName: string, options?: QueryOptions): Promise<User[]>;
  findUsersWithPermission(permissionName: string, options?: QueryOptions): Promise<User[]>;
  findAll(options?: QueryOptions): Promise<User[]>;
  countActiveUsers(): Promise<number>;
  existsByEmail(email: string): Promise<boolean>;
}

// Role Repository Interface
export interface RoleRepository extends Repository<Role> {
  findByName(name: string): Promise<Role | null>;
  findByNameWithPermissions(name: string): Promise<Role | null>;
  findActiveRoles(options?: QueryOptions): Promise<Role[]>;
  findRolesWithPermission(permissionName: string, options?: QueryOptions): Promise<Role[]>;
  findAll(options?: QueryOptions): Promise<Role[]>;
  countActiveRoles(): Promise<number>;
  existsByName(name: string): Promise<boolean>;
}

// Permission Repository Interface
export interface PermissionRepository extends Repository<Permission> {
  findByName(name: string): Promise<Permission | null>;
  findByResource(resource: string, options?: QueryOptions): Promise<Permission[]>;
  findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
  findPermissionsForUser(userId: string): Promise<Permission[]>;
  findPermissionsForRole(roleId: string): Promise<Permission[]>;
  findAll(options?: QueryOptions): Promise<Permission[]>;
  existsByName(name: string): Promise<boolean>;
  existsByResourceAndAction(resource: string, action: string): Promise<boolean>;
}

// Read Models for Queries
export interface UserReadModel extends ReadModel<UserDto> {
  findByEmailForAuth(email: string): Promise<UserAuthDto | null>;
  findUserProfile(userId: string): Promise<UserProfileDto | null>;
  findUserPermissions(userId: string): Promise<string[]>;
  findUserRoles(userId: string): Promise<string[]>;
  searchUsers(searchTerm: string, options?: QueryOptions): Promise<UserDto[]>;
  getUsersWithExpiredSessions(): Promise<UserDto[]>;
  getUsersWithLockStatus(): Promise<UserLockStatusDto[]>;
}

export interface RoleReadModel extends ReadModel<RoleDto> {
  findRolePermissions(roleId: string): Promise<string[]>;
  findRoleUsers(roleId: string, options?: QueryOptions): Promise<UserDto[]>;
  searchRoles(searchTerm: string, options?: QueryOptions): Promise<RoleDto[]>;
  getRoleHierarchy(): Promise<RoleHierarchyDto[]>;
}

export interface PermissionReadModel extends ReadModel<PermissionDto> {
  findPermissionUsers(permissionId: string, options?: QueryOptions): Promise<UserDto[]>;
  findPermissionRoles(permissionId: string, options?: QueryOptions): Promise<RoleDto[]>;
  searchPermissions(searchTerm: string, options?: QueryOptions): Promise<PermissionDto[]>;
  getPermissionsByResource(resource: string): Promise<PermissionDto[]>;
  getResourcesWithPermissions(): Promise<ResourcePermissionDto[]>;
}

// DTOs for Read Models
export interface UserDto {
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

export interface UserAuthDto {
  id: string;
  uuid: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isLocked: boolean;
  lockedUntil?: Date;
  loginAttempts: number;
  roles: string[];
  permissions: string[];
}

export interface UserProfileDto {
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
  roles: RoleDto[];
  permissions: PermissionDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLockStatusDto {
  id: string;
  uuid: string;
  email: string;
  fullName: string;
  isLocked: boolean;
  lockedUntil?: Date;
  loginAttempts: number;
  lastFailedAttempt?: Date;
}

export interface RoleDto {
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

export interface RoleHierarchyDto {
  id: string;
  uuid: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: PermissionDto[];
  childRoles: RoleHierarchyDto[];
  userCount: number;
}

export interface PermissionDto {
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

export interface ResourcePermissionDto {
  resource: string;
  permissions: {
    action: string;
    permissionId: string;
    permissionName: string;
    conditions?: Record<string, any>;
  }[];
}

// Factory Interfaces
export interface UserFactory {
  createUser(data: CreateUserData): Promise<User>;
  createUserFromKeycloak(keycloakUser: KeycloakUserData): Promise<User>;
  updateUser(user: User, data: UpdateUserData): Promise<User>;
  hashPassword(password: string): Promise<string>;
  validatePassword(password: string, hash: string): Promise<boolean>;
  validateUserData(data: CreateUserData | UpdateUserData): Promise<void>;
}

export interface RoleFactory {
  createRole(data: CreateRoleData): Promise<Role>;
  updateRole(role: Role, data: UpdateRoleData): Promise<Role>;
  validateRoleData(data: CreateRoleData | UpdateRoleData): Promise<void>;
  createSystemRoles(): Promise<Role[]>;
}

export interface PermissionFactory {
  createPermission(data: CreatePermissionData): Promise<Permission>;
  updatePermission(permission: Permission, data: UpdatePermissionData): Promise<Permission>;
  validatePermissionData(data: CreatePermissionData | UpdatePermissionData): Promise<void>;
  createSystemPermissions(): Promise<Permission[]>;
}

// Factory Data Types
export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isActive?: boolean;
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: 'light' | 'dark';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  roles?: string[];
  permissions?: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: 'light' | 'dark';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  roles?: string[];
  permissions?: string[];
}

export interface KeycloakUserData {
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles?: string[];
  attributes?: Record<string, any>;
}

export interface CreateRoleData {
  name: string;
  description: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface CreatePermissionData {
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface UpdatePermissionData {
  name?: string;
  resource?: string;
  action?: string;
  conditions?: Record<string, any>;
}

// Auth Service Interfaces
export interface AuthService {
  login(email: string, password: string, ipAddress: string, userAgent: string): Promise<AuthResult>;
  loginWithKeycloak(keycloakToken: string, ipAddress: string, userAgent: string): Promise<AuthResult>;
  logout(userId: string, sessionDuration: number): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  validateToken(token: string): Promise<TokenValidationResult>;
  resetPassword(email: string): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendEmailVerification(email: string): Promise<void>;
}

export interface AuthResult {
  user: UserProfileDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  error?: string;
}

// Permission Service Interface
export interface PermissionService {
  hasPermission(userId: string, resource: string, action: string): Promise<boolean>;
  hasRole(userId: string, roleName: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  getUserRoles(userId: string): Promise<Role[]>;
  checkMultiplePermissions(userId: string, permissions: Array<{ resource: string; action: string }>): Promise<Record<string, boolean>>;
  evaluateConditions(permission: Permission, context: Record<string, any>): Promise<boolean>;
}

// Keycloak Integration Interface
export interface KeycloakService {
  authenticateUser(email: string, password: string): Promise<KeycloakTokens>;
  validateToken(token: string): Promise<KeycloakUserInfo>;
  refreshToken(refreshToken: string): Promise<KeycloakTokens>;
  getUserInfo(token: string): Promise<KeycloakUserData>;
  createUser(userData: CreateUserData): Promise<string>;
  updateUser(keycloakId: string, userData: UpdateUserData): Promise<void>;
  deleteUser(keycloakId: string): Promise<void>;
  assignRoleToUser(keycloakId: string, roleName: string): Promise<void>;
  removeRoleFromUser(keycloakId: string, roleName: string): Promise<void>;
  resetPassword(keycloakId: string): Promise<void>;
  sendEmailVerification(keycloakId: string): Promise<void>;
}

export interface KeycloakTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles: string[];
  permissions: string[];
}

// Session Service Interface
export interface SessionService {
  createSession(userId: string, deviceInfo: DeviceInfo): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  updateSession(sessionId: string, data: Partial<SessionData>): Promise<void>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: string): Promise<void>;
  getActiveSessions(userId: string): Promise<Session[]>;
  cleanupExpiredSessions(): Promise<number>;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  data: SessionData;
  createdAt: Date;
  lastAccessAt: Date;
  expiresAt: Date;
}

export interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
}

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  permissions?: string[];
  roles?: string[];
  preferences?: Record<string, any>;
  lastActivity?: Date;
}

// Audit Service Interface
export interface AuditService {
  logUserAction(userId: string, action: string, resource: string, details?: Record<string, any>): Promise<void>;
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  logSystemEvent(event: SystemEvent): Promise<void>;
  getAuditLogs(filter: AuditLogFilter, options?: QueryOptions): Promise<AuditLog[]>;
  getUserAuditLogs(userId: string, options?: QueryOptions): Promise<AuditLog[]>;
  getSecurityEvents(options?: QueryOptions): Promise<SecurityEvent[]>;
  exportAuditLogs(filter: AuditLogFilter, format: 'csv' | 'json' | 'pdf'): Promise<Buffer>;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
}

export interface SecurityEvent {
  id: string;
  type: 'login_success' | 'login_failure' | 'logout' | 'password_change' | 'account_locked' | 'suspicious_activity';
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface SystemEvent {
  id: string;
  type: 'service_start' | 'service_stop' | 'error' | 'performance_issue' | 'security_scan';
  service: string;
  message: string;
  details?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resource?: string;
  level?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
}

// Group Repository Interface
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

// Group Read Model Interface
export interface GroupReadModel extends ReadModel<GroupDto> {
  findGroupPermissions(groupId: string): Promise<string[]>;
  findGroupUsers(groupId: string, options?: QueryOptions): Promise<UserDto[]>;
  findGroupChildren(groupId: string): Promise<GroupDto[]>;
  findGroupAncestors(groupId: string): Promise<GroupDto[]>;
  searchGroups(searchTerm: string, options?: QueryOptions): Promise<GroupDto[]>;
  getGroupHierarchy(): Promise<GroupHierarchyDto[]>;
  getGroupTree(): Promise<GroupTreeDto[]>;
}

// Group DTOs
export interface GroupDto {
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
  permissions: PermissionDto[];
  allPermissions: PermissionDto[];
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

export interface GroupHierarchyDto {
  id: string;
  uuid: string;
  name: string;
  description: string;
  isActive: boolean;
  path: string;
  level: number;
  permissions: PermissionDto[];
  children: GroupHierarchyDto[];
  userCount: number;
}

export interface GroupTreeDto {
  id: string;
  name: string;
  isActive: boolean;
  children: GroupTreeDto[];
  userCount: number;
  permissionCount: number;
}

// Group Factory Interface
export interface GroupFactory {
  createGroup(data: CreateGroupData): Promise<Group>;
  updateGroup(group: Group, data: UpdateGroupData): Promise<Group>;
  validateGroupData(data: CreateGroupData | UpdateGroupData): Promise<void>;
  createDefaultGroup(): Promise<Group>;
  validateGroupHierarchy(groupId: string, parentId?: string): Promise<void>;
}

// Group Factory Data Types
export interface CreateGroupData {
  name: string;
  description: string;
  isActive?: boolean;
  parentId?: string;
  permissions?: string[];
  users?: string[];
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  isActive?: boolean;
  parentId?: string;
  permissions?: string[];
  users?: string[];
}

// Export all interfaces
export * from '../entities/user.entity';