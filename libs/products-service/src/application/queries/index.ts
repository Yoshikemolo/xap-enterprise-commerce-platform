import { QueryHandler, IQuery, IQueryHandler } from '@nestjs/cqrs';
import { ProductRepository, FamilyRepository, PackageRepository, StockRepository } from '../../domain/repositories';
import { Product, Family, Package, Stock, StockBatch } from '../../domain/entities';

// ============================================================================
// QUERY FILTERS AND PAGINATION
// ============================================================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  familyId?: number;
  isActive?: boolean;
  searchTerm?: string;
  hasStock?: boolean;
  productCodes?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface StockFilters {
  productId?: number;
  locationId?: number;
  productCode?: string;
  lowStock?: boolean;
  hasExpiringBatches?: boolean;
  batchNumbers?: string[];
  expiringBefore?: Date;
}

export interface FamilyFilters {
  parentFamilyId?: number;
  isActive?: boolean;
  codes?: string[];
  searchTerm?: string;
}

export interface PackageFilters {
  productId?: number;
  isActive?: boolean;
  isDefault?: boolean;
  unitOfMeasure?: string;
  codes?: string[];
  barcode?: string;
}

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export class GetProductByIdQuery implements IQuery {
  constructor(public readonly productId: number) {}
}

export class GetProductByCodeQuery implements IQuery {
  constructor(public readonly productCode: string) {}
}

