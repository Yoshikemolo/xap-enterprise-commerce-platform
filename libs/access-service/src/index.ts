// Export the main module
export { AccessServiceModule, getAccessServiceStatus } from './access-service.module';

// Export all application layer
export * from './application';

// Export all domain layer
export * from './domain';

// Export infrastructure layer
export * from './infrastructure/persistence/entities';
export * from './infrastructure/persistence/repositories';
export { AccessServicePersistenceModule } from './infrastructure/persistence/persistence.module';

// Main Access Service entry point
export const AccessService = {
  module: AccessServiceModule,
  version: '1.0.0',
  description: 'Enterprise Access Service with CQRS, Authentication, Authorization, and User Management',
  features: [
    'CQRS Pattern Implementation',
    'User Management',
    'Role-Based Access Control (RBAC)',
    'Permission Management',
    'Keycloak Integration',
    'Session Management',
    'Audit Logging',
    'Security Analytics',
    'Event Sourcing',
    'Multi-factor Authentication Support'
  ],
  architecture: {
    pattern: 'Hexagonal Architecture + CQRS + Event Sourcing',
    layers: ['Application', 'Domain', 'Infrastructure'],
    commandHandlers: 20,
    queryHandlers: 25,
    entities: ['User', 'Role', 'Permission'],
    aggregates: ['UserAggregate', 'RoleAggregate', 'PermissionAggregate'],
    events: ['UserCreated', 'UserUpdated', 'UserDeleted', 'RoleAssigned', 'PermissionGranted'],
  }
};
