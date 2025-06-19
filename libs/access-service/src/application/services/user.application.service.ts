import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  ActivateUserCommand,
  DeactivateUserCommand,
  VerifyUserEmailCommand,
  ChangeUserPasswordCommand,
  AssignRoleToUserCommand,
  RemoveRoleFromUserCommand,
  AssignPermissionToUserCommand,
  RemovePermissionFromUserCommand,
  LockUserCommand,
  UnlockUserCommand
} from '../commands';
import {
  GetUserByIdQuery,
  GetUserByEmailQuery,
  GetUserProfileQuery,
  GetUsersQuery,
  GetActiveUsersQuery,
  SearchUsersQuery,
  GetUserPermissionsQuery,
  GetUserRolesQuery,
  CountActiveUsersQuery,
  GetUsersWithLockStatusQuery,
  CheckUserPermissionQuery,
  CheckUserRoleQuery,
  CheckMultiplePermissionsQuery,
  GetUserStatisticsQuery
} from '../queries';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserResponseDto,
  UserProfileDto,
  UserLockStatusDto,
  CheckPermissionDto,
  PermissionCheckResponseDto
} from '../dto';
import { PaginatedResult, QueryOptions } from '@enterprise/shared';

@Injectable()
export class UserApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // Command Operations
  async createUser(createUserDto: CreateUserDto, createdBy: string): Promise<UserResponseDto> {
    const command = new CreateUserCommand({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: createUserDto.password,
      isActive: createUserDto.isActive,
      roles: createUserDto.roles,
      permissions: createUserDto.permissions,
      preferences: {
        language: createUserDto.language,
        timezone: createUserDto.timezone,
        theme: createUserDto.theme,
        notifications: {
          email: createUserDto.emailNotifications ?? true,
          sms: createUserDto.smsNotifications ?? false,
          push: createUserDto.pushNotifications ?? true
        }
      }
    }, createdBy);

    const user = await this.commandBus.execute(command);
    return this.mapToUserResponse(user);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, updatedBy: string): Promise<UserResponseDto> {
    const command = new UpdateUserCommand(userId, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      isActive: updateUserDto.isActive,
      roles: updateUserDto.roles,
      permissions: updateUserDto.permissions,
      preferences: {
        language: updateUserDto.language,
        timezone: updateUserDto.timezone,
        theme: updateUserDto.theme,
        notifications: {
          email: updateUserDto.emailNotifications,
          sms: updateUserDto.smsNotifications,
          push: updateUserDto.pushNotifications
        }
      }
    }, updatedBy);

    const user = await this.commandBus.execute(command);
    return this.mapToUserResponse(user);
  }

  async deleteUser(userId: string, deletedBy: string, reason?: string): Promise<void> {
    const command = new DeleteUserCommand(userId, deletedBy, reason);
    await this.commandBus.execute(command);
  }

  async activateUser(userId: string, activatedBy: string): Promise<void> {
    const command = new ActivateUserCommand(userId, activatedBy);
    await this.commandBus.execute(command);
  }

  async deactivateUser(userId: string, deactivatedBy: string, reason?: string): Promise<void> {
    const command = new DeactivateUserCommand(userId, deactivatedBy, reason);
    await this.commandBus.execute(command);
  }

  async verifyUserEmail(userId: string, verifiedBy: string): Promise<void> {
    const command = new VerifyUserEmailCommand(userId, verifiedBy);
    await this.commandBus.execute(command);
  }

  async changeUserPassword(userId: string, newPasswordHash: string, changedBy: string): Promise<void> {
    const command = new ChangeUserPasswordCommand(userId, newPasswordHash, changedBy);
    await this.commandBus.execute(command);
  }

  async lockUser(userId: string, lockDuration: number, lockedBy: string, reason: string): Promise<void> {
    const command = new LockUserCommand(userId, lockDuration, lockedBy, reason);
    await this.commandBus.execute(command);
  }

  async unlockUser(userId: string, unlockedBy: string): Promise<void> {
    const command = new UnlockUserCommand(userId, unlockedBy);
    await this.commandBus.execute(command);
  }

  async assignRoleToUser(userId: string, roleName: string, assignedBy: string): Promise<void> {
    const command = new AssignRoleToUserCommand(userId, roleName, assignedBy);
    await this.commandBus.execute(command);
  }

  async removeRoleFromUser(userId: string, roleName: string, removedBy: string): Promise<void> {
    const command = new RemoveRoleFromUserCommand(userId, roleName, removedBy);
    await this.commandBus.execute(command);
  }

  async assignPermissionToUser(userId: string, permissionName: string, assignedBy: string): Promise<void> {
    const command = new AssignPermissionToUserCommand(userId, permissionName, assignedBy);
    await this.commandBus.execute(command);
  }

  async removePermissionFromUser(userId: string, permissionName: string, removedBy: string): Promise<void> {
    const command = new RemovePermissionFromUserCommand(userId, permissionName, removedBy);
    await this.commandBus.execute(command);
  }

  // Query Operations
  async getUserById(userId: string): Promise<UserResponseDto> {
    const query = new GetUserByIdQuery(userId);
    const user = await this.queryBus.execute(query);
    return this.mapToUserResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const query = new GetUserByEmailQuery(email);
    const user = await this.queryBus.execute(query);
    return user ? this.mapToUserResponse(user) : null;
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const query = new GetUserProfileQuery(userId);
    return this.queryBus.execute(query);
  }

  async getUsers(userQueryDto: UserQueryDto): Promise<PaginatedResult<UserResponseDto>> {
    const options: QueryOptions = {
      take: userQueryDto.take,
      skip: userQueryDto.skip,
      sortBy: userQueryDto.sortBy,
      order: userQueryDto.order
    };

    const query = new GetUsersQuery(
      options,
      userQueryDto.search,
      userQueryDto.isActive,
      userQueryDto.isEmailVerified,
      userQueryDto.isLocked,
      userQueryDto.role,
      userQueryDto.permission
    );

    const result = await this.queryBus.execute(query);
    
    return {
      ...result,
      data: result.data.map(user => this.mapToUserResponse(user))
    };
  }

  async getActiveUsers(options: QueryOptions = {}): Promise<UserResponseDto[]> {
    const query = new GetActiveUsersQuery(options);
    const users = await this.queryBus.execute(query);
    return users.map(user => this.mapToUserResponse(user));
  }

  async searchUsers(searchTerm: string, options: QueryOptions = {}): Promise<UserResponseDto[]> {
    const query = new SearchUsersQuery(searchTerm, options);
    const users = await this.queryBus.execute(query);
    return users.map(user => this.mapToUserResponse(user));
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const query = new GetUserPermissionsQuery(userId);
    return this.queryBus.execute(query);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const query = new GetUserRolesQuery(userId);
    return this.queryBus.execute(query);
  }

  async countActiveUsers(): Promise<number> {
    const query = new CountActiveUsersQuery();
    return this.queryBus.execute(query);
  }

  async getUsersWithLockStatus(): Promise<UserLockStatusDto[]> {
    const query = new GetUsersWithLockStatusQuery();
    return this.queryBus.execute(query);
  }

  // Permission and Security Operations
  async checkUserPermission(checkPermissionDto: CheckPermissionDto): Promise<PermissionCheckResponseDto> {
    const query = new CheckUserPermissionQuery(
      checkPermissionDto.userId,
      checkPermissionDto.resource,
      checkPermissionDto.action,
      checkPermissionDto.context ? JSON.parse(checkPermissionDto.context) : undefined
    );

    const hasPermission = await this.queryBus.execute(query);
    
    return {
      hasPermission,
      reason: hasPermission ? undefined : 'User does not have the required permission',
      conditions: checkPermissionDto.context ? JSON.parse(checkPermissionDto.context) : undefined
    };
  }

  async checkUserRole(userId: string, roleName: string): Promise<boolean> {
    const query = new CheckUserRoleQuery(userId, roleName);
    return this.queryBus.execute(query);
  }

  async checkMultiplePermissions(userId: string, permissions: Array<{ resource: string; action: string }>): Promise<Record<string, boolean>> {
    const query = new CheckMultiplePermissionsQuery(userId, permissions);
    return this.queryBus.execute(query);
  }

  // Analytics Operations
  async getUserStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    const query = new GetUserStatisticsQuery(startDate, endDate);
    return this.queryBus.execute(query);
  }

  // Helper Methods
  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      uuid: user.uuid,
      email: user.email.value || user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      isLocked: user.isLocked,
      lockedUntil: user.lockedUntil,
      loginAttempts: user.loginAttempts,
      preferences: user.preferences,
      roles: Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [],
      permissions: Array.isArray(user.permissions) ? user.permissions.map(p => typeof p === 'string' ? p : p.name) : [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
