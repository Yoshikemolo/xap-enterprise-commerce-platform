// ============================================================================
// RESPONSE DTOs - Products Service
// ============================================================================

import { Exclude, Expose, Type, Transform } from 'class-transformer';

// Common Response DTOs
export class PaginatedResponseDto<T> {
  @Expose()
  data: T[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;

  constructor(partial: Partial<PaginatedResponseDto<T>>) {
    Object.assign(this, partial);
    this.totalPages = Math.ceil(this.total / this.limit);
  }
}

export class ApiResponseDto<T> {
  @Expose()
  success: boolean;

  @Expose()
  data?: T;

  @Expose()
  message?: string;

  @Expose()
  errors?: string[];

  @Expose()
  timestamp: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }
}

// ============================================================================
// PRODUCT RESPONSE DTOs
// ============================================================================

export class ProductSpecificationResponseDto {
  @Expose()
  key: string;

  @Expose()
  value: string;

  @Expose()
  unit?: string;

  @Expose()
  description?: string;
}

export class ProductMediaResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: 'image' | 'video' | 'document';

  @Expose()
  url: string;

  @Expose()
  altText?: string;

  @Expose()
  isPrimary: boolean;

  @Expose()
  sortOrder?: number;

  @Expose()
  metadata?: Record<string, any>;
}

export class ProductResponseDto {
  @Expose()
  id: number;

  @Expose()
  productCode: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  familyId?: number;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => ProductSpecificationResponseDto)
  specifications: ProductSpecificationResponseDto[];

  @Expose()
  @Type(() => ProductMediaResponseDto)
  media: ProductMediaResponseDto[];

  @Expose()
  metadata?: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy?: string;

  @Expose()
  updatedBy?: string;

  // Exclude sensitive internal data
  @Exclude()
  _domainEvents?: any[];
}

export class ProductStockSummaryResponseDto {
  @Expose()
  @Type(() => ProductResponseDto)
  product: {
    id: number;
    productCode: string;
    name: string;
  };

  @Expose()
  stockSummary: {
    locationId: number;
    totalQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    batches: number;
    lowStockAlert: boolean;
  }[];
}

// ============================================================================
// STOCK RESPONSE DTOs
// ============================================================================

export class StockBatchResponseDto {
  @Expose()
  batchNumber: string;

  @Expose()
  quantity: number;

  @Expose()
  availableQuantity: number;

  @Expose()
  reservedQuantity: number;

  @Expose()
  productionDate?: Date;

  @Expose()
  expirationDate?: Date;

  @Expose()
  supplier?: string;

  @Expose()
  cost?: number;

  @Expose()
  location?: string;

  @Expose()
  status: string;

  @Expose()
  metadata?: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class StockResponseDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  productCode: string;

  @Expose()
  locationId: number;

  @Expose()
  totalQuantity: number;

  @Expose()
  availableQuantity: number;

  @Expose()
  reservedQuantity: number;

  @Expose()
  minimumLevel?: number;

  @Expose()
  maximumLevel?: number;

  @Expose()
  reorderPoint?: number;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => StockBatchResponseDto)
  batches: StockBatchResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy?: string;

  @Expose()
  updatedBy?: string;

  // Exclude sensitive internal data
  @Exclude()
  _domainEvents?: any[];
}

export class StockMovementResponseDto {
  @Expose()
  id: number;

  @Expose()
  stockId: number;

  @Expose()
  batchNumber: string;

  @Expose()
  movementType: string;

  @Expose()
  quantity: number;

  @Expose()
  orderId?: string;

  @Expose()
  reason?: string;

  @Expose()
  metadata?: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  createdBy?: string;
}

export class StockReservationResponseDto {
  @Expose()
  batchNumber: string;

  @Expose()
  quantity: number;

  @Expose()
  orderId: string;

  @Expose()
  reservedAt: Date;

  @Expose()
  expirationDate?: Date;
}

export class BatchTraceabilityResponseDto {
  @Expose()
  @Type(() => StockBatchResponseDto)
  batch: StockBatchResponseDto;

  @Expose()
  stock: {
    id: number;
    productCode: string;
    locationId: number;
  };

  @Expose()
  @Type(() => StockMovementResponseDto)
  movements: StockMovementResponseDto[];

  @Expose()
  traceability: {
    created: Date;
    totalMovements: number;
    currentStatus: string;
    location?: string;
  };
}

export class InventorySummaryResponseDto {
  @Expose()
  locationId?: number;

