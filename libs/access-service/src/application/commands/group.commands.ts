import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GroupRepository, 
  UserRepository,
  PermissionRepository,
  GroupFactory,
  CreateGroupData,
  UpdateGroupData
} from '../../domain/repositories';
import { Group } from '../../domain/entities/group.entity';
import { NotFoundError, ConflictError, ValidationError } from '@enterprise/shared';

// Group Commands
export class CreateGroupCommand implements ICommand {
  constructor(
    public readonly groupData: CreateGroupData,
    public readonly createdBy: string
  ) {}
}

export class UpdateGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly groupData: UpdateGroupData,
    public readonly updatedBy: string
  ) {}
}

export class DeleteGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly deletedBy: string,
    public readonly reason?: string
  ) {}
}

export class ActivateGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly activatedBy: string
  ) {}
}

export class DeactivateGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string
  ) {}
}

export class SetGroupParentCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly parentId: string,
    public readonly updatedBy: string
  ) {}
}

export class RemoveGroupParentCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly updatedBy: string
  ) {}
}

export class AddUserToGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly userId: string,
    public readonly addedBy: string
  ) {}
}

export class RemoveUserFromGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly userId: string,
    public readonly removedBy: string
  ) {}
}

export class AssignPermissionToGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly permissionName: string,
    public readonly assignedBy: string
  ) {}
}

export class RemovePermissionFromGroupCommand implements ICommand {
  constructor(
    public readonly groupId: string,
    public readonly permissionName: string,
    public readonly removedBy: string
  ) {}
}

export class CreateDefaultGroupCommand implements ICommand {
  constructor(
    public readonly createdBy: string
  ) {}
}

export class EnsureUserInDefaultGroupCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly processedBy: string
  ) {}
}

// Command Handlers
@CommandHandler(CreateGroupCommand)
@Injectable()
export class CreateGroupCommandHandler implements ICommandHandler<CreateGroupCommand, Group> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupFactory: GroupFactory,
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(command: CreateGroupCommand): Promise<Group> {
    // Check if group already exists
    const existingGroup = await this.groupRepository.findByName(command.groupData.name);
    if (existingGroup) {
      throw new ConflictError(`Group with name ${command.groupData.name} already exists`);
    }

    // Validate parent hierarchy if parent is specified
    if (command.groupData.parentId) {
      const parent = await this.groupRepository.findById(command.groupData.parentId);
      if (!parent) {
        throw new NotFoundError('Parent Group', command.groupData.parentId);
      }

      const isValidHierarchy = await this.groupRepository.validateGroupHierarchy(
        '', // new group, no id yet
        command.groupData.parentId
      );
      if (!isValidHierarchy) {
        throw new ValidationError('Invalid group hierarchy - would create a cycle');
      }
    }

    // Validate and create group
    await this.groupFactory.validateGroupData(command.groupData);
    const group = await this.groupFactory.createGroup(command.groupData);

    // Assign permissions if provided
    if (command.groupData.permissions && command.groupData.permissions.length > 0) {
      for (const permissionName of command.groupData.permissions) {
        const permission = await this.permissionRepository.findByName(permissionName);
        if (permission) {
          group.assignPermission(permission);
        }
      }
    }

    // Add users if provided
    if (command.groupData.users && command.groupData.users.length > 0) {
      for (const userId of command.groupData.users) {
        const user = await this.userRepository.findById(userId);
        if (user) {
          group.addUser(user);
        }
      }
    }

    // Save group
    await this.groupRepository.save(group);
    return group;
  }
}

@CommandHandler(UpdateGroupCommand)
@Injectable()
export class UpdateGroupCommandHandler implements ICommandHandler<UpdateGroupCommand, Group> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupFactory: GroupFactory,
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(command: UpdateGroupCommand): Promise<Group> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Validate update data
    await this.groupFactory.validateGroupData(command.groupData);

    // Check for name conflicts if name is being changed
    if (command.groupData.name && command.groupData.name !== group.name) {
      const existsWithName = await this.groupRepository.existsByName(
        command.groupData.name, 
        command.groupId
      );
      if (existsWithName) {
        throw new ConflictError(`Group with name ${command.groupData.name} already exists`);
      }
    }

    // Update basic details
    if (command.groupData.name || command.groupData.description) {
      group.updateDetails(
        command.groupData.name || group.name,
        command.groupData.description || group.description
      );
    }

    // Update status
    if (command.groupData.isActive !== undefined) {
      if (command.groupData.isActive) {
        group.activate();
      } else {
        group.deactivate();
      }
    }

    // Update parent if specified
    if (command.groupData.parentId !== undefined) {
      if (command.groupData.parentId) {
        // Validate hierarchy
        const isValidHierarchy = await this.groupRepository.validateGroupHierarchy(
          command.groupId,
          command.groupData.parentId
        );
        if (!isValidHierarchy) {
          throw new ValidationError('Invalid group hierarchy - would create a cycle');
        }

        const parent = await this.groupRepository.findById(command.groupData.parentId);
        if (!parent) {
          throw new NotFoundError('Parent Group', command.groupData.parentId);
        }
        group.setParent(parent);
      } else {
        group.removeParent();
      }
    }

    // Update permissions if provided
    if (command.groupData.permissions) {
      // Remove all current permissions
      for (const permission of group.permissions) {
        group.removePermission(permission.name);
      }

      // Assign new permissions
      for (const permissionName of command.groupData.permissions) {
        const permission = await this.permissionRepository.findByName(permissionName);
        if (permission) {
          group.assignPermission(permission);
        }
      }
    }

    // Update users if provided
    if (command.groupData.users) {
      // Remove all current users (except for DefaultGroup)
      if (!group.isDefaultGroup) {
        for (const user of group.users) {
          group.removeUser(user.id);
        }

        // Add new users
        for (const userId of command.groupData.users) {
          const user = await this.userRepository.findById(userId);
          if (user) {
            group.addUser(user);
          }
        }
      }
    }

    // Save group
    await this.groupRepository.save(group);
    return group;
  }
}

