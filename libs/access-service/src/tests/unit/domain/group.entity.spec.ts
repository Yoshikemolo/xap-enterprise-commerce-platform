import { Group } from '../../../domain/entities/group.entity';
import { User } from '../../../domain/entities/user.entity';
import { Permission } from '../../../domain/entities/user.entity';
import { ValidationError } from '@enterprise/shared';

describe('Group Domain Entity', () => {
  let mockUser: User;
  let mockPermission: Permission;

  beforeEach(() => {
    // Mock User
    mockUser = {
      id: 'user-123',
      email: { value: 'test@example.com' },
      fullName: 'Test User'
    } as User;

    // Mock Permission
    mockPermission = {
      id: 'permission-123',
      name: 'test:read',
      resource: 'test',
      action: 'read',
      toPlainObject: () => ({
        id: 'permission-123',
        name: 'test:read',
        resource: 'test',
        action: 'read'
      })
    } as Permission;
  });

  describe('Group Creation', () => {
    it('should create a group with valid data', () => {
      const group = Group.create({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true
      });

      expect(group.name).toBe('Test Group');
      expect(group.description).toBe('Test Description');
      expect(group.isActive).toBe(true);
      expect(group.isRootGroup).toBe(true);
      expect(group.hasChildren).toBe(false);
      expect(group.hasUsers).toBe(false);
      expect(group.hasPermissions).toBe(false);
      expect(group.isDefaultGroup).toBe(false);
    });

    it('should create default group', () => {
      const defaultGroup = Group.createDefaultGroup();

      expect(defaultGroup.name).toBe('DefaultGroup');
      expect(defaultGroup.description).toBe('Default group for all users');
      expect(defaultGroup.isActive).toBe(true);
      expect(defaultGroup.isDefaultGroup).toBe(true);
    });

    it('should throw validation error with empty name', () => {
      expect(() => {
        Group.create({
          name: '',
          description: 'Test Description',
          isActive: true
        });
      }).toThrow(ValidationError);
    });

    it('should throw validation error with empty description', () => {
      expect(() => {
        Group.create({
          name: 'Test Group',
          description: '',
          isActive: true
        });
      }).toThrow(ValidationError);
    });

    it('should throw validation error with name too long', () => {
      const longName = 'a'.repeat(101);
      expect(() => {
        Group.create({
          name: longName,
          description: 'Test Description',
          isActive: true
        });
      }).toThrow(ValidationError);
    });

    it('should throw validation error with description too long', () => {
      const longDescription = 'a'.repeat(501);
      expect(() => {
        Group.create({
          name: 'Test Group',
          description: longDescription,
          isActive: true
        });
      }).toThrow(ValidationError);
    });
  });

  describe('Group Hierarchy', () => {
    let parentGroup: Group;
    let childGroup: Group;

    beforeEach(() => {
      parentGroup = Group.create({
        name: 'Parent Group',
        description: 'Parent Description',
        isActive: true
      });

      childGroup = Group.create({
        name: 'Child Group',
        description: 'Child Description',
        isActive: true
      });
    });

    it('should set parent correctly', () => {
      childGroup.setParent(parentGroup);

      expect(childGroup.parentId).toBe(parentGroup.id);
      expect(childGroup.parent).toBe(parentGroup);
      expect(childGroup.isRootGroup).toBe(false);
    });

    it('should remove parent correctly', () => {
      childGroup.setParent(parentGroup);
      childGroup.removeParent();

      expect(childGroup.parentId).toBeUndefined();
      expect(childGroup.parent).toBeUndefined();
      expect(childGroup.isRootGroup).toBe(true);
    });

    it('should not allow DefaultGroup to have parent', () => {
      const defaultGroup = Group.createDefaultGroup();

      expect(() => {
        defaultGroup.setParent(parentGroup);
      }).toThrow(ValidationError);
    });

    it('should not allow DefaultGroup to remove parent', () => {
      const defaultGroup = Group.createDefaultGroup();

      expect(() => {
        defaultGroup.removeParent();
      }).toThrow(ValidationError);
    });

    it('should detect cycle in hierarchy', () => {
      childGroup.setParent(parentGroup);

      expect(() => {
        parentGroup.setParent(childGroup);
      }).toThrow(ValidationError);
    });

    it('should add child group correctly', () => {
      parentGroup.addChildGroup(childGroup);

      expect(parentGroup.hasChildren).toBe(true);
      expect(parentGroup.hasChild(childGroup.id)).toBe(true);
      expect(childGroup.parentId).toBe(parentGroup.id);
      expect(childGroup.parent).toBe(parentGroup);
    });

    it('should remove child group correctly', () => {
      parentGroup.addChildGroup(childGroup);
      parentGroup.removeChildGroup(childGroup.id);

      expect(parentGroup.hasChildren).toBe(false);
      expect(parentGroup.hasChild(childGroup.id)).toBe(false);
      expect(childGroup.parentId).toBeUndefined();
      expect(childGroup.parent).toBeUndefined();
    });
  });

  describe('Group Users', () => {
    let group: Group;

    beforeEach(() => {
      group = Group.create({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true
      });
    });

    it('should add user correctly', () => {
      group.addUser(mockUser);

      expect(group.hasUsers).toBe(true);
      expect(group.hasUser(mockUser.id)).toBe(true);
      expect(group.users).toContain(mockUser);
    });

    it('should not add duplicate user', () => {
      group.addUser(mockUser);
      group.addUser(mockUser);

      expect(group.users.length).toBe(1);
    });

    it('should remove user correctly', () => {
      group.addUser(mockUser);
      group.removeUser(mockUser.id);

      expect(group.hasUsers).toBe(false);
      expect(group.hasUser(mockUser.id)).toBe(false);
      expect(group.users).not.toContain(mockUser);
    });
  });

  describe('Group Permissions', () => {
    let group: Group;

    beforeEach(() => {
      group = Group.create({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true
      });
    });

    it('should assign permission correctly', () => {
      group.assignPermission(mockPermission);

      expect(group.hasPermissions).toBe(true);
      expect(group.hasPermission(mockPermission.name)).toBe(true);
      expect(group.permissions).toContain(mockPermission);
    });

    it('should not assign duplicate permission', () => {
      group.assignPermission(mockPermission);
      group.assignPermission(mockPermission);

      expect(group.permissions.length).toBe(1);
    });

    it('should remove permission correctly', () => {
      group.assignPermission(mockPermission);
      group.removePermission(mockPermission.name);

      expect(group.hasPermissions).toBe(false);
      expect(group.hasPermission(mockPermission.name)).toBe(false);
      expect(group.permissions).not.toContain(mockPermission);
    });

    it('should check if can perform action', () => {
      group.assignPermission(mockPermission);

      expect(group.canPerformAction('test', 'read')).toBe(true);
      expect(group.canPerformAction('test', 'write')).toBe(false);
      expect(group.canPerformAction('other', 'read')).toBe(false);
    });
  });

  describe('Group Inheritance', () => {
    let parentGroup: Group;
    let childGroup: Group;
    let grandChildGroup: Group;

    beforeEach(() => {
      parentGroup = Group.create({
        name: 'Parent Group',
        description: 'Parent Description',
        isActive: true
      });

      childGroup = Group.create({
        name: 'Child Group',
        description: 'Child Description',
        isActive: true
      });

      grandChildGroup = Group.create({
        name: 'GrandChild Group',
        description: 'GrandChild Description',
        isActive: true
      });

      childGroup.setParent(parentGroup);
      grandChildGroup.setParent(childGroup);
    });

    it('should get all ancestors correctly', () => {
      const ancestors = grandChildGroup.getAllAncestors();

      expect(ancestors).toHaveLength(2);
      expect(ancestors).toContain(childGroup);
      expect(ancestors).toContain(parentGroup);
    });

    it('should get all descendants correctly', () => {
      parentGroup.addChildGroup(childGroup);
      childGroup.addChildGroup(grandChildGroup);

      const descendants = parentGroup.getAllDescendants();

      expect(descendants).toHaveLength(2);
      expect(descendants).toContain(childGroup);
      expect(descendants).toContain(grandChildGroup);
    });

    it('should calculate group level correctly', () => {
      expect(parentGroup.getLevel()).toBe(0);
      expect(childGroup.getLevel()).toBe(1);
      expect(grandChildGroup.getLevel()).toBe(2);
    });

    it('should get group path correctly', () => {
      expect(parentGroup.getPath()).toBe('Parent Group');
      expect(childGroup.getPath()).toBe('Parent Group > Child Group');
      expect(grandChildGroup.getPath()).toBe('Parent Group > Child Group > GrandChild Group');
    });

    it('should inherit permissions from parent groups', () => {
      const parentPermission = {
        ...mockPermission,
        name: 'parent:read',
        toPlainObject: () => ({
          id: 'parent-permission',
          name: 'parent:read',
          resource: 'parent',
          action: 'read'
        })
      } as Permission;

      const childPermission = {
        ...mockPermission,
        name: 'child:read',
        toPlainObject: () => ({
          id: 'child-permission',
          name: 'child:read',
          resource: 'child',
          action: 'read'
        })
      } as Permission;

      parentGroup.assignPermission(parentPermission);
      childGroup.assignPermission(childPermission);

      const inheritedPermissions = grandChildGroup.getAllPermissionsIncludingInherited();

      expect(inheritedPermissions).toHaveLength(2);
      expect(inheritedPermissions.some(p => p.name === 'parent:read')).toBe(true);
      expect(inheritedPermissions.some(p => p.name === 'child:read')).toBe(true);
    });
  });

  describe('Group State Management', () => {
    let group: Group;

    beforeEach(() => {
      group = Group.create({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true
      });
    });

    it('should update details correctly', () => {
      group.updateDetails('New Name', 'New Description');

      expect(group.name).toBe('New Name');
      expect(group.description).toBe('New Description');
    });

    it('should activate group correctly', () => {
      group.deactivate();
      group.activate();

      expect(group.isActive).toBe(true);
    });

    it('should deactivate group correctly', () => {
      group.deactivate();

      expect(group.isActive).toBe(false);
    });

    it('should not deactivate DefaultGroup', () => {
      const defaultGroup = Group.createDefaultGroup();

      expect(() => {
        defaultGroup.deactivate();
      }).toThrow(ValidationError);
    });
  });

  describe('Group Deletion', () => {
    let group: Group;

    beforeEach(() => {
      group = Group.create({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true
      });
    });

    it('should delete empty group correctly', () => {
      group.delete('admin', 'Test deletion');

      expect(group.isActive).toBe(false);
    });

    it('should not delete DefaultGroup', () => {
      const defaultGroup = Group.createDefaultGroup();

      expect(() => {
        defaultGroup.delete('admin', 'Test deletion');
      }).toThrow(ValidationError);
    });

    it('should not delete group with users', () => {
      group.addUser(mockUser);

      expect(() => {
        group.delete('admin', 'Test deletion');
      }).toThrow(ValidationError);
    });

    it('should not delete group with children', () => {
      const childGroup = Group.create({
        name: 'Child Group',
        description: 'Child Description',
        isActive: true
      });

      group.addChildGroup(childGroup);

      expect(() => {
        group.delete('admin', 'Test deletion');
      }).toThrow(ValidationError);
    });
  });

  describe('Group Serialization', () => {
    let group: Group;

    beforeEach(() => {
      group = Group.create({
        name: 'Test Group',
        description: 'Test Description',
        isActive: true
      });
      group.assignPermission(mockPermission);
      group.addUser(mockUser);
    });

    it('should serialize to plain object correctly', () => {
      const plainObject = group.toPlainObject();

      expect(plainObject.name).toBe('Test Group');
      expect(plainObject.description).toBe('Test Description');
      expect(plainObject.isActive).toBe(true);
      expect(plainObject.isRootGroup).toBe(true);
      expect(plainObject.hasUsers).toBe(true);
      expect(plainObject.hasPermissions).toBe(true);
      expect(plainObject.isDefaultGroup).toBe(false);
      expect(plainObject.path).toBe('Test Group');
      expect(plainObject.level).toBe(0);
      expect(plainObject.users).toHaveLength(1);
      expect(plainObject.permissions).toHaveLength(1);
      expect(plainObject.allPermissions).toHaveLength(1);
    });
  });
});
