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

export class GetProductSpecificationsQuery implements IQuery {
  constructor(public readonly productId: number) {}
}

export class GetProductMediaQuery implements IQuery {
  constructor(public readonly productId: number) {}
}

export class GetProductStockSummaryQuery implements IQuery {
  constructor(public readonly productId: number) {}
}

export class GetProductsWithLowStockQuery implements IQuery {
  constructor(public readonly locationId?: number) {}
}

export class GetProductsWithoutStockQuery implements IQuery {
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

export class GetBatchesByNumberQuery implements IQuery {
  constructor(public readonly batchNumbers: string[]) {}
}

export class GetBatchByNumberQuery implements IQuery {
  constructor(public readonly batchNumber: string) {}
}

export class GetExpiringBatchesQuery implements IQuery {
  constructor(
    public readonly daysAhead: number = 30,
    public readonly locationId?: number
  ) {}
}

export class GetStockMovementsQuery implements IQuery {
  constructor(
    public readonly stockId?: number,
    public readonly productId?: number,
    public readonly batchNumber?: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetAvailableStockQuery implements IQuery {
  constructor(
    public readonly productId: number,
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

export class GetStocksWithLowLevelsQuery implements IQuery {
  constructor(public readonly locationId?: number) {}
}

export class GetBatchesExpiringBeforeDateQuery implements IQuery {
  constructor(
    public readonly expirationDate: Date,
    public readonly locationId?: number
  ) {}
}

// ============================================================================
// FAMILY QUERIES
// ============================================================================

export class GetFamilyByIdQuery implements IQuery {
  constructor(public readonly familyId: number) {}
}

export class GetFamilyByCodeQuery implements IQuery {
  constructor(public readonly code: string) {}
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

export class GetFamilyProductsQuery implements IQuery {
  constructor(
    public readonly familyId: number,
    public readonly includeSubfamilies: boolean = false
  ) {}
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

export class GetPackageByCodeQuery implements IQuery {
  constructor(public readonly code: string) {}
}

export class GetPackagesQuery implements IQuery {
  constructor(
    public readonly filters?: PackageFilters,
    public readonly pagination?: PaginationOptions
  ) {}
}

export class GetPackagesByProductQuery implements IQuery {
  constructor(public readonly productId: number) {}
}

export class GetActivePackagesQuery implements IQuery {
  constructor(public readonly pagination?: PaginationOptions) {}
}

export class GetDefaultPackageQuery implements IQuery {
  constructor(public readonly productId: number) {}
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
// ANALYTICS AND REPORTING QUERIES
// ============================================================================

export class GetProductStatisticsQuery implements IQuery {
  constructor(
    public readonly familyId?: number,
    public readonly locationId?: number
  ) {}
}

export class GetStockStatisticsQuery implements IQuery {
  constructor(
    public readonly locationId?: number,
    public readonly familyId?: number
  ) {}
}

export class GetInventoryValuationQuery implements IQuery {
  constructor(public readonly locationId?: number) {}
}

export class GetTopProductsByStockValueQuery implements IQuery {
  constructor(
    public readonly limit: number = 10,
    public readonly locationId?: number
  ) {}
}

export class GetLowStockReportQuery implements IQuery {
  constructor(public readonly locationId?: number) {}
}

export class GetExpirationReportQuery implements IQuery {
  constructor(
    public readonly daysAhead: number = 30,
    public readonly locationId?: number
  ) {}
}

export class GetStockMovementReportQuery implements IQuery {
  constructor(
    public readonly fromDate: Date,
    public readonly toDate: Date,
    public readonly locationId?: number,
    public readonly productId?: number
  ) {}
}

export class GetBatchUtilizationReportQuery implements IQuery {
  constructor(
    public readonly fromDate: Date,
    public readonly toDate: Date,
    public readonly locationId?: number
  ) {}
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
    return await this.productRepository.findMany(query.filters || {}, query.pagination);
  }
}

@QueryHandler(SearchProductsQuery)
export class SearchProductsQueryHandler implements IQueryHandler<SearchProductsQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: SearchProductsQuery): Promise<PaginatedResult<Product>> {
    return await this.productRepository.search(query.searchTerm, query.filters, query.pagination);
  }
}

@QueryHandler(GetProductsByFamilyQuery)
export class GetProductsByFamilyQueryHandler implements IQueryHandler<GetProductsByFamilyQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsByFamilyQuery): Promise<PaginatedResult<Product>> {
    return await this.productRepository.findByFamily(
      query.familyId,
      query.includeSubfamilies,
      query.pagination
    );
  }
}

@QueryHandler(GetActiveProductsQuery)
export class GetActiveProductsQueryHandler implements IQueryHandler<GetActiveProductsQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetActiveProductsQuery): Promise<PaginatedResult<Product>> {
    return await this.productRepository.findActive(query.pagination);
  }
}

@QueryHandler(GetProductSpecificationsQuery)
export class GetProductSpecificationsQueryHandler implements IQueryHandler<GetProductSpecificationsQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductSpecificationsQuery): Promise<any[]> {
    const product = await this.productRepository.findById(query.productId);
    return product ? product.specifications : [];
  }
}

