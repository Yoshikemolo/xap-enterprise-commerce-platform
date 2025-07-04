import {
  AggregateRootImpl,
  Email,
  ValidationError,
  IdGenerator,
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserLoggedInEvent,
  UserLoggedOutEvent
} from '@enterprise/shared';

// Forward declaration to avoid circular dependency
interface Group {
  id: string;
  name: string;
  getAllPermissionsIncludingInherited(): Permission[];
  toPlainObject(): any;
}

export interface UserProps {
  id?: string;
  uuid?: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  preferences?: UserPreferences;
  roles: Role[];
  permissions: Permission[];
  groups?: Group[];
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export class User extends AggregateRootImpl {
  private _uuid: string;
  private readonly _email: Email;
  private _firstName: string;
  private _lastName: string;
  private _passwordHash: string;
  private _isActive: boolean;
  private _isEmailVerified: boolean;
  private _lastLoginAt?: Date;
  private _loginAttempts: number;
  private _lockedUntil?: Date;
  private _preferences: UserPreferences;
  private _roles: Role[] = [];
  private _permissions: Permission[] = [];
  private _groups: Group[] = [];

  constructor(props: UserProps) {
    super();
    this.id = props.id || IdGenerator.generate();
    this._uuid = props.uuid || IdGenerator.generate();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 1;
    
    this._email = new Email(props.email);
    this._firstName = this.validateAndSetFirstName(props.firstName);
    this._lastName = this.validateAndSetLastName(props.lastName);
    this._passwordHash = props.passwordHash;
    this._isActive = props.isActive;
    this._isEmailVerified = props.isEmailVerified;
    this._lastLoginAt = props.lastLoginAt;
    this._loginAttempts = props.loginAttempts;
    this._lockedUntil = props.lockedUntil;
    this._preferences = props.preferences || this.getDefaultPreferences();
    this._roles = props.roles || [];
    this._permissions = props.permissions || [];
    this._groups = props.groups || [];
  }

  static create(props: Omit<UserProps, 'id' | 'uuid' | 'loginAttempts' | 'isEmailVerified'>): User {
    const user = new User({
      ...props,
      id: IdGenerator.generate(),
      uuid: IdGenerator.generate(),
      loginAttempts: 0,
      isEmailVerified: false,
    });

    user.addEvent(new UserCreatedEvent(
      user.id,
      user.email.value,
      user.firstName,
      user.lastName
    ));

    return user;
  }

  // Getters
  get uuid(): string {
    return this._uuid;
  }

  get email(): Email {
    return this._email;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get isEmailVerified(): boolean {
    return this._isEmailVerified;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  get loginAttempts(): number {
    return this._loginAttempts;
  }

  get lockedUntil(): Date | undefined {
    return this._lockedUntil;
  }

  get preferences(): UserPreferences {
    return this._preferences;
  }

  get roles(): Role[] {
    return [...this._roles];
  }

  get permissions(): Permission[] {
    // Get permissions from roles, direct permissions, and groups
    const rolePermissions = this._roles.flatMap(role => role.permissions);
    const groupPermissions = this._groups.flatMap(group => group.getAllPermissionsIncludingInherited());
    const allPermissions = [...rolePermissions, ...this._permissions, ...groupPermissions];
    
    // Remove duplicates based on permission name
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) => 
        index === self.findIndex(p => p.name === permission.name)
    );
    
    return uniquePermissions;
  }

  get groups(): Group[] {
    return [...this._groups];
  }

  get isLocked(): boolean {
    return this._lockedUntil ? this._lockedUntil > new Date() : false;
  }

  // Business Methods
  updateProfile(firstName: string, lastName: string, preferences?: UserPreferences): void {
    const updatedFields: string[] = [];

    if (firstName !== this._firstName) {
      this._firstName = this.validateAndSetFirstName(firstName);
      updatedFields.push('firstName');
    }

    if (lastName !== this._lastName) {
      this._lastName = this.validateAndSetLastName(lastName);
      updatedFields.push('lastName');
    }

    if (preferences && JSON.stringify(preferences) !== JSON.stringify(this._preferences)) {
      this._preferences = { ...this._preferences, ...preferences };
      updatedFields.push('preferences');
    }

    if (updatedFields.length > 0) {
      this.updateTimestamp();
      this.addEvent(new UserUpdatedEvent(this.id, {
        firstName: this._firstName,
        lastName: this._lastName,
        updatedFields
      }));
    }
  }

  updatePassword(newPasswordHash: string): void {
    if (!newPasswordHash || newPasswordHash.trim().length === 0) {
      throw new ValidationError('Password hash cannot be empty');
    }

    this._passwordHash = newPasswordHash;
    this._loginAttempts = 0; // Reset login attempts on password change
    this._lockedUntil = undefined;
    this.updateTimestamp();

    this.addEvent(new UserUpdatedEvent(this.id, {
      updatedFields: ['password'],
    }));
  }

  verifyEmail(): void {
    if (this._isEmailVerified) {
      return; // Already verified
    }

    this._isEmailVerified = true;
    this.updateTimestamp();

    this.addEvent(new UserUpdatedEvent(this.id, {
      isEmailVerified: true,
      updatedFields: ['emailVerified'],
    }));
  }

  activate(): void {
    if (this._isActive) {
      return; // Already active
    }

    this._isActive = true;
    this.updateTimestamp();

    this.addEvent(new UserUpdatedEvent(this.id, {
      isActive: true,
      updatedFields: ['isActive'],
    }));
  }

  deactivate(): void {
    if (!this._isActive) {
      return; // Already inactive
    }

    this._isActive = false;
    this.updateTimestamp();

    this.addEvent(new UserUpdatedEvent(this.id, {
      isActive: false,
      updatedFields: ['isActive'],
    }));
  }

  recordSuccessfulLogin(ipAddress: string, userAgent: string): void {
    this._lastLoginAt = new Date();
    this._loginAttempts = 0;
    this._lockedUntil = undefined;
    this.updateTimestamp();

    this.addEvent(new UserLoggedInEvent(
      this.id,
      this._lastLoginAt!,
      ipAddress
    ));
  }

  recordFailedLogin(): void {
    this._loginAttempts++;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (this._loginAttempts >= 5) {
      this._lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }

    this.updateTimestamp();
  }

  recordLogout(sessionDuration: number): void {
    this.addEvent(new UserLoggedOutEvent(
      this.id,
      new Date()
    ));
  }

  assignRole(role: Role): void {
    if (this.hasRole(role.name)) {
      return; // Already has this role
    }

    this._roles.push(role);
    this.updateTimestamp();

    this.addEvent(new UserUpdatedEvent(this.id, {
      updatedFields: ['roles'],
    }));
  }

  removeRole(roleName: string): void {
    const initialLength = this._roles.length;
    this._roles = this._roles.filter(role => role.name !== roleName);

    if (this._roles.length !== initialLength) {
      this.updateTimestamp();
      this.addEvent(new UserUpdatedEvent(this.id, {
        updatedFields: ['roles'],
      }));
    }
  }

  assignPermission(permission: Permission): void {
    if (this.hasDirectPermission(permission.name)) {
      return; // Already has this permission
    }

    this._permissions.push(permission);
    this.updateTimestamp();

    this.addEvent(new UserUpdatedEvent(this.id, {
      updatedFields: ['permissions'],
    }));
  }

  removePermission(permissionName: string): void {
    const initialLength = this._permissions.length;
    this._permissions = this._permissions.filter(permission => permission.name !== permissionName);

    if (this._permissions.length !== initialLength) {
      this.updateTimestamp();
      this.addEvent(new UserUpdatedEvent(this.id, {
        updatedFields: ['permissions'],
      }));
    }
  }

  hasRole(roleName: string): boolean {
    return this._roles.some(role => role.name === roleName);
  }

  hasDirectPermission(permissionName: string): boolean {
    return this._permissions.some(permission => permission.name === permissionName);
  }

  hasPermission(permissionName: string): boolean {
    return this.permissions.some(permission => permission.name === permissionName);
  }

  assignGroup(group: Group): void {
    if (this.hasGroup(group.id)) {
      return; // Already has this group
    }

    this._groups.push(group);
    this.updateTimestamp();

    this.addEvent(new UserUpdatedEvent(this.id, {
      updatedFields: ['groups'],
    }));
  }

  removeGroup(groupId: string): void {
    const initialLength = this._groups.length;
    this._groups = this._groups.filter(group => group.id !== groupId);

    if (this._groups.length !== initialLength) {
      this.updateTimestamp();
      this.addEvent(new UserUpdatedEvent(this.id, {
        updatedFields: ['groups'],
      }));
    }
  }

  hasGroup(groupId: string): boolean {
    return this._groups.some(group => group.id === groupId);
  }

  hasGroupByName(groupName: string): boolean {
    return this._groups.some(group => group.name === groupName);
  }

  belongsToDefaultGroup(): boolean {
    return this.hasGroupByName('DefaultGroup');
  }

  canPerformAction(resource: string, action: string): boolean {
    return this.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  delete(deletedBy: string, reason?: string): void {
    this._isActive = false;
    this.updateTimestamp();

    this.addEvent(new UserDeletedEvent(this.id));
  }

  // Private helper methods
  private validateAndSetFirstName(firstName: string): string {
    if (!firstName || firstName.trim().length === 0) {
      throw new ValidationError('First name is required');
    }
    if (firstName.length > 100) {
      throw new ValidationError('First name cannot exceed 100 characters');
    }
    return firstName.trim();
  }

  private validateAndSetLastName(lastName: string): string {
    if (!lastName || lastName.trim().length === 0) {
      throw new ValidationError('Last name is required');
    }
    if (lastName.length > 100) {
      throw new ValidationError('Last name cannot exceed 100 characters');
    }
    return lastName.trim();
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      language: 'es',
      timezone: 'Europe/Madrid',
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    };
  }

  // Serialization methods
  toPlainObject(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      email: this.email.value,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      isActive: this._isActive,
      isEmailVerified: this._isEmailVerified,
      lastLoginAt: this._lastLoginAt,
      loginAttempts: this._loginAttempts,
      lockedUntil: this._lockedUntil,
      isLocked: this.isLocked,
      preferences: this._preferences,
      roles: this._roles.map(role => role.toPlainObject()),
      permissions: this.permissions.map(permission => permission.toPlainObject()),
      groups: this._groups.map(group => group.toPlainObject()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}

// Role Entity
export interface RoleProps {
  id?: string;
  uuid?: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: Permission[];
}

export class Role extends AggregateRootImpl {
  private _uuid: string;
  private _name: string;
  private _description: string;
  private _isActive: boolean;
  private _permissions: Permission[] = [];

  constructor(props: RoleProps) {
    super();
    this.id = props.id || IdGenerator.generate();
    this._uuid = props.uuid || IdGenerator.generate();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 1;
    
    this._name = this.validateAndSetName(props.name);
    this._description = this.validateAndSetDescription(props.description);
    this._isActive = props.isActive;
    this._permissions = props.permissions || [];
  }

  static create(props: Omit<RoleProps, 'id' | 'uuid'>): Role {
    const role = new Role({
      ...props,
      id: IdGenerator.generate(),
      uuid: IdGenerator.generate(),
    });

    return role;
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
    }
  }

  activate(): void {
    if (!this._isActive) {
      this._isActive = true;
      this.updateTimestamp();
    }
  }

  deactivate(): void {
    if (this._isActive) {
      this._isActive = false;
      this.updateTimestamp();
    }
  }

  assignPermission(permission: Permission): void {
    if (!this.hasPermission(permission.name)) {
      this._permissions.push(permission);
      this.updateTimestamp();
    }
  }

  removePermission(permissionName: string): void {
    const initialLength = this._permissions.length;
    this._permissions = this._permissions.filter(permission => permission.name !== permissionName);

    if (this._permissions.length !== initialLength) {
      this.updateTimestamp();
    }
  }

  hasPermission(permissionName: string): boolean {
    return this._permissions.some(permission => permission.name === permissionName);
  }

  // Private helper methods
  private validateAndSetName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Role name is required');
    }
    if (name.length > 100) {
      throw new ValidationError('Role name cannot exceed 100 characters');
    }
    return name.trim();
  }

