// ============================================================================
// APPLICATION SERVICES - Products Service
// ============================================================================

export { ProductApplicationService } from './product.application.service';
export { StockApplicationService } from './stock.application.service';
export { FamilyApplicationService } from './family.application.service';
export { PackageApplicationService } from './package.application.service';

// Export all services as an array for easy module registration
export const ApplicationServices = [
  ProductApplicationService,
  StockApplicationService,
  FamilyApplicationService,
  PackageApplicationService
];
