import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, Index, VersionColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

@Entity('permissions')
@Index(['name'], { unique: true })
@Index(['resource', 'action'])
export class PermissionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  resource: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'json', nullable: true })
  conditions: Record<string, any> | null;

  @ManyToMany(() => UserEntity, user => user.directPermissions)
  users: UserEntity[];

  @ManyToMany(() => RoleEntity, role => role.permissions)
  roles: RoleEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // Helper methods
  matches(resource: string, action: string): boolean {
    return this.resource === resource && this.action === action;
  }

  hasConditions(): boolean {
    return this.conditions !== null && Object.keys(this.conditions || {}).length > 0;
  }

  getUserCount(): number {
    return this.users?.length || 0;
  }

  getRoleCount(): number {
    return this.roles?.length || 0;
  }

  // Format for display
  getDisplayName(): string {
    return `${this.resource}:${this.action}`;
  }
}
