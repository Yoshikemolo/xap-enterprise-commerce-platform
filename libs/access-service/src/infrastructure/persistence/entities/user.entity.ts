import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, Index, VersionColumn } from 'typeorm';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';
import { GroupEntity } from './group.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'int', default: 0 })
  loginAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'json', nullable: true })
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  } | null;

  @ManyToMany(() => RoleEntity, role => role.users, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: RoleEntity[];

  @ManyToMany(() => PermissionEntity, permission => permission.users, { cascade: true })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  directPermissions: PermissionEntity[];

  @ManyToMany(() => GroupEntity, group => group.users, { cascade: false })
  groups: GroupEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  // Helper method to get all permissions (from roles + direct + groups)
  getAllPermissions(): PermissionEntity[] {
    const rolePermissions = this.roles?.flatMap(role => role.permissions || []) || [];
    const directPermissions = this.directPermissions || [];
    const groupPermissions = this.groups?.flatMap(group => group.getAllPermissionsIncludingInherited() || []) || [];
    
    // Remove duplicates based on permission name
    const allPermissions = [...rolePermissions, ...directPermissions, ...groupPermissions];
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) => 
        index === self.findIndex(p => p.name === permission.name)
    );
    
    return uniquePermissions;
  }

  // Get all groups the user belongs to
  getUserGroups(): GroupEntity[] {
    return this.groups || [];
  }

  // Check if user belongs to a specific group
  belongsToGroup(groupName: string): boolean {
    return this.groups?.some(group => group.name === groupName) || false;
  }

  // Check if user belongs to DefaultGroup
  belongsToDefaultGroup(): boolean {
    return this.belongsToGroup('DefaultGroup');
  }
}