  private validateAndSetDescription(description: string): string {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Role description is required');
    }
    if (description.length > 500) {
      throw new ValidationError('Role description cannot exceed 500 characters');
    }
    return description.trim();
  }

  toPlainObject(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this._name,
      description: this._description,
      isActive: this._isActive,
      permissions: this._permissions.map(permission => permission.toPlainObject()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}

// Permission Entity
export interface PermissionProps {
  id?: string;
  uuid?: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export class Permission extends AggregateRootImpl {
  private _uuid: string;
  private _name: string;
  private _resource: string;
  private _action: string;
  private _conditions?: Record<string, any>;

  constructor(props: PermissionProps) {
    super();
    this.id = props.id || IdGenerator.generate();
    this._uuid = props.uuid || IdGenerator.generate();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 1;
    
    this._name = this.validateAndSetName(props.name);
    this._resource = this.validateAndSetResource(props.resource);
    this._action = this.validateAndSetAction(props.action);
    this._conditions = props.conditions;
  }

  static create(props: Omit<PermissionProps, 'id' | 'uuid'>): Permission {
    const permission = new Permission({
      ...props,
      id: IdGenerator.generate(),
      uuid: IdGenerator.generate(),
    });

    return permission;
  }

  // Getters
  get uuid(): string {
    return this._uuid;
  }

  get name(): string {
    return this._name;
  }

  get resource(): string {
    return this._resource;
  }

  get action(): string {
    return this._action;
  }

  get conditions(): Record<string, any> | undefined {
    return this._conditions ? { ...this._conditions } : undefined;
  }

  // Business Methods
  updateDetails(name: string, resource: string, action: string, conditions?: Record<string, any>): void {
    const updatedFields: string[] = [];

    if (name !== this._name) {
      this._name = this.validateAndSetName(name);
      updatedFields.push('name');
    }

    if (resource !== this._resource) {
      this._resource = this.validateAndSetResource(resource);
      updatedFields.push('resource');
    }

    if (action !== this._action) {
      this._action = this.validateAndSetAction(action);
      updatedFields.push('action');
    }

    if (JSON.stringify(conditions) !== JSON.stringify(this._conditions)) {
      this._conditions = conditions;
      updatedFields.push('conditions');
    }

    if (updatedFields.length > 0) {
      this.updateTimestamp();
    }
  }

  matches(resource: string, action: string): boolean {
    return this._resource === resource && this._action === action;
  }

  // Private helper methods
  private validateAndSetName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Permission name is required');
    }
    if (name.length > 100) {
      throw new ValidationError('Permission name cannot exceed 100 characters');
    }
    return name.trim();
  }

  private validateAndSetResource(resource: string): string {
    if (!resource || resource.trim().length === 0) {
      throw new ValidationError('Permission resource is required');
    }
    if (resource.length > 100) {
      throw new ValidationError('Permission resource cannot exceed 100 characters');
    }
    return resource.trim();
  }

  private validateAndSetAction(action: string): string {
    if (!action || action.trim().length === 0) {
      throw new ValidationError('Permission action is required');
    }
    if (action.length > 100) {
      throw new ValidationError('Permission action cannot exceed 100 characters');
    }
    return action.trim();
  }

  toPlainObject(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this._name,
      resource: this._resource,
      action: this._action,
      conditions: this._conditions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}