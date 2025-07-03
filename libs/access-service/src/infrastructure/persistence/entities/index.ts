export { UserEntity } from './user.entity';
export { RoleEntity } from './role.entity';
export { PermissionEntity } from './permission.entity';
export { GroupEntity } from './group.entity';

// Export all entities as array for TypeORM configuration
export const AccessServiceEntities = [
  UserEntity,
  RoleEntity,
  PermissionEntity,
  GroupEntity,
];