@CommandHandler(DeleteGroupCommand)
@Injectable()
export class DeleteGroupCommandHandler implements ICommandHandler<DeleteGroupCommand, void> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: DeleteGroupCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Check if it's the default group
    if (group.isDefaultGroup) {
      throw new ValidationError('Cannot delete the default group');
    }

    // Mark as deleted (business logic will validate constraints)
    group.delete(command.deletedBy, command.reason);

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(ActivateGroupCommand)
@Injectable()
export class ActivateGroupCommandHandler implements ICommandHandler<ActivateGroupCommand, void> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: ActivateGroupCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Activate group
    group.activate();

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(DeactivateGroupCommand)
@Injectable()
export class DeactivateGroupCommandHandler implements ICommandHandler<DeactivateGroupCommand, void> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: DeactivateGroupCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Deactivate group (business logic will validate DefaultGroup constraint)
    group.deactivate();

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(SetGroupParentCommand)
@Injectable()
export class SetGroupParentCommandHandler implements ICommandHandler<SetGroupParentCommand, void> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: SetGroupParentCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Find parent
    const parent = await this.groupRepository.findById(command.parentId);
    if (!parent) {
      throw new NotFoundError('Parent Group', command.parentId);
    }

    // Validate hierarchy
    const isValidHierarchy = await this.groupRepository.validateGroupHierarchy(
      command.groupId,
      command.parentId
    );
    if (!isValidHierarchy) {
      throw new ValidationError('Invalid group hierarchy - would create a cycle');
    }

    // Set parent
    group.setParent(parent);

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(RemoveGroupParentCommand)
@Injectable()
export class RemoveGroupParentCommandHandler implements ICommandHandler<RemoveGroupParentCommand, void> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: RemoveGroupParentCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Remove parent (business logic will validate DefaultGroup constraint)
    group.removeParent();

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(AddUserToGroupCommand)
@Injectable()
export class AddUserToGroupCommandHandler implements ICommandHandler<AddUserToGroupCommand, void> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: AddUserToGroupCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Add user to group
    group.addUser(user);

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(RemoveUserFromGroupCommand)
@Injectable()
export class RemoveUserFromGroupCommandHandler implements ICommandHandler<RemoveUserFromGroupCommand, void> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: RemoveUserFromGroupCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Check if it's the default group
    if (group.isDefaultGroup) {
      throw new ValidationError('Cannot remove users from the default group');
    }

    // Remove user from group
    group.removeUser(command.userId);

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(AssignPermissionToGroupCommand)
@Injectable()
export class AssignPermissionToGroupCommandHandler implements ICommandHandler<AssignPermissionToGroupCommand, void> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(command: AssignPermissionToGroupCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Find permission
    const permission = await this.permissionRepository.findByName(command.permissionName);
    if (!permission) {
      throw new NotFoundError('Permission', command.permissionName);
    }

    // Assign permission
    group.assignPermission(permission);

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(RemovePermissionFromGroupCommand)
@Injectable()
export class RemovePermissionFromGroupCommandHandler implements ICommandHandler<RemovePermissionFromGroupCommand, void> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: RemovePermissionFromGroupCommand): Promise<void> {
    // Find group
    const group = await this.groupRepository.findById(command.groupId);
    if (!group) {
      throw new NotFoundError('Group', command.groupId);
    }

    // Remove permission
    group.removePermission(command.permissionName);

    // Save group
    await this.groupRepository.save(group);
  }
}

@CommandHandler(CreateDefaultGroupCommand)
@Injectable()
export class CreateDefaultGroupCommandHandler implements ICommandHandler<CreateDefaultGroupCommand, Group> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupFactory: GroupFactory
  ) {}

  async execute(command: CreateDefaultGroupCommand): Promise<Group> {
    // Check if default group already exists
    try {
      const existingDefaultGroup = await this.groupRepository.findDefaultGroup();
      return existingDefaultGroup; // Already exists, return it
    } catch (error) {
      // Default group doesn't exist, create it
    }

    // Create default group
    const defaultGroup = await this.groupFactory.createDefaultGroup();

    // Save group
    await this.groupRepository.save(defaultGroup);
    return defaultGroup;
  }
}

@CommandHandler(EnsureUserInDefaultGroupCommand)
@Injectable()
export class EnsureUserInDefaultGroupCommandHandler implements ICommandHandler<EnsureUserInDefaultGroupCommand, void> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: EnsureUserInDefaultGroupCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundError('User', command.userId);
    }

    // Find default group
    const defaultGroup = await this.groupRepository.findDefaultGroup();

    // Check if user is already in default group
    if (!defaultGroup.hasUser(command.userId)) {
      // Add user to default group
      defaultGroup.addUser(user);

      // Save group
      await this.groupRepository.save(defaultGroup);
    }
  }
}

// Export all Group command handlers
export const GroupCommandHandlers = [
  CreateGroupCommandHandler,
  UpdateGroupCommandHandler,
  DeleteGroupCommandHandler,
  ActivateGroupCommandHandler,
  DeactivateGroupCommandHandler,
  SetGroupParentCommandHandler,
  RemoveGroupParentCommandHandler,
  AddUserToGroupCommandHandler,
  RemoveUserFromGroupCommandHandler,
  AssignPermissionToGroupCommandHandler,
  RemovePermissionFromGroupCommandHandler,
  CreateDefaultGroupCommandHandler,
  EnsureUserInDefaultGroupCommandHandler,
];
