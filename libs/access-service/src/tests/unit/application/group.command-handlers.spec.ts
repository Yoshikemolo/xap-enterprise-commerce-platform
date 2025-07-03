import { Test, TestingModule } from '@nestjs/testing';
import { 
  CreateGroupCommandHandler,
  UpdateGroupCommandHandler,
  DeleteGroupCommandHandler,
  AddUserToGroupCommandHandler,
  AssignPermissionToGroupCommandHandler,
  CreateDefaultGroupCommandHandler
} from '../../../application/commands/group.commands';
import {
  CreateGroupCommand,
  UpdateGroupCommand,
  DeleteGroupCommand,
  AddUserToGroupCommand,
  AssignPermissionToGroupCommand,
  CreateDefaultGroupCommand
} from '../../../application/commands/group.commands';
import { GroupRepository, UserRepository, PermissionRepository, GroupFactory } from '../../../domain/repositories';
import { Group } from '../../../domain/entities/group.entity';
import { User, Permission } from '../../../domain/entities/user.entity';
import { ConflictError, NotFoundError, ValidationError } from '@enterprise/shared';

describe('Group Command Handlers', () => {
  let moduleRef: TestingModule;
  let groupRepository: jest.Mocked<GroupRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let permissionRepository: jest.Mocked<PermissionRepository>;
  let groupFactory: jest.Mocked<GroupFactory>;

  beforeEach(async () => {
    const mockGroupRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      validateGroupHierarchy: jest.fn(),
      findDefaultGroup: jest.fn(),
    };

    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockPermissionRepository = {
      findByName: jest.fn(),
    };

    const mockGroupFactory = {
      validateGroupData: jest.fn(),
      createGroup: jest.fn(),
      createDefaultGroup: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        CreateGroupCommandHandler,
        UpdateGroupCommandHandler,
        DeleteGroupCommandHandler,
        AddUserToGroupCommandHandler,
        AssignPermissionToGroupCommandHandler,
        CreateDefaultGroupCommandHandler,
        { provide: GroupRepository, useValue: mockGroupRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PermissionRepository, useValue: mockPermissionRepository },
        { provide: GroupFactory, useValue: mockGroupFactory },
      ],
    }).compile();

    groupRepository = moduleRef.get(GroupRepository);
    userRepository = moduleRef.get(UserRepository);
    permissionRepository = moduleRef.get(PermissionRepository);
    groupFactory = moduleRef.get(GroupFactory);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('CreateGroupCommandHandler', () => {
    let handler: CreateGroupCommandHandler;
    let mockGroup: Group;

    beforeEach(() => {
      handler = moduleRef.get(CreateGroupCommandHandler);
      mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
      } as Group;
    });

    it('should create group successfully', async () => {
      const command = new CreateGroupCommand({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
      }, 'admin');

      groupRepository.findByName.mockResolvedValue(null);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupFactory.createGroup.mockResolvedValue(mockGroup);
      groupRepository.save.mockResolvedValue(undefined);

      const result = await handler.execute(command);

      expect(result).toBe(mockGroup);
      expect(groupRepository.findByName).toHaveBeenCalledWith('Test Group');
      expect(groupFactory.validateGroupData).toHaveBeenCalledWith(command.groupData);
      expect(groupFactory.createGroup).toHaveBeenCalledWith(command.groupData);
      expect(groupRepository.save).toHaveBeenCalledWith(mockGroup);
    });

    it('should throw ConflictError if group name already exists', async () => {
      const command = new CreateGroupCommand({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
      }, 'admin');

      groupRepository.findByName.mockResolvedValue(mockGroup);

      await expect(handler.execute(command)).rejects.toThrow(ConflictError);
      expect(groupRepository.findByName).toHaveBeenCalledWith('Test Group');
    });

    it('should validate parent hierarchy when parent is specified', async () => {
      const parentGroup = { id: 'parent-123' } as Group;
      const command = new CreateGroupCommand({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
        parentId: 'parent-123',
      }, 'admin');

      groupRepository.findByName.mockResolvedValue(null);
      groupRepository.findById.mockResolvedValue(parentGroup);
      groupRepository.validateGroupHierarchy.mockResolvedValue(true);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupFactory.createGroup.mockResolvedValue(mockGroup);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(groupRepository.findById).toHaveBeenCalledWith('parent-123');
      expect(groupRepository.validateGroupHierarchy).toHaveBeenCalledWith('', 'parent-123');
    });

    it('should throw NotFoundError if parent group does not exist', async () => {
      const command = new CreateGroupCommand({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
        parentId: 'non-existent-parent',
      }, 'admin');

      groupRepository.findByName.mockResolvedValue(null);
      groupRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid hierarchy', async () => {
      const parentGroup = { id: 'parent-123' } as Group;
      const command = new CreateGroupCommand({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
        parentId: 'parent-123',
      }, 'admin');

      groupRepository.findByName.mockResolvedValue(null);
      groupRepository.findById.mockResolvedValue(parentGroup);
      groupRepository.validateGroupHierarchy.mockResolvedValue(false);

      await expect(handler.execute(command)).rejects.toThrow(ValidationError);
    });

    it('should assign permissions when provided', async () => {
      const mockPermission = { id: 'permission-123', name: 'test:read' } as Permission;
      const command = new CreateGroupCommand({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
        permissions: ['test:read'],
      }, 'admin');

      const mockGroupWithAssignPermission = {
        ...mockGroup,
        assignPermission: jest.fn(),
      } as Group & { assignPermission: jest.Mock };

      groupRepository.findByName.mockResolvedValue(null);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupFactory.createGroup.mockResolvedValue(mockGroupWithAssignPermission);
      permissionRepository.findByName.mockResolvedValue(mockPermission);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(permissionRepository.findByName).toHaveBeenCalledWith('test:read');
      expect(mockGroupWithAssignPermission.assignPermission).toHaveBeenCalledWith(mockPermission);
    });

    it('should add users when provided', async () => {
      const mockUser = { id: 'user-123' } as User;
      const command = new CreateGroupCommand({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
        users: ['user-123'],
      }, 'admin');

      const mockGroupWithAddUser = {
        ...mockGroup,
        addUser: jest.fn(),
      } as Group & { addUser: jest.Mock };

      groupRepository.findByName.mockResolvedValue(null);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupFactory.createGroup.mockResolvedValue(mockGroupWithAddUser);
      userRepository.findById.mockResolvedValue(mockUser);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockGroupWithAddUser.addUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('UpdateGroupCommandHandler', () => {
    let handler: UpdateGroupCommandHandler;
    let mockGroup: Group;

    beforeEach(() => {
      handler = moduleRef.get(UpdateGroupCommandHandler);
      mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        description: 'Test Description',
        isActive: true,
        updateDetails: jest.fn(),
        activate: jest.fn(),
        deactivate: jest.fn(),
        setParent: jest.fn(),
        removeParent: jest.fn(),
        assignPermission: jest.fn(),
        removePermission: jest.fn(),
        addUser: jest.fn(),
        removeUser: jest.fn(),
        permissions: [],
        users: [],
        isDefaultGroup: false,
      } as Group & {
        updateDetails: jest.Mock;
        activate: jest.Mock;
        deactivate: jest.Mock;
        setParent: jest.Mock;
        removeParent: jest.Mock;
        assignPermission: jest.Mock;
        removePermission: jest.Mock;
        addUser: jest.Mock;
        removeUser: jest.Mock;
      };
    });

    it('should update group successfully', async () => {
      const command = new UpdateGroupCommand('group-123', {
        name: 'Updated Group',
        description: 'Updated Description',
        isActive: true,
      }, 'admin');

      groupRepository.findById.mockResolvedValue(mockGroup);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupRepository.existsByName.mockResolvedValue(false);
      groupRepository.save.mockResolvedValue(undefined);

      const result = await handler.execute(command);

      expect(result).toBe(mockGroup);
      expect(groupRepository.findById).toHaveBeenCalledWith('group-123');
      expect(mockGroup.updateDetails).toHaveBeenCalledWith('Updated Group', 'Updated Description');
      expect(mockGroup.activate).toHaveBeenCalled();
    });

    it('should throw NotFoundError if group does not exist', async () => {
      const command = new UpdateGroupCommand('non-existent-group', {
        name: 'Updated Group',
      }, 'admin');

      groupRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if new name already exists', async () => {
      const command = new UpdateGroupCommand('group-123', {
        name: 'Existing Group Name',
      }, 'admin');

      mockGroup.name = 'Current Name';
      groupRepository.findById.mockResolvedValue(mockGroup);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupRepository.existsByName.mockResolvedValue(true);

      await expect(handler.execute(command)).rejects.toThrow(ConflictError);
    });

    it('should update parent when specified', async () => {
      const parentGroup = { id: 'parent-123' } as Group;
      const command = new UpdateGroupCommand('group-123', {
        parentId: 'parent-123',
      }, 'admin');

      groupRepository.findById
        .mockResolvedValueOnce(mockGroup)
        .mockResolvedValueOnce(parentGroup);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupRepository.validateGroupHierarchy.mockResolvedValue(true);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(groupRepository.validateGroupHierarchy).toHaveBeenCalledWith('group-123', 'parent-123');
      expect(mockGroup.setParent).toHaveBeenCalledWith(parentGroup);
    });

    it('should remove parent when parentId is null', async () => {
      const command = new UpdateGroupCommand('group-123', {
        parentId: undefined,
      }, 'admin');

      groupRepository.findById.mockResolvedValue(mockGroup);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(mockGroup.removeParent).toHaveBeenCalled();
    });

    it('should update permissions when provided', async () => {
      const mockPermission = { id: 'permission-123', name: 'test:read' } as Permission;
      const command = new UpdateGroupCommand('group-123', {
        permissions: ['test:read'],
      }, 'admin');

      mockGroup.permissions = [{ name: 'old:permission' } as Permission];

      groupRepository.findById.mockResolvedValue(mockGroup);
      groupFactory.validateGroupData.mockResolvedValue(undefined);
      permissionRepository.findByName.mockResolvedValue(mockPermission);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(mockGroup.removePermission).toHaveBeenCalledWith('old:permission');
      expect(mockGroup.assignPermission).toHaveBeenCalledWith(mockPermission);
    });
  });

  describe('DeleteGroupCommandHandler', () => {
    let handler: DeleteGroupCommandHandler;
    let mockGroup: Group;

    beforeEach(() => {
      handler = moduleRef.get(DeleteGroupCommandHandler);
      mockGroup = {
        id: 'group-123',
        isDefaultGroup: false,
        delete: jest.fn(),
      } as Group & { delete: jest.Mock };
    });

    it('should delete group successfully', async () => {
      const command = new DeleteGroupCommand('group-123', 'admin', 'Test reason');

      groupRepository.findById.mockResolvedValue(mockGroup);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(groupRepository.findById).toHaveBeenCalledWith('group-123');
      expect(mockGroup.delete).toHaveBeenCalledWith('admin', 'Test reason');
      expect(groupRepository.save).toHaveBeenCalledWith(mockGroup);
    });

    it('should throw NotFoundError if group does not exist', async () => {
      const command = new DeleteGroupCommand('non-existent-group', 'admin');

      groupRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for default group', async () => {
      const defaultGroup = {
        ...mockGroup,
        isDefaultGroup: true,
      } as Group & { delete: jest.Mock };

      const command = new DeleteGroupCommand('group-123', 'admin');

      groupRepository.findById.mockResolvedValue(defaultGroup);

      await expect(handler.execute(command)).rejects.toThrow(ValidationError);
    });
  });

  describe('AddUserToGroupCommandHandler', () => {
    let handler: AddUserToGroupCommandHandler;
    let mockGroup: Group;
    let mockUser: User;

    beforeEach(() => {
      handler = moduleRef.get(AddUserToGroupCommandHandler);
      mockGroup = {
        id: 'group-123',
        addUser: jest.fn(),
      } as Group & { addUser: jest.Mock };
      mockUser = { id: 'user-123' } as User;
    });

    it('should add user to group successfully', async () => {
      const command = new AddUserToGroupCommand('group-123', 'user-123', 'admin');

      groupRepository.findById.mockResolvedValue(mockGroup);
      userRepository.findById.mockResolvedValue(mockUser);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(groupRepository.findById).toHaveBeenCalledWith('group-123');
      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockGroup.addUser).toHaveBeenCalledWith(mockUser);
      expect(groupRepository.save).toHaveBeenCalledWith(mockGroup);
    });

    it('should throw NotFoundError if group does not exist', async () => {
      const command = new AddUserToGroupCommand('non-existent-group', 'user-123', 'admin');

      groupRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const command = new AddUserToGroupCommand('group-123', 'non-existent-user', 'admin');

      groupRepository.findById.mockResolvedValue(mockGroup);
      userRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    });
  });

  describe('AssignPermissionToGroupCommandHandler', () => {
    let handler: AssignPermissionToGroupCommandHandler;
    let mockGroup: Group;
    let mockPermission: Permission;

    beforeEach(() => {
      handler = moduleRef.get(AssignPermissionToGroupCommandHandler);
      mockGroup = {
        id: 'group-123',
        assignPermission: jest.fn(),
      } as Group & { assignPermission: jest.Mock };
      mockPermission = { id: 'permission-123', name: 'test:read' } as Permission;
    });

    it('should assign permission to group successfully', async () => {
      const command = new AssignPermissionToGroupCommand('group-123', 'test:read', 'admin');

      groupRepository.findById.mockResolvedValue(mockGroup);
      permissionRepository.findByName.mockResolvedValue(mockPermission);
      groupRepository.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(groupRepository.findById).toHaveBeenCalledWith('group-123');
      expect(permissionRepository.findByName).toHaveBeenCalledWith('test:read');
      expect(mockGroup.assignPermission).toHaveBeenCalledWith(mockPermission);
      expect(groupRepository.save).toHaveBeenCalledWith(mockGroup);
    });

    it('should throw NotFoundError if group does not exist', async () => {
      const command = new AssignPermissionToGroupCommand('non-existent-group', 'test:read', 'admin');

      groupRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if permission does not exist', async () => {
      const command = new AssignPermissionToGroupCommand('group-123', 'non-existent-permission', 'admin');

      groupRepository.findById.mockResolvedValue(mockGroup);
      permissionRepository.findByName.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    });
  });

  describe('CreateDefaultGroupCommandHandler', () => {
    let handler: CreateDefaultGroupCommandHandler;
    let mockDefaultGroup: Group;

    beforeEach(() => {
      handler = moduleRef.get(CreateDefaultGroupCommandHandler);
      mockDefaultGroup = {
        id: 'default-group-123',
        name: 'DefaultGroup',
        isDefaultGroup: true,
      } as Group;
    });

    it('should create default group successfully', async () => {
      const command = new CreateDefaultGroupCommand('system');

      groupRepository.findDefaultGroup.mockRejectedValue(new NotFoundError('Group', 'DefaultGroup'));
      groupFactory.createDefaultGroup.mockResolvedValue(mockDefaultGroup);
      groupRepository.save.mockResolvedValue(undefined);

      const result = await handler.execute(command);

      expect(result).toBe(mockDefaultGroup);
      expect(groupFactory.createDefaultGroup).toHaveBeenCalled();
      expect(groupRepository.save).toHaveBeenCalledWith(mockDefaultGroup);
    });

    it('should return existing default group if it already exists', async () => {
      const command = new CreateDefaultGroupCommand('system');

      groupRepository.findDefaultGroup.mockResolvedValue(mockDefaultGroup);

      const result = await handler.execute(command);

      expect(result).toBe(mockDefaultGroup);
      expect(groupFactory.createDefaultGroup).not.toHaveBeenCalled();
      expect(groupRepository.save).not.toHaveBeenCalled();
    });
  });
});
