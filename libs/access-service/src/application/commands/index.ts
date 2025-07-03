import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  UserRepository, 
  RoleRepository, 
  PermissionRepository,
  UserFactory,
  RoleFactory,
  PermissionFactory,
  CreateUserData,
  UpdateUserData,
  CreateRoleData,
  UpdateRoleData,
  CreatePermissionData,
  UpdatePermissionData
} from '../../domain/repositories';
import { User, Role, Permission } from '../../domain/entities/user.entity';
import { NotFoundError, ConflictError, ValidationError } from '@enterprise/shared';

// User Commands
export class CreateUserCommand implements ICommand {
  constructor(
    public readonly userData: CreateUserData,
    public readonly createdBy: string
  ) {}
}

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly userData: UpdateUserData,
    public readonly updatedBy: string
  ) {}
}

export class DeleteUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly deletedBy: string,
    public readonly reason?: string
  ) {}
}

export class ActivateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly activatedBy: string
  ) {}
}

export class DeactivateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string
  ) {}
}

export class VerifyUserEmailCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly verifiedBy: string
  ) {}
}

export class ChangeUserPasswordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly newPasswordHash: string,
    public readonly changedBy: string
  ) {}
}

export class LockUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly lockDuration: number, // in minutes
    public readonly lockedBy: string,
    public readonly reason: string
  ) {}
}

export class UnlockUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly unlockedBy: string
  ) {}
}

export class AssignRoleToUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleName: string,
    public readonly assignedBy: string
  ) {}
}

export class RemoveRoleFromUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleName: string,
    public readonly removedBy: string
  ) {}
}

export class AssignPermissionToUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly permissionName: string,
    public readonly assignedBy: string
  ) {}
}

export class RemovePermissionFromUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly permissionName: string,
    public readonly removedBy: string
  ) {}
}

// Role Commands
export class CreateRoleCommand implements ICommand {
  constructor(
    public readonly roleData: CreateRoleData,
    public readonly createdBy: string
  ) {}
}

export class UpdateRoleCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly roleData: UpdateRoleData,
    public readonly updatedBy: string
  ) {}
}

export class DeleteRoleCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly deletedBy: string,
    public readonly reason?: string
  ) {}
}

export class ActivateRoleCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly activatedBy: string
  ) {}
}

export class DeactivateRoleCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string
  ) {}
}

export class AssignPermissionToRoleCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly permissionName: string,
    public readonly assignedBy: string
  ) {}
}

export class RemovePermissionFromRoleCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly permissionName: string,
    public readonly removedBy: string
  ) {}
}

// Permission Commands
export class CreatePermissionCommand implements ICommand {
  constructor(
    public readonly permissionData: CreatePermissionData,
    public readonly createdBy: string
  ) {}
}

export class UpdatePermissionCommand implements ICommand {
  constructor(
    public readonly permissionId: string,
    public readonly permissionData: UpdatePermissionData,
    public readonly updatedBy: string
  ) {}
}

export class DeletePermissionCommand implements ICommand {
  constructor(
    public readonly permissionId: string,
    public readonly deletedBy: string,
    public readonly reason?: string
  ) {}
}

// Command Handlers
@CommandHandler(CreateUserCommand)
@Injectable()
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFactory: UserFactory,
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.userData.email);
    if (existingUser) {
      throw new ConflictError(`User with email ${command.userData.email} already exists`);
    }

    // Validate and create user
    await this.userFactory.validateUserData(command.userData);
    const user = await this.userFactory.createUser(command.userData);

    // Assign roles if provided
    if (command.userData.roles && command.userData.roles.length > 0) {
      for (const roleName of command.userData.roles) {
        const role = await this.roleRepository.findByName(roleName);
        if (role) {
          user.assignRole(role);
        }
      }
    }

    // Save user
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }
}

@CommandHandler(UpdateUserCommand)
@Injectable()
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFactory: UserFactory,
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Validate update data
    await this.userFactory.validateUserData(command.userData);

    // Update basic profile
    if (command.userData.firstName || command.userData.lastName || command.userData.preferences) {
      user.updateProfile(
        command.userData.firstName || user.firstName,
        command.userData.lastName || user.lastName,
        command.userData.preferences
      );
    }

    // Update status
    if (command.userData.isActive !== undefined) {
      if (command.userData.isActive) {
        user.activate();
      } else {
        user.deactivate();
      }
    }

    // Update roles if provided
    if (command.userData.roles) {
      // Remove all current roles
      for (const role of user.roles) {
        user.removeRole(role.name);
      }

      // Assign new roles
      for (const roleName of command.userData.roles) {
        const role = await this.roleRepository.findByName(roleName);
        if (role) {
          user.assignRole(role);
        }
      }
    }

    // Save user
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }
}

@CommandHandler(DeleteUserCommand)
@Injectable()
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Mark as deleted (soft delete)
    user.delete(command.deletedBy, command.reason);

    // Save user
    await this.userRepository.save(user);
  }
}

@CommandHandler(VerifyUserEmailCommand)
@Injectable()
export class VerifyUserEmailCommandHandler implements ICommandHandler<VerifyUserEmailCommand, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: VerifyUserEmailCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Verify email
    user.verifyEmail();

    // Save user
    await this.userRepository.save(user);
  }
}

@CommandHandler(ChangeUserPasswordCommand)
@Injectable()
export class ChangeUserPasswordCommandHandler implements ICommandHandler<ChangeUserPasswordCommand, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ChangeUserPasswordCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Update password
    user.updatePassword(command.newPasswordHash);

    // Save user
    await this.userRepository.save(user);
  }
}

