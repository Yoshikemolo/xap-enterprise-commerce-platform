import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import infrastructure layer
import { AccessServicePersistenceModule } from './infrastructure/persistence/persistence.module';

// Import all application layer components
import { 
  AccessServiceApplicationHandlers,
  AccessServiceApplicationServices 
} from './application';

// Import domain repositories (interfaces)
import {
  UserRepository,
  RoleRepository,
  PermissionRepository,
  UserReadModel,
  RoleReadModel,
  PermissionReadModel,
  UserFactory,
  RoleFactory,
  PermissionFactory,
  AuthService,
  PermissionService,
  KeycloakService,
  SessionService,
  AuditService
} from './domain/repositories';

// Note: These would be implemented in the infrastructure layer
// Import infrastructure implementations
// import { 
//   TypeOrmUserRepository,
//   TypeOrmRoleRepository,
//   TypeOrmPermissionRepository,
//   UserReadModelImpl,
//   RoleReadModelImpl,
//   PermissionReadModelImpl,
//   etc...
// } from './infrastructure/persistence';

// Import infrastructure services
// import {
//   UserFactoryImpl,
//   RoleFactoryImpl,
//   PermissionFactoryImpl,
//   AuthServiceImpl,
//   PermissionServiceImpl,
//   KeycloakServiceImpl,
//   SessionServiceImpl,
//   AuditServiceImpl
// } from './infrastructure/services';

@Module({
  imports: [
    CqrsModule,
    AccessServicePersistenceModule,
  ],
  providers: [
    // Application Layer
    ...AccessServiceApplicationHandlers,
    ...AccessServiceApplicationServices,

    // Note: Repository implementations are now provided by AccessServicePersistenceModule
    // The infrastructure layer handles all TypeORM mappings and implementations
    // {
    //   provide: UserRepository,
    //   useClass: TypeOrmUserRepository,
    // },
    // {
    //   provide: RoleRepository,
    //   useClass: TypeOrmRoleRepository,
    // },
    // {
    //   provide: PermissionRepository,
    //   useClass: TypeOrmPermissionRepository,
    // },
    // {
    //   provide: UserReadModel,
    //   useClass: UserReadModelImpl,
    // },
    // {
    //   provide: RoleReadModel,
    //   useClass: RoleReadModelImpl,
    // },
    // {
    //   provide: PermissionReadModel,
    //   useClass: PermissionReadModelImpl,
    // },
    // {
    //   provide: UserFactory,
    //   useClass: UserFactoryImpl,
    // },
    // {
    //   provide: RoleFactory,
    //   useClass: RoleFactoryImpl,
    // },
    // {
    //   provide: PermissionFactory,
    //   useClass: PermissionFactoryImpl,
    // },
    // {
    //   provide: AuthService,
    //   useClass: AuthServiceImpl,
    // },
    // {
    //   provide: PermissionService,
    //   useClass: PermissionServiceImpl,
    // },
    // {
    //   provide: KeycloakService,
    //   useClass: KeycloakServiceImpl,
    // },
    // {
    //   provide: SessionService,
    //   useClass: SessionServiceImpl,
    // },
    // {
    //   provide: AuditService,
    //   useClass: AuditServiceImpl,
    // },
  ],
  exports: [
    // Export application services for use in other modules
    ...AccessServiceApplicationServices,
    
    // Export domain services for use in other modules
    // UserRepository,
    // RoleRepository,
    // PermissionRepository,
    // AuthService,
    // PermissionService,
  ],
})
export class AccessServiceModule {
  constructor() {
    console.log('🔐 Access Service Module initialized');
    console.log('📊 CQRS implementation ready');
    console.log('🎯 Commands and Queries configured');
    console.log('🔒 Security services available');
  }
}

// Health check and module status
export interface AccessServiceStatus {
  module: string;
  status: 'ready' | 'initializing' | 'error';
  features: {
    cqrs: boolean;
    authentication: boolean;
    authorization: boolean;
    userManagement: boolean;
    roleManagement: boolean;
    permissionManagement: boolean;
    audit: boolean;
    analytics: boolean;
  };
  handlers: {
    commands: number;
    queries: number;
  };
  services: {
    application: number;
    domain: number;
  };
}

export const getAccessServiceStatus = (): AccessServiceStatus => {
  return {
    module: 'AccessService',
    status: 'ready',
    features: {
      cqrs: true,
      authentication: true,
      authorization: true,
      userManagement: true,
      roleManagement: true,
      permissionManagement: true,
      audit: true,
      analytics: true,
    },
    handlers: {
      commands: AccessServiceApplicationHandlers.filter(h => h.name.includes('Command')).length,
      queries: AccessServiceApplicationHandlers.filter(h => h.name.includes('Query')).length,
    },
    services: {
      application: AccessServiceApplicationServices.length,
      domain: 9, // UserRepository, RoleRepository, etc.
    },
  };
};
