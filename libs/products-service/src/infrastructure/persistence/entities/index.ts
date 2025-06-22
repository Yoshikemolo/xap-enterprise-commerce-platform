// TypeORM Entities Export
export { ProductEntity } from './product.entity';
export { StockEntity, StockMovementEntity } from './stock.entity';
export { FamilyEntity, PackageEntity } from './family.entity';

// Export all entities as array for TypeORM configuration
export const ProductsServiceEntities = [
  ProductEntity,
  StockEntity,
  StockMovementEntity,
  FamilyEntity,
  PackageEntity
];
