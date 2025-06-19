export { TypeOrmUserRepository } from './typeorm-user.repository';
export { TypeOrmRoleRepository } from './typeorm-role.repository';
export { TypeOrmPermissionRepository } from './typeorm-permission.repository';

// Export all repositories for easy importing
export const AccessServiceRepositories = [
  TypeOrmUserRepository,
  TypeOrmRoleRepository,
  TypeOrmPermissionRepository,
];
