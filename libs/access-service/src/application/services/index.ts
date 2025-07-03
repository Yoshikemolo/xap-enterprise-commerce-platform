// Export all application services
export { UserApplicationService } from './user.application.service';
export { RoleApplicationService } from './role.application.service';
export { PermissionApplicationService } from './permission.application.service';
export { GroupApplicationService } from './group.application.service';

// Application Services collection for module registration
export const ApplicationServices = [
  UserApplicationService,
  RoleApplicationService,
  PermissionApplicationService,
  GroupApplicationService,
];