@CommandHandler(AssignRoleToUserCommand)
@Injectable()
export class AssignRoleToUserCommandHandler implements ICommandHandler<AssignRoleToUserCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(command: AssignRoleToUserCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Find role
    const role = await this.roleRepository.findByName(command.roleName);
    if (!role) {
      throw new NotFoundError('Role', command.roleName);
    }

    // Assign role
    user.assignRole(role);

    // Save user
    await this.userRepository.save(user);
  }
}

@CommandHandler(RemoveRoleFromUserCommand)
@Injectable()
export class RemoveRoleFromUserCommandHandler implements ICommandHandler<RemoveRoleFromUserCommand, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: RemoveRoleFromUserCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Remove role
    user.removeRole(command.roleName);

    // Save user
    await this.userRepository.save(user);
  }
}

@CommandHandler(CreateRoleCommand)
@Injectable()
export class CreateRoleCommandHandler implements ICommandHandler<CreateRoleCommand, Role> {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleFactory: RoleFactory,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    // Check if role already exists
    const existingRole = await this.roleRepository.findByName(command.roleData.name);
    if (existingRole) {
      throw new ConflictError(`Role with name ${command.roleData.name} already exists`);
    }

    // Validate and create role
    await this.roleFactory.validateRoleData(command.roleData);
    const role = await this.roleFactory.createRole(command.roleData);

    // Assign permissions if provided
    if (command.roleData.permissions && command.roleData.permissions.length > 0) {
      for (const permissionName of command.roleData.permissions) {
        const permission = await this.permissionRepository.findByName(permissionName);
        if (permission) {
          role.assignPermission(permission);
        }
      }
    }

    // Save role
    const savedRole = await this.roleRepository.save(role);
    return savedRole;
  }
}

@CommandHandler(UpdateRoleCommand)
@Injectable()
export class UpdateRoleCommandHandler implements ICommandHandler<UpdateRoleCommand, Role> {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleFactory: RoleFactory,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(command: UpdateRoleCommand): Promise<Role> {
    // Find role
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new NotFoundError('Role', command.roleId);
    }

    // Validate update data
    await this.roleFactory.validateRoleData(command.roleData);

    // Update basic details
    if (command.roleData.name || command.roleData.description) {
      role.updateDetails(
        command.roleData.name || role.name,
        command.roleData.description || role.description
      );
    }

    // Update status
    if (command.roleData.isActive !== undefined) {
      if (command.roleData.isActive) {
        role.activate();
      } else {
        role.deactivate();
      }
    }

    // Update permissions if provided
    if (command.roleData.permissions) {
      // Remove all current permissions
      for (const permission of role.permissions) {
        role.removePermission(permission.name);
      }

      // Assign new permissions
      for (const permissionName of command.roleData.permissions) {
        const permission = await this.permissionRepository.findByName(permissionName);
        if (permission) {
          role.assignPermission(permission);
        }
      }
    }

    // Save role
    const savedRole = await this.roleRepository.save(role);
    return savedRole;
  }
}

@CommandHandler(CreatePermissionCommand)
@Injectable()
export class CreatePermissionCommandHandler implements ICommandHandler<CreatePermissionCommand, Permission> {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionFactory: PermissionFactory
  ) {}

  async execute(command: CreatePermissionCommand): Promise<Permission> {
    // Check if permission already exists
    const existingPermission = await this.permissionRepository.findByResourceAndAction(
      command.permissionData.resource,
      command.permissionData.action
    );
    if (existingPermission) {
      throw new ConflictError(
        `Permission for resource ${command.permissionData.resource} and action ${command.permissionData.action} already exists`
      );
    }

    // Validate and create permission
    await this.permissionFactory.validatePermissionData(command.permissionData);
    const permission = await this.permissionFactory.createPermission(command.permissionData);

    // Save permission
    const savedPermission = await this.permissionRepository.save(permission);
    return savedPermission;
  }
}

@CommandHandler(UpdatePermissionCommand)
@Injectable()
export class UpdatePermissionCommandHandler implements ICommandHandler<UpdatePermissionCommand, Permission> {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionFactory: PermissionFactory
  ) {}

  async execute(command: UpdatePermissionCommand): Promise<Permission> {
    // Find permission
    const permission = await this.permissionRepository.findById(command.permissionId);
    if (!permission) {
      throw new NotFoundError('Permission', command.permissionId);
    }

    // Validate update data
    await this.permissionFactory.validatePermissionData(command.permissionData);

    // Update permission details
    permission.updateDetails(
      command.permissionData.name || permission.name,
      command.permissionData.resource || permission.resource,
      command.permissionData.action || permission.action,
      command.permissionData.conditions
    );

    // Save permission
    const savedPermission = await this.permissionRepository.save(permission);
    return savedPermission;
  }
}

// Import Group Commands and Handlers
export * from './group.commands';
import { GroupCommandHandlers } from './group.commands';

// Export all command handlers
export const CommandHandlers = [
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  DeleteUserCommandHandler,
  VerifyUserEmailCommandHandler,
  ChangeUserPasswordCommandHandler,
  AssignRoleToUserCommandHandler,
  RemoveRoleFromUserCommandHandler,
  CreateRoleCommandHandler,
  UpdateRoleCommandHandler,
  CreatePermissionCommandHandler,
  UpdatePermissionCommandHandler,
  ...GroupCommandHandlers, // Include all Group command handlers
];