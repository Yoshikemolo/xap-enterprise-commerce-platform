import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessServiceEntities } from './entities';
import { AccessServiceRepositories } from './repositories';
import { UserRepository, RoleRepository, PermissionRepository } from '../../domain/repositories';
import { TypeOrmUserRepository, TypeOrmRoleRepository, TypeOrmPermissionRepository } from './repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature(AccessServiceEntities)
  ],
  providers: [
    // Repository implementations
    ...AccessServiceRepositories,
    
    // Domain repository interfaces binding
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: RoleRepository,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: PermissionRepository,
      useClass: TypeOrmPermissionRepository,
    },
  ],
  exports: [
    // Export the domain interfaces, not the implementations
    UserRepository,
    RoleRepository,
    PermissionRepository,
    
    // Also export TypeORM for migrations
    TypeOrmModule,
  ],
})
export class AccessServicePersistenceModule {}