@QueryHandler(GetProductMediaQuery)
export class GetProductMediaQueryHandler implements IQueryHandler<GetProductMediaQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductMediaQuery): Promise<any[]> {
    const product = await this.productRepository.findById(query.productId);
    return product ? product.media : [];
  }
}

@QueryHandler(GetProductStockSummaryQuery)
export class GetProductStockSummaryQueryHandler implements IQueryHandler<GetProductStockSummaryQuery> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly stockRepository: StockRepository
  ) {}

  async execute(query: GetProductStockSummaryQuery): Promise<any> {
    const product = await this.productRepository.findById(query.productId);
    if (!product) {
      throw new Error(`Product with ID ${query.productId} not found`);
    }

    const stockRecords = await this.stockRepository.findByProductId(query.productId);
    
    return {
      product: {
        id: product.id,
        productCode: product.productCode,
        name: product.name
      },
      stockSummary: stockRecords.map(stock => ({
        locationId: stock.locationId,
        totalQuantity: stock.totalQuantity,
        availableQuantity: stock.availableQuantity,
        reservedQuantity: stock.reservedQuantity,
        batches: stock.batches.length,
        lowStockAlert: stock.totalQuantity <= (stock.minimumLevel || 0)
      }))
    };
  }
}

@QueryHandler(GetProductsWithLowStockQuery)
export class GetProductsWithLowStockQueryHandler implements IQueryHandler<GetProductsWithLowStockQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetProductsWithLowStockQuery): Promise<any[]> {
    return await this.stockRepository.findProductsWithLowStock(query.locationId);
  }
}

@QueryHandler(GetProductsByCodesQuery)
export class GetProductsByCodesQueryHandler implements IQueryHandler<GetProductsByCodesQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsByCodesQuery): Promise<Product[]> {
    return await this.productRepository.findByProductCodes(query.productCodes);
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

  async execute(query: GetStockByLocationQuery): Promise<PaginatedResult<Stock>> {
    return await this.stockRepository.findByLocation(query.locationId, query.filters, query.pagination);
  }
}

@QueryHandler(GetBatchByNumberQuery)
export class GetBatchByNumberQueryHandler implements IQueryHandler<GetBatchByNumberQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetBatchByNumberQuery): Promise<{ stock: Stock; batch: StockBatch } | null> {
    return await this.stockRepository.findBatchByNumber(query.batchNumber);
  }
}

@QueryHandler(GetBatchesByNumberQuery)
export class GetBatchesByNumberQueryHandler implements IQueryHandler<GetBatchesByNumberQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetBatchesByNumberQuery): Promise<{ stock: Stock; batch: StockBatch }[]> {
    return await this.stockRepository.findBatchesByNumbers(query.batchNumbers);
  }
}

@QueryHandler(GetExpiringBatchesQuery)
export class GetExpiringBatchesQueryHandler implements IQueryHandler<GetExpiringBatchesQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetExpiringBatchesQuery): Promise<{ stock: Stock; batch: StockBatch }[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + query.daysAhead);
    
    return await this.stockRepository.findExpiringBatches(expirationDate, query.locationId);
  }
}

@QueryHandler(GetAvailableStockQuery)
export class GetAvailableStockQueryHandler implements IQueryHandler<GetAvailableStockQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetAvailableStockQuery): Promise<number> {
    const stocks = query.locationId 
      ? [await this.stockRepository.findByProductAndLocation(query.productId, query.locationId)]
      : await this.stockRepository.findByProductId(query.productId);

    return stocks
      .filter(stock => stock !== null)
      .reduce((total, stock) => total + stock!.availableQuantity, 0);
  }
}

@QueryHandler(GetReservedStockQuery)
export class GetReservedStockQueryHandler implements IQueryHandler<GetReservedStockQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetReservedStockQuery): Promise<any[]> {
    return await this.stockRepository.findReservedStock({
      orderId: query.orderId,
      productId: query.productId,
      locationId: query.locationId
    });
  }
}

@QueryHandler(GetInventorySummaryQuery)
export class GetInventorySummaryQueryHandler implements IQueryHandler<GetInventorySummaryQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetInventorySummaryQuery): Promise<any> {
    return await this.stockRepository.getInventorySummary(query.locationId, query.familyId);
  }
}

