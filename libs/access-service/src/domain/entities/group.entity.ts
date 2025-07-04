import {
  AggregateRootImpl,
  ValidationError,
  IdGenerator,
  GroupCreatedEvent,
  GroupUpdatedEvent,
  GroupDeletedEvent,
  GroupUserAddedEvent,
  GroupUserRemovedEvent,
  GroupPermissionAddedEvent,
  GroupPermissionRemovedEvent
} from '@enterprise/shared';
import { User, Permission } from './user.entity';

export interface GroupProps {
  id?: string;
  uuid?: string;
  name: string;
  description: string;
  isActive: boolean;
  parentId?: string;
  parent?: Group;
  children?: Group[];
  users?: User[];
  permissions?: Permission[];
}

export class Group extends AggregateRootImpl {
  private _uuid: string;
  private _name: string;
  private _description: string;
  private _isActive: boolean;
  private _parentId?: string;
  private _parent?: Group;
  private _children: Group[] = [];
  private _users: User[] = [];
  private _permissions: Permission[] = [];

  constructor(props: GroupProps) {
    super();
    this.id = props.id || IdGenerator.generate();
    this._uuid = props.uuid || IdGenerator.generate();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 1;
    
    this._name = this.validateAndSetName(props.name);
    this._description = this.validateAndSetDescription(props.description);
    this._isActive = props.isActive;
    this._parentId = props.parentId;
    this._parent = props.parent;
    this._children = props.children || [];
    this._users = props.users || [];
    this._permissions = props.permissions || [];
  }

  static create(props: Omit<GroupProps, 'id' | 'uuid'>): Group {
    const group = new Group({
      ...props,
      id: IdGenerator.generate(),
      uuid: IdGenerator.generate(),
    });

    group.addEvent(new GroupCreatedEvent(
      group.id,
      group.name,
      group.description
    ));

    return group;
  }

  static createDefaultGroup(): Group {
    return Group.create({
      name: 'DefaultGroup',
      description: 'Default group for all users',
      isActive: true,
    });
  }

  // Getters
  get uuid(): string {
    return this._uuid;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get parentId(): string | undefined {
    return this._parentId;
  }

  get parent(): Group | undefined {
    return this._parent;
  }

  get children(): Group[] {
    return [...this._children];
  }

  get isDefaultGroup(): boolean {
    return this._name === 'DefaultGroup';
  }

  get hasUsers(): boolean {
    return this._users.length > 0;
  }

  get hasChildren(): boolean {
    return this._children.length > 0;
  }

  get hasPermissions(): boolean {
    return this._permissions.length > 0;
  }

  get isRootGroup(): boolean {
    return !this._parentId;
  }

  get users(): User[] {
    return [...this._users];
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }

  // Business Methods
  updateDetails(name: string, description: string): void {
    const updatedFields: string[] = [];

    if (name !== this._name) {
      this._name = this.validateAndSetName(name);
      updatedFields.push('name');
    }

    if (description !== this._description) {
      this._description = this.validateAndSetDescription(description);
      updatedFields.push('description');
    }

    if (updatedFields.length > 0) {
      this.updateTimestamp();
      this.addEvent(new GroupUpdatedEvent(this.id, { updatedFields }));
    }
  }

  activate(): void {
    if (this._isActive) {
      return; // Already active
    }

    this._isActive = true;
    this.updateTimestamp();

    this.addEvent(new GroupUpdatedEvent(this.id, { isActive: true }));
  }

  deactivate(): void {
    if (!this._isActive) {
      return; // Already inactive
    }

    if (this.isDefaultGroup) {
      throw new ValidationError('Default group cannot be deactivated');
    }

    this._isActive = false;
    this.updateTimestamp();

    this.addEvent(new GroupUpdatedEvent(this.id, { isActive: false }));
  }

  setParent(parent: Group): void {
    if (this.isDefaultGroup) {
      throw new ValidationError('Default group cannot have a parent');
    }

    if (this.wouldCreateCycle(parent)) {
      throw new ValidationError('Setting this parent would create a cycle in the group hierarchy');
    }

    const oldParentId = this._parentId;
    this._parentId = parent.id;
    this._parent = parent;
    this.updateTimestamp();

    this.addEvent(new GroupUpdatedEvent(this.id, { parentId: this._parentId }));
  }

  removeParent(): void {
    if (this.isDefaultGroup) {
      throw new ValidationError('Default group cannot have its parent modified');
    }

    if (!this._parentId) {
      return; // Already has no parent
    }

    const oldParentId = this._parentId;
    this._parentId = undefined;
    this._parent = undefined;
    this.updateTimestamp();

    this.addEvent(new GroupUpdatedEvent(this.id, { parentId: undefined }));
  }

  addChildGroup(child: Group): void {
    if (this.hasChild(child.id)) {
      return; // Already has this child
    }

    if (child.wouldCreateCycle(this)) {
      throw new ValidationError('Adding this child would create a cycle in the group hierarchy');
    }

    this._children.push(child);
    child._parentId = this.id;
    child._parent = this;
    this.updateTimestamp();

    this.addEvent(new GroupUpdatedEvent(this.id, { childAdded: child.id }));
  }

  removeChildGroup(childId: string): void {
    const initialLength = this._children.length;
    const child = this._children.find(c => c.id === childId);
    
    this._children = this._children.filter(c => c.id !== childId);

    if (this._children.length !== initialLength && child) {
      child._parentId = undefined;
      child._parent = undefined;
      this.updateTimestamp();

      this.addEvent(new GroupUpdatedEvent(this.id, { childRemoved: childId }));
    }
  }

  addUser(user: User): void {
    if (this.hasUser(user.id)) {
      return; // Already has this user
    }

    this._users.push(user);
    this.updateTimestamp();

    this.addEvent(new GroupUserAddedEvent(this.id, user.id));
  }

  removeUser(userId: string): void {
    const initialLength = this._users.length;
    const user = this._users.find(u => u.id === userId);
    
    this._users = this._users.filter(u => u.id !== userId);

    if (this._users.length !== initialLength && user) {
      this.updateTimestamp();

      this.addEvent(new GroupUserRemovedEvent(this.id, userId));
    }
  }

  assignPermission(permission: Permission): void {
    if (this.hasPermission(permission.name)) {
      return; // Already has this permission
    }

    this._permissions.push(permission);
    this.updateTimestamp();

    this.addEvent(new GroupPermissionAddedEvent(this.id, permission.id));
  }

  removePermission(permissionName: string): void {
    const initialLength = this._permissions.length;
    const permission = this._permissions.find(p => p.name === permissionName);
    
    this._permissions = this._permissions.filter(p => p.name !== permissionName);

    if (this._permissions.length !== initialLength && permission) {
      this.updateTimestamp();

      this.addEvent(new GroupPermissionRemovedEvent(this.id, permission.id));
    }
  }

  // Query Methods
  hasChild(childId: string): boolean {
    return this._children.some(child => child.id === childId);
  }

  hasUser(userId: string): boolean {
    return this._users.some(user => user.id === userId);
  }

  hasPermission(permissionName: string): boolean {
    return this._permissions.some(permission => permission.name === permissionName);
  }

  getAllDescendants(): Group[] {
    const descendants: Group[] = [];
    
    for (const child of this._children) {
      descendants.push(child);
      descendants.push(...child.getAllDescendants());
    }
    
    return descendants;
  }

  getAllAncestors(): Group[] {
    const ancestors: Group[] = [];
    let current = this._parent;
    
    while (current) {
      ancestors.push(current);
      current = current._parent;
    }
    
    return ancestors;
  }

  getAllPermissionsIncludingInherited(): Permission[] {
    const allPermissions = [...this._permissions];
    
    // Add permissions from parent groups
    for (const ancestor of this.getAllAncestors()) {
      allPermissions.push(...ancestor.permissions);
    }
    
    // Remove duplicates based on permission name
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) => 
        index === self.findIndex(p => p.name === permission.name)
    );
    
