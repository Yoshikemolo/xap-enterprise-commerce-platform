// Export Commands and Command Handlers
export * from './commands';

// Export Queries and Query Handlers  
export * from './queries';

// Export DTOs
export * from './dto';

// Export Application Services
export * from './services';

// Aggregate all handlers for module registration
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { ApplicationServices } from './services';

export const AccessServiceApplicationHandlers = [
  ...CommandHandlers,
  ...QueryHandlers,
];

export const AccessServiceApplicationServices = [
  ...ApplicationServices,
];

// Complete application layer exports
export const AccessServiceApplication = {
  handlers: AccessServiceApplicationHandlers,
  services: AccessServiceApplicationServices,
};