  @Expose()
  familyId?: number;

  @Expose()
  totalProducts: number;

  @Expose()
  totalStockValue: number;

  @Expose()
  lowStockProducts: number;

  @Expose()
  expiringBatches: number;

  @Expose()
  totalBatches: number;

  @Expose()
  byFamily: {
    familyId: number;
    familyName: string;
    productCount: number;
    stockValue: number;
  }[];

  @Expose()
  generatedAt: Date;
}

// ============================================================================
// FAMILY RESPONSE DTOs
// ============================================================================

export class FamilyResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description?: string;

  @Expose()
  parentFamilyId?: number;

  @Expose()
  isActive: boolean;

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  sortOrder: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy?: string;

  @Expose()
  updatedBy?: string;

  // Exclude sensitive internal data
  @Exclude()
  _domainEvents?: any[];
}

export class FamilyHierarchyResponseDto {
  @Expose()
  @Type(() => FamilyResponseDto)
  family: FamilyResponseDto;

  @Expose()
  @Type(() => FamilyHierarchyResponseDto)
  children: FamilyHierarchyResponseDto[];

  @Expose()
  level: number;

  @Expose()
  hasProducts: boolean;

  @Expose()
  productCount: number;
}

// ============================================================================
// PACKAGE RESPONSE DTOs
// ============================================================================

export class PackageDimensionsResponseDto {
  @Expose()
  length: number;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  unit: string;
}

export class PackageResponseDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description: string;

  @Expose()
  unitOfMeasure: string;

  @Expose()
  quantity: number;

  @Expose()
  @Type(() => PackageDimensionsResponseDto)
  dimensions?: PackageDimensionsResponseDto;

  @Expose()
  weight?: number;

  @Expose()
  isDefault: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  barcodes: string[];

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy?: string;

  @Expose()
  updatedBy?: string;

  // Exclude sensitive internal data
  @Exclude()
  _domainEvents?: any[];
}

// ============================================================================
// ANALYTICS AND REPORTING RESPONSE DTOs
// ============================================================================

export class ProductStatisticsResponseDto {
  @Expose()
  totalProducts: number;

  @Expose()
  activeProducts: number;

  @Expose()
  inactiveProducts: number;

  @Expose()
  productsWithStock: number;

  @Expose()
  productsWithoutStock: number;

  @Expose()
  lowStockProducts: number;

  @Expose()
  byFamily: {
    familyId: number;
    familyName: string;
    productCount: number;
    percentage: number;
  }[];

  @Expose()
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];

  @Expose()
  generatedAt: Date;
}

export class StockStatisticsResponseDto {
  @Expose()
  totalStockRecords: number;

  @Expose()
  totalBatches: number;

  @Expose()
  totalStockValue: number;

  @Expose()
  averageStockValue: number;

  @Expose()
  lowStockAlerts: number;

  @Expose()
  expiringBatches: number;

  @Expose()
  reservedQuantity: number;

  @Expose()
  availableQuantity: number;

  @Expose()
  byLocation: {
    locationId: number;
    stockRecords: number;
    totalValue: number;
    lowStockAlerts: number;
  }[];

  @Expose()
  topProductsByValue: {
    productId: number;
    productCode: string;
    productName: string;
    stockValue: number;
  }[];

  @Expose()
  generatedAt: Date;
}

export class LowStockReportResponseDto {
  @Expose()
  reportDate: Date;

  @Expose()
  locationId?: number;

  @Expose()
  lowStockItems: {
    productId: number;
    productCode: string;
    productName: string;
    locationId: number;
    currentStock: number;
    minimumLevel: number;
    reorderPoint: number;
    urgencyLevel: 'critical' | 'warning' | 'normal';
    daysUntilStockOut?: number;
  }[];

  @Expose()
  summary: {
    totalItems: number;
    criticalItems: number;
    warningItems: number;
    totalReorderValue: number;
  };
}

export class ExpirationReportResponseDto {
  @Expose()
  reportDate: Date;

  @Expose()
  daysAhead: number;

  @Expose()
  locationId?: number;

  @Expose()
  expiringBatches: {
    batchNumber: string;
    productId: number;
    productCode: string;
    productName: string;
    locationId: number;
    quantity: number;
    expirationDate: Date;
    daysUntilExpiration: number;
    urgencyLevel: 'expired' | 'critical' | 'warning' | 'normal';
    estimatedValue: number;
  }[];

