// Domain Entities
export { Product, ProductProps, ProductSpecification, ProductMedia } from './product.entity';
export { Stock, StockProps, StockBatch, BatchStatus, MovementType, StockMovement } from './stock.entity';
export { Family, FamilyProps, Package, PackageProps, PackageDimensions } from './family.entity';

// Domain Events - Product
export {
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductActivatedEvent,
  ProductDeactivatedEvent,
  ProductDeletedEvent
} from './product.entity';

// Domain Events - Stock
export {
  StockCreatedEvent,
  StockUpdatedEvent,
  BatchAddedEvent,
  BatchUpdatedEvent,
  StockMovementEvent,
  LowStockAlertEvent,
  ExpirationAlertEvent
} from './stock.entity';

// Domain Events - Family & Package
export {
  FamilyCreatedEvent,
  FamilyUpdatedEvent,
  FamilyActivatedEvent,
  FamilyDeactivatedEvent,
  PackageCreatedEvent,
  PackageUpdatedEvent,
  PackageActivatedEvent,
  PackageDeactivatedEvent,
  PackageSetAsDefaultEvent
} from './family.entity';