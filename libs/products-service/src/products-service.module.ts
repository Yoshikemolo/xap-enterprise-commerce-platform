import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import Entities
import { ProductsServiceEntities } from './infrastructure/persistence/entities';

// Import Commands and Handlers
import { CommandHandlers } from './application/commands';

// Import Queries and Handlers  
import { QueryHandlers } from './application/queries';

// Import Application Services
import { ApplicationServices } from './application/services';

// Import Repository Implementations
import { ProductsServiceRepositories } from './infrastructure/persistence/repositories';

// Import Web Controllers
import { ProductsServiceControllers } from './infrastructure/web';

// Define DI Tokens for repositories
export const PRODUCT_REPOSITORY = 'ProductRepository';
export const STOCK_REPOSITORY = 'StockRepository';
export const FAMILY_REPOSITORY = 'FamilyRepository';
export const PACKAGE_REPOSITORY = 'PackageRepository';

// Import Domain Repository Interfaces (for DI tokens)
import { 
  ProductRepository, 
  StockRepository, 
  FamilyRepository, 
  PackageRepository 
} from './domain/repositories';

// Import Repository Implementations
import {
  TypeOrmProductRepository,
  TypeOrmStockRepository,
  TypeOrmFamilyRepository,
  TypeOrmPackageRepository
} from './infrastructure/persistence/repositories';

/**
 * Products Service Module
 * 
 * Complete CQRS module with:
 * - Domain entities and business logic
 * - Command and Query handlers
 * - Application services for orchestration
 * - TypeORM infrastructure layer
 * - Repository implementations
 * - Database configuration
 */
@Module({
  imports: [
    // CQRS module for command/query handling
    CqrsModule,
    
    // TypeORM entities registration
    TypeOrmModule.forFeature(ProductsServiceEntities),
  ],
  controllers: [
    // REST API Controllers
    ...ProductsServiceControllers,
  ],
  providers: [
    // Command Handlers (25+ handlers)
    ...CommandHandlers,
    
    // Query Handlers (25+ handlers)
    ...QueryHandlers,
    
    // Application Services (orchestration layer)
    ...ApplicationServices,
    
    // Repository implementations with DI token mapping
    {
      provide: PRODUCT_REPOSITORY,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: STOCK_REPOSITORY,
      useClass: TypeOrmStockRepository,
    },
    {
      provide: FAMILY_REPOSITORY,
      useClass: TypeOrmFamilyRepository,
    },
    {
      provide: PACKAGE_REPOSITORY,
      useClass: TypeOrmPackageRepository,
    },
  ],
  exports: [
    // Export application services for use in other modules
    ...ApplicationServices,
    
    // Export repositories for testing or other modules
    PRODUCT_REPOSITORY,
    STOCK_REPOSITORY,
    FAMILY_REPOSITORY,
    PACKAGE_REPOSITORY,
  ],
})
export class ProductsServiceModule {}

/**
 * Products Service Infrastructure Module
 * 
 * Separate module for infrastructure concerns (database, external services)
 * Can be imported independently for testing or different configurations
 */
@Module({
  imports: [
    TypeOrmModule.forFeature(ProductsServiceEntities),
  ],
  providers: [
    ...ProductsServiceRepositories,
  ],
  exports: [
    ...ProductsServiceRepositories,
  ],
})
export class ProductsServiceInfrastructureModule {}