export class GetProductsQuery implements IQuery {
  constructor(
    public readonly filters?: ProductFilters,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class SearchProductsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly filters?: ProductFilters,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetProductsByFamilyQuery implements IQuery {
  constructor(
    public readonly familyId: number,
    public readonly includeSubfamilies: boolean = false,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetActiveProductsQuery implements IQuery {
  constructor(public readonly pagination?: PaginationOptions) {}
}

export class GetProductsWithLowStockQuery implements IQuery {
  constructor(public readonly locationId?: number) {}
}

export class GetProductsByCodesQuery implements IQuery {
  constructor(public readonly productCodes: string[]) {}
}

// ============================================================================
// STOCK QUERIES
// ============================================================================

export class GetStockByIdQuery implements IQuery {
  constructor(public readonly stockId: number) {}
}

export class GetStockByProductQuery implements IQuery {
  constructor(
    public readonly productId: number,
    public readonly locationId?: number
  ) {}
}

export class GetStockByLocationQuery implements IQuery {
  constructor(
    public readonly locationId: number,
    public readonly filters?: StockFilters,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetBatchByNumberQuery implements IQuery {
  constructor(public readonly batchNumber: string) {}
}

export class GetBatchesByNumberQuery implements IQuery {
  constructor(public readonly batchNumbers: string[]) {}
}

export class GetExpiringBatchesQuery implements IQuery {
  constructor(
    public readonly daysAhead: number = 30,
    public readonly locationId?: number
  ) {}
}

export class GetReservedStockQuery implements IQuery {
  constructor(
    public readonly orderId?: string,
    public readonly productId?: number,
    public readonly locationId?: number
  ) {}
}

export class GetInventorySummaryQuery implements IQuery {
  constructor(
    public readonly locationId?: number,
    public readonly familyId?: number
  ) {}
}

export class GetBatchTraceabilityQuery implements IQuery {
  constructor(public readonly batchNumber: string) {}
}

// ============================================================================
// FAMILY QUERIES
// ============================================================================

export class GetFamilyByIdQuery implements IQuery {
  constructor(public readonly familyId: number) {}
}

export class GetFamiliesQuery implements IQuery {
  constructor(
    public readonly filters?: FamilyFilters,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetActiveFamiliesQuery implements IQuery {
  constructor(public readonly pagination?: PaginationOptions) {}
}

export class SearchFamiliesQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetFamilyHierarchyQuery implements IQuery {
  constructor(public readonly familyId?: number) {}
}

export class GetSubfamiliesQuery implements IQuery {
  constructor(public readonly parentFamilyId: number) {}
}

export class GetRootFamiliesQuery implements IQuery {
  constructor(public readonly pagination?: PaginationOptions) {}
}

// ============================================================================
// PACKAGE QUERIES
// ============================================================================

export class GetPackageByIdQuery implements IQuery {
  constructor(public readonly packageId: number) {}
}

export class GetPackagesQuery implements IQuery {
  constructor(
    public readonly filters?: PackageFilters,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetActivePackagesQuery implements IQuery {
  constructor(public readonly pagination?: PaginationOptions) {}
}

export class GetPackageByBarcodeQuery implements IQuery {
  constructor(public readonly barcode: string) {}
}

export class GetPackagesByBarcodeQuery implements IQuery {
  constructor(public readonly barcodes: string[]) {}
}

export class GetPackagesByUnitOfMeasureQuery implements IQuery {
  constructor(public readonly unitOfMeasure: string) {}
}

// ============================================================================
// QUERY HANDLERS
// ============================================================================

// Product Query Handlers
@QueryHandler(GetProductByIdQuery)
export class GetProductByIdQueryHandler implements IQueryHandler<GetProductByIdQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductByIdQuery): Promise<Product | null> {
    return await this.productRepository.findById(query.productId);
  }
}

@QueryHandler(GetProductByCodeQuery)
export class GetProductByCodeQueryHandler implements IQueryHandler<GetProductByCodeQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductByCodeQuery): Promise<Product | null> {
    return await this.productRepository.findByProductCode(query.productCode);
  }
}

@QueryHandler(GetProductsQuery)
export class GetProductsQueryHandler implements IQueryHandler<GetProductsQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsQuery): Promise<PaginatedResult<Product>> {
    const products = await this.productRepository.findActiveProducts({
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: products,
      total: products.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(products.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(SearchProductsQuery)
export class SearchProductsQueryHandler implements IQueryHandler<SearchProductsQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: SearchProductsQuery): Promise<PaginatedResult<Product>> {
    const products = await this.productRepository.searchProducts(query.searchTerm, {
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: products,
      total: products.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(products.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(GetProductsByFamilyQuery)
export class GetProductsByFamilyQueryHandler implements IQueryHandler<GetProductsByFamilyQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsByFamilyQuery): Promise<PaginatedResult<Product>> {
    const products = await this.productRepository.findByFamilyId(query.familyId, {
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: products,
      total: products.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(products.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(GetActiveProductsQuery)
export class GetActiveProductsQueryHandler implements IQueryHandler<GetActiveProductsQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetActiveProductsQuery): Promise<PaginatedResult<Product>> {
    const products = await this.productRepository.findActiveProducts({
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: products,
      total: products.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(products.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(GetProductsWithLowStockQuery)
export class GetProductsWithLowStockQueryHandler implements IQueryHandler<GetProductsWithLowStockQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsWithLowStockQuery): Promise<Product[]> {
    return await this.productRepository.findProductsWithLowStock({
      filters: query.locationId ? { locationId: query.locationId } : undefined
    });
  }
}

@QueryHandler(GetProductsByCodesQuery)
export class GetProductsByCodesQueryHandler implements IQueryHandler<GetProductsByCodesQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsByCodesQuery): Promise<Product[]> {
    // Workaround since findByProductCodes doesn't exist
    const products: Product[] = [];
    for (const code of query.productCodes) {
      const product = await this.productRepository.findByProductCode(code);
      if (product) {
        products.push(product);
      }
    }
    return products;
  }
}

// Stock Query Handlers
@QueryHandler(GetStockByIdQuery)
export class GetStockByIdQueryHandler implements IQueryHandler<GetStockByIdQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetStockByIdQuery): Promise<Stock | null> {
    return await this.stockRepository.findById(query.stockId);
  }
}

@QueryHandler(GetStockByProductQuery)
export class GetStockByProductQueryHandler implements IQueryHandler<GetStockByProductQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetStockByProductQuery): Promise<Stock[]> {
    if (query.locationId) {
      const stock = await this.stockRepository.findByProductAndLocation(query.productId, query.locationId);
      return stock ? [stock] : [];
    }
    return await this.stockRepository.findByProductId(query.productId);
  }
}

@QueryHandler(GetStockByLocationQuery)
export class GetStockByLocationQueryHandler implements IQueryHandler<GetStockByLocationQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetStockByLocationQuery): Promise<Stock[]> {
    return await this.stockRepository.findByLocationId(query.locationId, {
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
  }
}

@QueryHandler(GetBatchByNumberQuery)
export class GetBatchByNumberQueryHandler implements IQueryHandler<GetBatchByNumberQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetBatchByNumberQuery): Promise<Stock[]> {
    return await this.stockRepository.findStocksByBatchNumber(query.batchNumber);
  }
}

@QueryHandler(GetBatchesByNumberQuery)
export class GetBatchesByNumberQueryHandler implements IQueryHandler<GetBatchesByNumberQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetBatchesByNumberQuery): Promise<Stock[]> {
    const allStocks: Stock[] = [];
    for (const batchNumber of query.batchNumbers) {
      const stocks = await this.stockRepository.findStocksByBatchNumber(batchNumber);
      allStocks.push(...stocks);
    }
    return allStocks;
  }
}

@QueryHandler(GetExpiringBatchesQuery)
export class GetExpiringBatchesQueryHandler implements IQueryHandler<GetExpiringBatchesQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetExpiringBatchesQuery): Promise<Stock[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + query.daysAhead);
    
    return await this.stockRepository.findExpiringBatches(expirationDate, {
      filters: query.locationId ? { locationId: query.locationId } : undefined
    });
  }
}

@QueryHandler(GetReservedStockQuery)
export class GetReservedStockQueryHandler implements IQueryHandler<GetReservedStockQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetReservedStockQuery): Promise<Stock[]> {
    // Use findStockWithLowInventory as a placeholder until proper method exists
    return await this.stockRepository.findStockWithLowInventory({
      filters: {
        productId: query.productId,
        locationId: query.locationId
      }
    });
  }
}

@QueryHandler(GetInventorySummaryQuery)
export class GetInventorySummaryQueryHandler implements IQueryHandler<GetInventorySummaryQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetInventorySummaryQuery): Promise<any> {
    // Simplified implementation - would need proper inventory summary method
    const stocks = await this.stockRepository.findByLocationId(query.locationId || 1);
    