  @Expose()
  summary: {
    totalBatches: number;
    expiredBatches: number;
    criticalBatches: number;
    warningBatches: number;
    totalValue: number;
    potentialLoss: number;
  };
}

export class StockMovementReportResponseDto {
  @Expose()
  reportPeriod: {
    fromDate: Date;
    toDate: Date;
  };

  @Expose()
  locationId?: number;

  @Expose()
  productId?: number;

  @Expose()
  movements: {
    date: string;
    movementType: string;
    totalMovements: number;
    totalQuantity: number;
    affectedBatches: number;
  }[];

  @Expose()
  summary: {
    totalMovements: number;
    totalQuantityMoved: number;
    mostActiveProduct: {
      productId: number;
      productCode: string;
      movements: number;
    };
    movementsByType: {
      type: string;
      count: number;
      percentage: number;
    }[];
  };

  @Expose()
  generatedAt: Date;
}

export class BatchUtilizationReportResponseDto {
  @Expose()
  reportPeriod: {
    fromDate: Date;
    toDate: Date;
  };

  @Expose()
  locationId?: number;

  @Expose()
  batchUtilization: {
    batchNumber: string;
    productCode: string;
    createdDate: Date;
    expirationDate?: Date;
    initialQuantity: number;
    consumedQuantity: number;
    remainingQuantity: number;
    utilizationPercentage: number;
    daysInStock: number;
    turnoverRate: number;
    status: 'consumed' | 'partial' | 'expired' | 'active';
  }[];

  @Expose()
  summary: {
    totalBatches: number;
    averageUtilization: number;
    averageTurnover: number;
    fullyConsumedBatches: number;
    expiredBatches: number;
    fifoCompliance: number;
  };

  @Expose()
  generatedAt: Date;
}

// ============================================================================
// ERROR RESPONSE DTOs
// ============================================================================

export class ValidationErrorResponseDto {
  @Expose()
  success: boolean = false;

  @Expose()
  message: string = 'Validation failed';

  @Expose()
  errors: {
    field: string;
    message: string;
    value?: any;
  }[];

  @Expose()
  timestamp: string;

  constructor(errors: { field: string; message: string; value?: any }[]) {
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

export class BusinessErrorResponseDto {
  @Expose()
  success: boolean = false;

  @Expose()
  message: string;

  @Expose()
  errorCode: string;

  @Expose()
  details?: Record<string, any>;

  @Expose()
  timestamp: string;

  constructor(message: string, errorCode: string, details?: Record<string, any>) {
    this.message = message;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// ============================================================================
// OPERATION RESULT DTOs
// ============================================================================

export class OperationResultDto {
  @Expose()
  success: boolean;

  @Expose()
  message?: string;

  @Expose()
  data?: any;

  @Expose()
  timestamp: string;

  constructor(success: boolean, message?: string, data?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class StockReservationResultDto {
  @Expose()
  success: boolean;

  @Expose()
  reservations: {
    batchNumber: string;
    quantity: number;
    expirationDate?: Date;
  }[];

  @Expose()
  totalReserved: number;

  @Expose()
  orderId: string;

  @Expose()
  message?: string;

  @Expose()
  timestamp: string;

  constructor(data: Partial<StockReservationResultDto>) {
    Object.assign(this, data);
    this.timestamp = new Date().toISOString();
  }
}

// ============================================================================
// EXPORT ALL RESPONSE DTOs
// ============================================================================

export const ProductResponseDTOs = [
  ProductResponseDto,
  ProductSpecificationResponseDto,
  ProductMediaResponseDto,
  ProductStockSummaryResponseDto
];

export const StockResponseDTOs = [
  StockResponseDto,
  StockBatchResponseDto,
  StockMovementResponseDto,
  StockReservationResponseDto,
  BatchTraceabilityResponseDto,
  InventorySummaryResponseDto,
  StockReservationResultDto
];

export const FamilyResponseDTOs = [
  FamilyResponseDto,
  FamilyHierarchyResponseDto
];

export const PackageResponseDTOs = [
  PackageResponseDto,
  PackageDimensionsResponseDto
];

export const AnalyticsResponseDTOs = [
  ProductStatisticsResponseDto,
  StockStatisticsResponseDto,
  LowStockReportResponseDto,
  ExpirationReportResponseDto,
  StockMovementReportResponseDto,
  BatchUtilizationReportResponseDto
];

export const CommonResponseDTOs = [
  PaginatedResponseDto,
  ApiResponseDto,
  ValidationErrorResponseDto,
  BusinessErrorResponseDto,
  OperationResultDto
];
