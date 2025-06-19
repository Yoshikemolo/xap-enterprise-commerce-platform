export { UserEntity } from './user.entity';
export { RoleEntity } from './role.entity';
export { PermissionEntity } from './permission.entity';

// Export all entities as array for TypeORM configuration
export const AccessServiceEntities = [
  UserEntity,
  RoleEntity,
  PermissionEntity,
];