    return {
      totalProducts: stocks.length,
      totalStock: stocks.reduce((sum, stock) => sum + stock.totalQuantity, 0),
      totalReserved: stocks.reduce((sum, stock) => sum + stock.reservedQuantity, 0),
      totalAvailable: stocks.reduce((sum, stock) => sum + stock.availableQuantity, 0)
    };
  }
}

@QueryHandler(GetBatchTraceabilityQuery)
export class GetBatchTraceabilityQueryHandler implements IQueryHandler<GetBatchTraceabilityQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetBatchTraceabilityQuery): Promise<any> {
    const stocks = await this.stockRepository.findStocksByBatchNumber(query.batchNumber);
    const movements = await this.stockRepository.findStockMovements(stocks[0]?.id || 0);
    
    return {
      batchNumber: query.batchNumber,
      stocks,
      movements
    };
  }
}

// Family Query Handlers
@QueryHandler(GetFamilyByIdQuery)
export class GetFamilyByIdQueryHandler implements IQueryHandler<GetFamilyByIdQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetFamilyByIdQuery): Promise<Family | null> {
    return await this.familyRepository.findById(query.familyId);
  }
}

@QueryHandler(GetFamiliesQuery)
export class GetFamiliesQueryHandler implements IQueryHandler<GetFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetFamiliesQuery): Promise<PaginatedResult<Family>> {
    // Use findActiveFamilies as the base method since findMany doesn't exist
    const families = await this.familyRepository.findActiveFamilies({
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: families,
      total: families.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(families.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(GetActiveFamiliesQuery)
export class GetActiveFamiliesQueryHandler implements IQueryHandler<GetActiveFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetActiveFamiliesQuery): Promise<PaginatedResult<Family>> {
    const families = await this.familyRepository.findActiveFamilies({
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: families,
      total: families.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(families.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(SearchFamiliesQuery)
export class SearchFamiliesQueryHandler implements IQueryHandler<SearchFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: SearchFamiliesQuery): Promise<PaginatedResult<Family>> {
    const families = await this.familyRepository.searchFamilies(query.searchTerm, {
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: families,
      total: families.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(families.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(GetFamilyHierarchyQuery)
export class GetFamilyHierarchyQueryHandler implements IQueryHandler<GetFamilyHierarchyQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetFamilyHierarchyQuery): Promise<Family[]> {
    if (query.familyId) {
      return await this.familyRepository.getFamilyHierarchy(query.familyId);
    }
    return await this.familyRepository.findRootFamilies();
  }
}

@QueryHandler(GetSubfamiliesQuery)
export class GetSubfamiliesQueryHandler implements IQueryHandler<GetSubfamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetSubfamiliesQuery): Promise<Family[]> {
    return await this.familyRepository.findByParentFamilyId(query.parentFamilyId);
  }
}

@QueryHandler(GetRootFamiliesQuery)
export class GetRootFamiliesQueryHandler implements IQueryHandler<GetRootFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetRootFamiliesQuery): Promise<PaginatedResult<Family>> {
    const families = await this.familyRepository.findRootFamilies({
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: families,
      total: families.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(families.length / (query.pagination?.limit || 10))
    };
  }
}

// Package Query Handlers
@QueryHandler(GetPackageByIdQuery)
export class GetPackageByIdQueryHandler implements IQueryHandler<GetPackageByIdQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackageByIdQuery): Promise<Package | null> {
    return await this.packageRepository.findById(query.packageId);
  }
}

@QueryHandler(GetPackagesQuery)
export class GetPackagesQueryHandler implements IQueryHandler<GetPackagesQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackagesQuery): Promise<PaginatedResult<Package>> {
    const packages = await this.packageRepository.findActivePackages({
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: packages,
      total: packages.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(packages.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(GetActivePackagesQuery)
export class GetActivePackagesQueryHandler implements IQueryHandler<GetActivePackagesQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetActivePackagesQuery): Promise<PaginatedResult<Package>> {
    const packages = await this.packageRepository.findActivePackages({
      limit: query.pagination?.limit,
      offset: query.pagination?.page ? (query.pagination.page - 1) * (query.pagination.limit || 10) : 0,
      sortBy: query.pagination?.sortBy,
      sortOrder: query.pagination?.sortOrder
    });
    
    return {
      data: packages,
      total: packages.length,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 10,
      totalPages: Math.ceil(packages.length / (query.pagination?.limit || 10))
    };
  }
}

@QueryHandler(GetPackageByBarcodeQuery)
export class GetPackageByBarcodeQueryHandler implements IQueryHandler<GetPackageByBarcodeQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackageByBarcodeQuery): Promise<Package[]> {
    return await this.packageRepository.findPackagesByBarcode(query.barcode);
  }
}

@QueryHandler(GetPackagesByBarcodeQuery)
export class GetPackagesByBarcodeQueryHandler implements IQueryHandler<GetPackagesByBarcodeQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackagesByBarcodeQuery): Promise<Package[]> {
    const allPackages: Package[] = [];
    for (const barcode of query.barcodes) {
      const packages = await this.packageRepository.findPackagesByBarcode(barcode);
      allPackages.push(...packages);
    }
    return allPackages;
  }
}

