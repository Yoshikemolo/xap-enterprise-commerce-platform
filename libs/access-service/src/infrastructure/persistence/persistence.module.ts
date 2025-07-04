import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessServiceEntities } from './entities';
import { AccessServiceRepositories } from './repositories';
import { TypeOrmUserRepository, TypeOrmRoleRepository, TypeOrmPermissionRepository } from './repositories';

// Create tokens for dependency injection
export const USER_REPOSITORY = Symbol('UserRepository');
export const ROLE_REPOSITORY = Symbol('RoleRepository');
export const PERMISSION_REPOSITORY = Symbol('PermissionRepository');
export const GROUP_REPOSITORY = Symbol('GroupRepository');

@Module({
  imports: [
    TypeOrmModule.forFeature(AccessServiceEntities)
  ],
  providers: [
    // Repository implementations
    ...AccessServiceRepositories,
    
    // Domain repository interfaces binding
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: PERMISSION_REPOSITORY,
      useClass: TypeOrmPermissionRepository,
    },
  ],
  exports: [
    // Export the tokens
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    PERMISSION_REPOSITORY,
    
    // Also export TypeORM for migrations
    TypeOrmModule,
  ],
})
export class AccessServicePersistenceModule {}
