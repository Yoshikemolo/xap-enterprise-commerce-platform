// TypeORM Repository Implementations Export
export { TypeOrmProductRepository } from './typeorm-product.repository';
export { TypeOrmStockRepository } from './typeorm-stock.repository';
export { TypeOrmFamilyRepository, TypeOrmPackageRepository } from './typeorm-family-package.repository';

// Export all repository implementations as array for module registration
export const ProductsServiceRepositories = [
  TypeOrmProductRepository,
  TypeOrmStockRepository,
  TypeOrmFamilyRepository,
  TypeOrmPackageRepository
];
