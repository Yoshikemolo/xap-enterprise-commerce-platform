// ============================================================================
// PRODUCTS SERVICE - MAIN EXPORTS
// ============================================================================

// Module Exports
export { ProductsServiceModule, ProductsServiceInfrastructureModule } from './products-service.module';

// Domain Exports
export * from './domain/entities';
export * from './domain/repositories';

// Application Layer Exports
export * from './application/commands';
export * from './application/queries';
export * from './application/dto';
export * from './application/services';

// Infrastructure Layer Exports
export * from './infrastructure/persistence/entities';
export * from './infrastructure/persistence/repositories';
export * from './infrastructure/persistence/migrations/1687420000000-CreateProductsServiceTables';

// Re-export key types for external consumption
export type {
  // Domain Types
  Product,
  Stock,
  Family,
  Package,
  StockBatch,
  ProductSpecification,
  ProductMedia,
  PackageDimensions
} from './domain/entities';

export type {
  // Repository Interfaces
  ProductRepository,
  StockRepository,
  FamilyRepository,
  PackageRepository
} from './domain/repositories';

export type {
  // Application Service Types
  ProductApplicationService,
  StockApplicationService,
  FamilyApplicationService,
  PackageApplicationService
} from './application/services';

export type {
  // Query Types
  PaginatedResult,
  ProductFilters,
  StockFilters,
  FamilyFilters,
  PackageFilters
} from './application/queries';

export type {
  // DTO Types
  CreateProductDto,
  UpdateProductDto,
  CreateStockDto,
  ReserveStockDto,
  CreateFamilyDto,
  CreatePackageDto,
  ProductResponseDto,
  StockResponseDto,
  FamilyResponseDto,
  PackageResponseDto,
  ApiResponseDto,
  PaginationDto
} from './application/dto';
