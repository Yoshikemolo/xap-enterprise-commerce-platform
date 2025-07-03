import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToMany, 
  JoinTable, 
  ManyToOne,
  OneToMany,
  JoinColumn,
  Tree,
  TreeParent,
  TreeChildren,
  Index, 
  VersionColumn 
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PermissionEntity } from './permission.entity';

@Entity('groups')
@Tree('closure-table')
@Index(['name'], { unique: true })
@Index(['parentId'])
export class GroupEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  parentId: number | null;

  @TreeParent()
  @ManyToOne(() => GroupEntity, group => group.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: GroupEntity | null;

  @TreeChildren()
  @OneToMany(() => GroupEntity, group => group.parent)
  children: GroupEntity[];

  @ManyToMany(() => UserEntity, user => user.groups, { cascade: false })
  @JoinTable({
    name: 'user_groups',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  users: UserEntity[];

  @ManyToMany(() => PermissionEntity, permission => permission.groups, { cascade: true })
  @JoinTable({
    name: 'group_permissions',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: PermissionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // Computed properties
  get isRootGroup(): boolean {
    return this.parentId === null;
  }

  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  get hasUsers(): boolean {
    return this.users && this.users.length > 0;
  }

  get hasPermissions(): boolean {
    return this.permissions && this.permissions.length > 0;
  }

  get isDefaultGroup(): boolean {
    return this.name === 'DefaultGroup';
  }

  // Helper methods
  hasPermission(permissionName: string): boolean {
    return this.permissions?.some(permission => permission.name === permissionName) || false;
  }

  hasUser(userId: number): boolean {
    return this.users?.some(user => user.id === userId) || false;
  }

  hasChild(childId: number): boolean {
    return this.children?.some(child => child.id === childId) || false;
  }

  getUserCount(): number {
    return this.users?.length || 0;
  }

  getPermissionCount(): number {
    return this.permissions?.length || 0;
  }

  getChildrenCount(): number {
    return this.children?.length || 0;
  }

  // Get full path for display
  getPath(): string {
    if (!this.parent) {
      return this.name;
    }
    return `${this.parent.getPath()} > ${this.name}`;
  }

  // Get all ancestor groups
  getAllAncestors(): GroupEntity[] {
    const ancestors: GroupEntity[] = [];
    let current = this.parent;
    
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    
    return ancestors;
  }

  // Get all permissions including inherited ones
  getAllPermissionsIncludingInherited(): PermissionEntity[] {
    const allPermissions = [...(this.permissions || [])];
    
    // Add permissions from parent groups
    for (const ancestor of this.getAllAncestors()) {
      if (ancestor.permissions) {
        allPermissions.push(...ancestor.permissions);
      }
    }
    
    // Remove duplicates based on permission name
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) => 
        index === self.findIndex(p => p.name === permission.name)
    );
    
    return uniquePermissions;
  }

  // Get hierarchy level (0 = root)
  getLevel(): number {
    return this.getAllAncestors().length;
  }
}