@QueryHandler(GetBatchTraceabilityQuery)
export class GetBatchTraceabilityQueryHandler implements IQueryHandler<GetBatchTraceabilityQuery> {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: GetBatchTraceabilityQuery): Promise<any> {
    const batchInfo = await this.stockRepository.findBatchByNumber(query.batchNumber);
    if (!batchInfo) {
      throw new Error(`Batch ${query.batchNumber} not found`);
    }

    const movements = await this.stockRepository.getBatchMovements(query.batchNumber);
    
    return {
      batch: batchInfo.batch,
      stock: batchInfo.stock,
      movements: movements,
      traceability: {
        created: batchInfo.batch.createdAt,
        totalMovements: movements.length,
        currentStatus: batchInfo.batch.status,
        location: batchInfo.batch.location
      }
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

@QueryHandler(GetFamilyByCodeQuery)
export class GetFamilyByCodeQueryHandler implements IQueryHandler<GetFamilyByCodeQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetFamilyByCodeQuery): Promise<Family | null> {
    return await this.familyRepository.findByCode(query.code);
  }
}

@QueryHandler(GetFamiliesQuery)
export class GetFamiliesQueryHandler implements IQueryHandler<GetFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetFamiliesQuery): Promise<PaginatedResult<Family>> {
    return await this.familyRepository.findMany(query.filters || {}, query.pagination);
  }
}

@QueryHandler(GetActiveFamiliesQuery)
export class GetActiveFamiliesQueryHandler implements IQueryHandler<GetActiveFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetActiveFamiliesQuery): Promise<PaginatedResult<Family>> {
    return await this.familyRepository.findActive(query.pagination);
  }
}

@QueryHandler(SearchFamiliesQuery)
export class SearchFamiliesQueryHandler implements IQueryHandler<SearchFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: SearchFamiliesQuery): Promise<PaginatedResult<Family>> {
    return await this.familyRepository.search(query.searchTerm, query.pagination);
  }
}

@QueryHandler(GetFamilyHierarchyQuery)
export class GetFamilyHierarchyQueryHandler implements IQueryHandler<GetFamilyHierarchyQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetFamilyHierarchyQuery): Promise<any> {
    return await this.familyRepository.getHierarchy(query.familyId);
  }
}

@QueryHandler(GetSubfamiliesQuery)
export class GetSubfamiliesQueryHandler implements IQueryHandler<GetSubfamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetSubfamiliesQuery): Promise<Family[]> {
    return await this.familyRepository.findSubfamilies(query.parentFamilyId);
  }
}

@QueryHandler(GetRootFamiliesQuery)
export class GetRootFamiliesQueryHandler implements IQueryHandler<GetRootFamiliesQuery> {
  constructor(private readonly familyRepository: FamilyRepository) {}

  async execute(query: GetRootFamiliesQuery): Promise<PaginatedResult<Family>> {
    return await this.familyRepository.findRootFamilies(query.pagination);
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

@QueryHandler(GetPackageByCodeQuery)
export class GetPackageByCodeQueryHandler implements IQueryHandler<GetPackageByCodeQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackageByCodeQuery): Promise<Package | null> {
    return await this.packageRepository.findByCode(query.code);
  }
}

@QueryHandler(GetPackagesQuery)
export class GetPackagesQueryHandler implements IQueryHandler<GetPackagesQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackagesQuery): Promise<PaginatedResult<Package>> {
    return await this.packageRepository.findMany(query.filters || {}, query.pagination);
  }
}

@QueryHandler(GetPackagesByProductQuery)
export class GetPackagesByProductQueryHandler implements IQueryHandler<GetPackagesByProductQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackagesByProductQuery): Promise<Package[]> {
    return await this.packageRepository.findByProductId(query.productId);
  }
}

@QueryHandler(GetActivePackagesQuery)
export class GetActivePackagesQueryHandler implements IQueryHandler<GetActivePackagesQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetActivePackagesQuery): Promise<PaginatedResult<Package>> {
    return await this.packageRepository.findActive(query.pagination);
  }
}

@QueryHandler(GetDefaultPackageQuery)
export class GetDefaultPackageQueryHandler implements IQueryHandler<GetDefaultPackageQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetDefaultPackageQuery): Promise<Package | null> {
    return await this.packageRepository.findDefaultPackageByProductId(query.productId);
  }
}

@QueryHandler(GetPackageByBarcodeQuery)
export class GetPackageByBarcodeQueryHandler implements IQueryHandler<GetPackageByBarcodeQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackageByBarcodeQuery): Promise<Package | null> {
    return await this.packageRepository.findByBarcode(query.barcode);
  }
}