@QueryHandler(GetPackagesByUnitOfMeasureQuery)
export class GetPackagesByUnitOfMeasureQueryHandler implements IQueryHandler<GetPackagesByUnitOfMeasureQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackagesByUnitOfMeasureQuery): Promise<Package[]> {
    return await this.packageRepository.findPackagesByUnitOfMeasure(query.unitOfMeasure);
  }
}

// Export all Query Handlers
export const QueryHandlers = [
  // Product Handlers
  GetProductByIdQueryHandler,
  GetProductByCodeQueryHandler,
  GetProductsQueryHandler,
  SearchProductsQueryHandler,
  GetProductsByFamilyQueryHandler,
  GetActiveProductsQueryHandler,
  GetProductsWithLowStockQueryHandler,
  GetProductsByCodesQueryHandler,
  
  // Stock Handlers
  GetStockByIdQueryHandler,
  GetStockByProductQueryHandler,
  GetStockByLocationQueryHandler,
  GetBatchByNumberQueryHandler,
  GetBatchesByNumberQueryHandler,
  GetExpiringBatchesQueryHandler,
  GetReservedStockQueryHandler,
  GetInventorySummaryQueryHandler,
  GetBatchTraceabilityQueryHandler,
  
  // Family Handlers
  GetFamilyByIdQueryHandler,
  GetFamiliesQueryHandler,
  GetActiveFamiliesQueryHandler,
  SearchFamiliesQueryHandler,
  GetFamilyHierarchyQueryHandler,
  GetSubfamiliesQueryHandler,
  GetRootFamiliesQueryHandler,
  
  // Package Handlers
  GetPackageByIdQueryHandler,
  GetPackagesQueryHandler,
  GetActivePackagesQueryHandler,
  GetPackageByBarcodeQueryHandler,
  GetPackagesByBarcodeQueryHandler,
  GetPackagesByUnitOfMeasureQueryHandler
];