    return uniquePermissions;
  }

  getPath(): string {
    const ancestors = this.getAllAncestors().reverse();
    const pathParts = [...ancestors.map(g => g.name), this._name];
    return pathParts.join(' > ');
  }

  getLevel(): number {
    return this.getAllAncestors().length;
  }

  canPerformAction(resource: string, action: string): boolean {
    const allPermissions = this.getAllPermissionsIncludingInherited();
    return allPermissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  delete(deletedBy: string, reason?: string): void {
    if (this.isDefaultGroup) {
      throw new ValidationError('Default group cannot be deleted');
    }

    if (this.hasUsers) {
      throw new ValidationError('Cannot delete group that has users. Move users to other groups first.');
    }

    if (this.hasChildren) {
      throw new ValidationError('Cannot delete group that has child groups. Delete or move child groups first.');
    }

    this._isActive = false;
    this.updateTimestamp();

    this.addEvent(new GroupDeletedEvent(this.id));
  }

  // Private helper methods
  private validateAndSetName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Group name is required');
    }
    if (name.length > 100) {
      throw new ValidationError('Group name cannot exceed 100 characters');
    }
    return name.trim();
  }

  private validateAndSetDescription(description: string): string {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Group description is required');
    }
    if (description.length > 500) {
      throw new ValidationError('Group description cannot exceed 500 characters');
    }
    return description.trim();
  }

  private wouldCreateCycle(potentialParent: Group): boolean {
    // Check if setting potentialParent as parent would create a cycle
    let current: Group | undefined = potentialParent;
    
    while (current) {
      if (current.id === this.id) {
        return true; // Found a cycle
      }
      current = current._parent;
    }
    
    return false;
  }

  // Serialization methods
  toPlainObject(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this._name,
      description: this._description,
      isActive: this._isActive,
      parentId: this._parentId,
      parent: this._parent ? {
        id: this._parent.id,
        name: this._parent.name,
        path: this._parent.getPath()
      } : undefined,
      children: this._children.map(child => ({
        id: child.id,
        name: child.name,
        isActive: child.isActive
      })),
      users: this._users.map(user => ({
        id: user.id,
        email: user.email.value,
        fullName: user.fullName
      })),
      permissions: this._permissions.map(permission => permission.toPlainObject()),
      allPermissions: this.getAllPermissionsIncludingInherited().map(p => p.toPlainObject()),
      path: this.getPath(),
      level: this.getLevel(),
      isRootGroup: this.isRootGroup,
      hasChildren: this.hasChildren,
      hasUsers: this.hasUsers,
      hasPermissions: this.hasPermissions,
      isDefaultGroup: this.isDefaultGroup,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}