@QueryHandler(GetPackagesByBarcodeQuery)
export class GetPackagesByBarcodeQueryHandler implements IQueryHandler<GetPackagesByBarcodeQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackagesByBarcodeQuery): Promise<Package[]> {
    return await this.packageRepository.findByBarcodes(query.barcodes);
  }
}

@QueryHandler(GetPackagesByUnitOfMeasureQuery)
export class GetPackagesByUnitOfMeasureQueryHandler implements IQueryHandler<GetPackagesByUnitOfMeasureQuery> {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(query: GetPackagesByUnitOfMeasureQuery): Promise<Package[]> {
    return await this.packageRepository.findByUnitOfMeasure(query.unitOfMeasure);
  }
}

// Export all queries and handlers
export const ProductQueries = [
  GetProductByIdQuery,
  GetProductByCodeQuery,
  GetProductsQuery,
  SearchProductsQuery,
  GetProductsByFamilyQuery,
  GetActiveProductsQuery,
  GetProductSpecificationsQuery,
  GetProductMediaQuery,
  GetProductStockSummaryQuery,
  GetProductsWithLowStockQuery,
  GetProductsWithoutStockQuery,
  GetProductsByCodesQuery
];

export const StockQueries = [
  GetStockByIdQuery,
  GetStockByProductQuery,
  GetStockByLocationQuery,
  GetBatchesByNumberQuery,
  GetBatchByNumberQuery,
  GetExpiringBatchesQuery,
  GetStockMovementsQuery,
  GetAvailableStockQuery,
  GetReservedStockQuery,
  GetInventorySummaryQuery,
  GetBatchTraceabilityQuery,
  GetStocksWithLowLevelsQuery,
  GetBatchesExpiringBeforeDateQuery
];

export const FamilyQueries = [
  GetFamilyByIdQuery,
  GetFamilyByCodeQuery,
  GetFamiliesQuery,
  GetActiveFamiliesQuery,
  SearchFamiliesQuery,
  GetFamilyHierarchyQuery,
  GetSubfamiliesQuery,
  GetFamilyProductsQuery,
  GetRootFamiliesQuery
];

export const PackageQueries = [
  GetPackageByIdQuery,
  GetPackageByCodeQuery,
  GetPackagesQuery,
  GetPackagesByProductQuery,
  GetActivePackagesQuery,
  GetDefaultPackageQuery,
  GetPackageByBarcodeQuery,
  GetPackagesByBarcodeQuery,
  GetPackagesByUnitOfMeasureQuery
];

export const AnalyticsQueries = [
  GetProductStatisticsQuery,
  GetStockStatisticsQuery,
  GetInventoryValuationQuery,
  GetTopProductsByStockValueQuery,
  GetLowStockReportQuery,
  GetExpirationReportQuery,
  GetStockMovementReportQuery,
  GetBatchUtilizationReportQuery
];

export const QueryHandlers = [
  // Product Handlers
  GetProductByIdQueryHandler,
  GetProductByCodeQueryHandler,
  GetProductsQueryHandler,
  SearchProductsQueryHandler,
  GetProductsByFamilyQueryHandler,
  GetActiveProductsQueryHandler,
  GetProductSpecificationsQueryHandler,
  GetProductMediaQueryHandler,
  GetProductStockSummaryQueryHandler,
  GetProductsWithLowStockQueryHandler,
  GetProductsByCodesQueryHandler,
  
  // Stock Handlers
  GetStockByIdQueryHandler,
  GetStockByProductQueryHandler,
  GetStockByLocationQueryHandler,
  GetBatchByNumberQueryHandler,
  GetBatchesByNumberQueryHandler,
  GetExpiringBatchesQueryHandler,
  GetAvailableStockQueryHandler,
  GetReservedStockQueryHandler,
  GetInventorySummaryQueryHandler,
  GetBatchTraceabilityQueryHandler,
  
  // Family Handlers
  GetFamilyByIdQueryHandler,
  GetFamilyByCodeQueryHandler,
  GetFamiliesQueryHandler,
  GetActiveFamiliesQueryHandler,
  SearchFamiliesQueryHandler,
  GetFamilyHierarchyQueryHandler,
  GetSubfamiliesQueryHandler,
  GetRootFamiliesQueryHandler,
  
  // Package Handlers
  GetPackageByIdQueryHandler,
  GetPackageByCodeQueryHandler,
  GetPackagesQueryHandler,
  GetPackagesByProductQueryHandler,
  GetActivePackagesQueryHandler,
  GetDefaultPackageQueryHandler,
  GetPackageByBarcodeQueryHandler,
  GetPackagesByBarcodeQueryHandler,
  GetPackagesByUnitOfMeasureQueryHandler
];
