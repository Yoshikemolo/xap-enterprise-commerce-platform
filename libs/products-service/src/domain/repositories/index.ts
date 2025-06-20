import { Product, ProductProps } from '../entities/product.entity';
import { Stock, StockProps } from '../entities/stock.entity';
import { Family, FamilyProps, Package, PackageProps } from '../entities/family.entity';

// Base Repository Interface
export interface Repository<T> {
  save(entity: T): Promise<T>;
  findById(id: number): Promise<T | null>;
  findByUuid(uuid: string): Promise<T | null>;
  delete(id: number): Promise<void>;
}

// Query Options Interface
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

// ============================================================================
// PRODUCT REPOSITORY
// ============================================================================

export interface ProductRepository extends Repository<Product> {
  findByProductCode(productCode: string): Promise<Product | null>;
  findByFamilyId(familyId: number, options?: QueryOptions): Promise<Product[]>;
  findActiveProducts(options?: QueryOptions): Promise<Product[]>;
  searchProducts(searchTerm: string, options?: QueryOptions): Promise<Product[]>;
  findProductsWithLowStock(options?: QueryOptions): Promise<Product[]>;
  countActiveProducts(): Promise<number>;
  countProductsByFamily(familyId: number): Promise<number>;
  findProductsBySpecification(key: string, value: string, options?: QueryOptions): Promise<Product[]>;
  findProductsWithMedia(mediaType?: string, options?: QueryOptions): Promise<Product[]>;
}

// ============================================================================
// STOCK REPOSITORY  
// ============================================================================

export interface StockRepository extends Repository<Stock> {
  findByProductId(productId: number): Promise<Stock[]>;
  findByProductCode(productCode: string): Promise<Stock[]>;
  findByLocationId(locationId: number, options?: QueryOptions): Promise<Stock[]>;
  findByProductAndLocation(productId: number, locationId: number): Promise<Stock | null>;
  findStockWithLowInventory(options?: QueryOptions): Promise<Stock[]>;
  findStocksByBatchNumber(batchNumber: string): Promise<Stock[]>;
  findExpiringBatches(beforeDate: Date, options?: QueryOptions): Promise<Stock[]>;
  getTotalAvailableQuantity(productId: number): Promise<number>;
  getTotalReservedQuantity(productId: number): Promise<number>;
  findStockMovements(stockId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
  findBatchesByStatus(status: string, options?: QueryOptions): Promise<any[]>;
}

// ============================================================================
// FAMILY REPOSITORY
// ============================================================================

export interface FamilyRepository extends Repository<Family> {
  findByCode(code: string): Promise<Family | null>;
  findByParentFamilyId(parentFamilyId: number, options?: QueryOptions): Promise<Family[]>;
  findRootFamilies(options?: QueryOptions): Promise<Family[]>;
  findActiveFamilies(options?: QueryOptions): Promise<Family[]>;
  searchFamilies(searchTerm: string, options?: QueryOptions): Promise<Family[]>;
  getFamilyHierarchy(familyId: number): Promise<Family[]>;
  countActiveFamilies(): Promise<number>;
  countProductsInFamily(familyId: number): Promise<number>;
}

// ============================================================================
// PACKAGE REPOSITORY
// ============================================================================

export interface PackageRepository extends Repository<Package> {
  findByCode(code: string): Promise<Package | null>;
  findByProductId(productId: number, options?: QueryOptions): Promise<Package[]>;
  findDefaultPackageByProductId(productId: number): Promise<Package | null>;
  findActivePackages(options?: QueryOptions): Promise<Package[]>;
  findPackagesByBarcode(barcode: string): Promise<Package[]>;
  findPackagesByUnitOfMeasure(unitOfMeasure: string, options?: QueryOptions): Promise<Package[]>;
  searchPackages(searchTerm: string, options?: QueryOptions): Promise<Package[]>;
  countActivePackages(): Promise<number>;
  countPackagesByProduct(productId: number): Promise<number>;
}

// ============================================================================
// AGGREGATE REPOSITORY INTERFACES
// ============================================================================

export interface ProductAggregateRepository {
  findProductWithStock(productId: number): Promise<{ product: Product; stocks: Stock[] } | null>;
  findProductWithPackages(productId: number): Promise<{ product: Product; packages: Package[] } | null>;
  findCompleteProduct(productId: number): Promise<{
    product: Product;
    family?: Family;
    stocks: Stock[];
    packages: Package[];
  } | null>;
}

export interface InventoryRepository {
  getInventorySummary(locationId?: number): Promise<{
    totalProducts: number;
    totalStock: number;
    lowStockAlerts: number;
    expiringBatches: number;
  }>;
  
  getProductAvailability(productCode: string, locationId?: number): Promise<{
    totalAvailable: number;
    totalReserved: number;
    batches: Array<{
      batchNumber: string;
      available: number;
      expirationDate?: Date;
    }>;
  }>;
  
  findProductsNeedingRestock(locationId?: number): Promise<Array<{
    product: Product;
    currentStock: number;
    minimumLevel: number;
    reorderPoint?: number;
  }>>;
}