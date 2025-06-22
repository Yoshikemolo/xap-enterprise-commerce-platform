// ============================================================================
// REQUEST DTOs - Products Service
// ============================================================================

import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, IsDate, ValidateNested, ArrayNotEmpty, IsPositive, Min, IsNotEmpty, Length, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Common DTOs
export class PaginationDto {
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be greater than 0' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be greater than 0' })
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'SortBy must be a string' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'SortOrder must be ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// ============================================================================
// PRODUCT DTOs
// ============================================================================

export class ProductSpecificationDto {
  @IsString({ message: 'Specification key must be a string' })
  @IsNotEmpty({ message: 'Specification key cannot be empty' })
  key: string;

  @IsString({ message: 'Specification value must be a string' })
  @IsNotEmpty({ message: 'Specification value cannot be empty' })
  value: string;

  @IsOptional()
  @IsString({ message: 'Specification unit must be a string' })
  unit?: string;

  @IsOptional()
  @IsString({ message: 'Specification description must be a string' })
  description?: string;
}

export class ProductMediaDto {
  @IsString({ message: 'Media ID must be a string' })
  @IsNotEmpty({ message: 'Media ID cannot be empty' })
  id: string;

  @IsEnum(['image', 'video', 'document'], { message: 'Media type must be image, video, or document' })
  type: 'image' | 'video' | 'document';

  @IsString({ message: 'Media URL must be a string' })
  @IsNotEmpty({ message: 'Media URL cannot be empty' })
  url: string;

  @IsOptional()
  @IsString({ message: 'Media alt text must be a string' })
  altText?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPrimary must be a boolean' })
  isPrimary?: boolean = false;

  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a number' })
  sortOrder?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateProductDto {
  @IsString({ message: 'Product code must be a string' })
  @IsNotEmpty({ message: 'Product code cannot be empty' })
  @Length(2, 50, { message: 'Product code must be between 2 and 50 characters' })
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Product code must contain only uppercase letters, numbers, underscores, and hyphens' })
  productCode: string;

  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name cannot be empty' })
  @Length(1, 200, { message: 'Product name must be between 1 and 200 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Product description must be a string' })
  @Length(0, 1000, { message: 'Product description cannot exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Family ID must be a number' })
  @IsPositive({ message: 'Family ID must be positive' })
  familyId?: number;

  @IsOptional()
  @IsArray({ message: 'Specifications must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];

  @IsOptional()
  @IsArray({ message: 'Media must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  media?: ProductMediaDto[];

  @IsOptional()
  @IsString({ message: 'Created by must be a string' })
  createdBy?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  @Length(1, 200, { message: 'Product name must be between 1 and 200 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Product description must be a string' })
  @Length(0, 1000, { message: 'Product description cannot exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Family ID must be a number' })
  @IsPositive({ message: 'Family ID must be positive' })
  familyId?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString({ message: 'Updated by must be a string' })
  updatedBy?: string;
}

export class ProductFiltersDto {
  @IsOptional()
  @IsNumber({}, { message: 'Family ID must be a number' })
  @IsPositive({ message: 'Family ID must be positive' })
  @Type(() => Number)
  familyId?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  searchTerm?: string;

  @IsOptional()
  @IsBoolean({ message: 'hasStock must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  hasStock?: boolean;

  @IsOptional()
  @IsArray({ message: 'Product codes must be an array' })
  @ArrayNotEmpty({ message: 'Product codes array cannot be empty' })
  @IsString({ each: true, message: 'Each product code must be a string' })
  productCodes?: string[];

  @IsOptional()
  @IsDate({ message: 'Created after must be a valid date' })
  @Type(() => Date)
  createdAfter?: Date;

  @IsOptional()
  @IsDate({ message: 'Created before must be a valid date' })
  @Type(() => Date)
  createdBefore?: Date;
}

// ============================================================================
// STOCK DTOs
// ============================================================================

export class StockBatchDto {
  @IsString({ message: 'Batch number must be a string' })
  @IsNotEmpty({ message: 'Batch number cannot be empty' })
  batchNumber: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity: number;

  @IsOptional()
  @IsDate({ message: 'Production date must be a valid date' })
  @Type(() => Date)
  productionDate?: Date;

  @IsOptional()
  @IsDate({ message: 'Expiration date must be a valid date' })
  @Type(() => Date)
  expirationDate?: Date;

  @IsOptional()
  @IsString({ message: 'Supplier must be a string' })
  supplier?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Cost must be a number' })
  @IsPositive({ message: 'Cost must be positive' })
  cost?: number;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateStockDto {
  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsPositive({ message: 'Product ID must be positive' })
  productId: number;

  @IsString({ message: 'Product code must be a string' })
  @IsNotEmpty({ message: 'Product code cannot be empty' })
  productCode: string;

  @IsNumber({}, { message: 'Location ID must be a number' })
  @IsPositive({ message: 'Location ID must be positive' })
  locationId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum level must be a number' })
  @Min(0, { message: 'Minimum level cannot be negative' })
  minimumLevel?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum level must be a number' })
  @Min(0, { message: 'Maximum level cannot be negative' })
  maximumLevel?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Reorder point must be a number' })
  @Min(0, { message: 'Reorder point cannot be negative' })
  reorderPoint?: number;

  @IsOptional()
  @IsString({ message: 'Created by must be a string' })
  createdBy?: string;
}

export class UpdateStockDto {
  @IsOptional()
  @IsNumber({}, { message: 'Minimum level must be a number' })
  @Min(0, { message: 'Minimum level cannot be negative' })
  minimumLevel?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum level must be a number' })
  @Min(0, { message: 'Maximum level cannot be negative' })
  maximumLevel?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Reorder point must be a number' })
  @Min(0, { message: 'Reorder point cannot be negative' })
  reorderPoint?: number;

  @IsOptional()
  @IsString({ message: 'Updated by must be a string' })
  updatedBy?: string;
}

export class ReserveStockDto {
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity: number;

  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID cannot be empty' })
  orderId: string;

  @IsOptional()
  @IsBoolean({ message: 'preferFEFO must be a boolean' })
  preferFEFO?: boolean = true;

  @IsOptional()
  @IsString({ message: 'Reserved by must be a string' })
  reservedBy?: string;
}

export class ReleaseStockReservationDto {
  @IsString({ message: 'Batch number must be a string' })
  @IsNotEmpty({ message: 'Batch number cannot be empty' })
  batchNumber: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity: number;

  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID cannot be empty' })
  orderId: string;

  @IsOptional()
  @IsString({ message: 'Released by must be a string' })
  releasedBy?: string;
}

export class ConsumeStockDto {
  @IsString({ message: 'Batch number must be a string' })
  @IsNotEmpty({ message: 'Batch number cannot be empty' })
  batchNumber: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity: number;

  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID cannot be empty' })
  orderId: string;

  @IsOptional()
  @IsString({ message: 'Consumed by must be a string' })
  consumedBy?: string;
}

export class AdjustStockDto {
  @IsString({ message: 'Batch number must be a string' })
  @IsNotEmpty({ message: 'Batch number cannot be empty' })
  batchNumber: string;

  @IsNumber({}, { message: 'New quantity must be a number' })
  @Min(0, { message: 'New quantity cannot be negative' })
  newQuantity: number;

  @IsString({ message: 'Reason must be a string' })
  @IsNotEmpty({ message: 'Reason cannot be empty' })
  @Length(1, 500, { message: 'Reason must be between 1 and 500 characters' })
  reason: string;

  @IsOptional()
  @IsString({ message: 'Adjusted by must be a string' })
  adjustedBy?: string;
}

export class StockFiltersDto {
  @IsOptional()
  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsPositive({ message: 'Product ID must be positive' })
  @Type(() => Number)
  productId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Location ID must be a number' })
  @IsPositive({ message: 'Location ID must be positive' })
  @Type(() => Number)
  locationId?: number;

  @IsOptional()
  @IsString({ message: 'Product code must be a string' })
  productCode?: string;

  @IsOptional()
  @IsBoolean({ message: 'lowStock must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  lowStock?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'hasExpiringBatches must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  hasExpiringBatches?: boolean;

  @IsOptional()
  @IsArray({ message: 'Batch numbers must be an array' })
  @IsString({ each: true, message: 'Each batch number must be a string' })
  batchNumbers?: string[];

  @IsOptional()
  @IsDate({ message: 'Expiring before must be a valid date' })
  @Type(() => Date)
  expiringBefore?: Date;
}

// ============================================================================
// FAMILY DTOs
// ============================================================================

export class CreateFamilyDto {
  @IsString({ message: 'Family name must be a string' })
  @IsNotEmpty({ message: 'Family name cannot be empty' })
  @Length(1, 100, { message: 'Family name must be between 1 and 100 characters' })
  name: string;

  @IsString({ message: 'Family code must be a string' })
  @IsNotEmpty({ message: 'Family code cannot be empty' })
  @Length(2, 20, { message: 'Family code must be between 2 and 20 characters' })
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Family code must contain only uppercase letters, numbers, underscores, and hyphens' })
  code: string;

  @IsOptional()
  @IsString({ message: 'Family description must be a string' })
  @Length(0, 500, { message: 'Family description cannot exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Parent family ID must be a number' })
  @IsPositive({ message: 'Parent family ID must be positive' })
  parentFamilyId?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0, { message: 'Sort order cannot be negative' })
  sortOrder?: number;

  @IsOptional()
  @IsString({ message: 'Created by must be a string' })
  createdBy?: string;
}

export class UpdateFamilyDto {
  @IsOptional()
  @IsString({ message: 'Family name must be a string' })
  @Length(1, 100, { message: 'Family name must be between 1 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Family description must be a string' })
  @Length(0, 500, { message: 'Family description cannot exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Parent family ID must be a number' })
  @IsPositive({ message: 'Parent family ID must be positive' })
  parentFamilyId?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0, { message: 'Sort order cannot be negative' })
  sortOrder?: number;

  @IsOptional()
  @IsString({ message: 'Updated by must be a string' })
  updatedBy?: string;
}

export class FamilyFiltersDto {
  @IsOptional()
  @IsNumber({}, { message: 'Parent family ID must be a number' })
  @IsPositive({ message: 'Parent family ID must be positive' })
  @Type(() => Number)
  parentFamilyId?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsArray({ message: 'Codes must be an array' })
  @IsString({ each: true, message: 'Each code must be a string' })
  codes?: string[];

  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  searchTerm?: string;
}

// ============================================================================
// PACKAGE DTOs
// ============================================================================

export class PackageDimensionsDto {
  @IsNumber({}, { message: 'Length must be a number' })
  @IsPositive({ message: 'Length must be positive' })
  length: number;

  @IsNumber({}, { message: 'Width must be a number' })
  @IsPositive({ message: 'Width must be positive' })
  width: number;

  @IsNumber({}, { message: 'Height must be a number' })
  @IsPositive({ message: 'Height must be positive' })
  height: number;

  @IsOptional()
  @IsString({ message: 'Unit must be a string' })
  unit?: string = 'cm';
}

export class CreatePackageDto {
  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsPositive({ message: 'Product ID must be positive' })
  productId: number;

  @IsString({ message: 'Package name must be a string' })
  @IsNotEmpty({ message: 'Package name cannot be empty' })
  @Length(1, 100, { message: 'Package name must be between 1 and 100 characters' })
  name: string;

  @IsString({ message: 'Package code must be a string' })
  @IsNotEmpty({ message: 'Package code cannot be empty' })
  @Length(2, 30, { message: 'Package code must be between 2 and 30 characters' })
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Package code must contain only uppercase letters, numbers, underscores, and hyphens' })
  code: string;

  @IsString({ message: 'Package description must be a string' })
  @IsNotEmpty({ message: 'Package description cannot be empty' })
  @Length(1, 200, { message: 'Package description must be between 1 and 200 characters' })
  description: string;

  @IsString({ message: 'Unit of measure must be a string' })
  @IsNotEmpty({ message: 'Unit of measure cannot be empty' })
  unitOfMeasure: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PackageDimensionsDto)
  dimensions?: PackageDimensionsDto;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be positive' })
  weight?: number;

  @IsOptional()
  @IsBoolean({ message: 'isDefault must be a boolean' })
  isDefault?: boolean = false;

  @IsOptional()
  @IsArray({ message: 'Barcodes must be an array' })
  @IsString({ each: true, message: 'Each barcode must be a string' })
  barcodes?: string[];

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString({ message: 'Created by must be a string' })
  createdBy?: string;
}

export class UpdatePackageDto {
  @IsOptional()
  @IsString({ message: 'Package name must be a string' })
  @Length(1, 100, { message: 'Package name must be between 1 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Package description must be a string' })
  @Length(1, 200, { message: 'Package description must be between 1 and 200 characters' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Unit of measure must be a string' })
  unitOfMeasure?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PackageDimensionsDto)
  dimensions?: PackageDimensionsDto;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be positive' })
  weight?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString({ message: 'Updated by must be a string' })
  updatedBy?: string;
}

export class PackageFiltersDto {
  @IsOptional()
  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsPositive({ message: 'Product ID must be positive' })
  @Type(() => Number)
  productId?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isDefault must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  isDefault?: boolean;

  @IsOptional()
  @IsString({ message: 'Unit of measure must be a string' })
  unitOfMeasure?: string;

  @IsOptional()
  @IsArray({ message: 'Codes must be an array' })
  @IsString({ each: true, message: 'Each code must be a string' })
  codes?: string[];

  @IsOptional()
  @IsString({ message: 'Barcode must be a string' })
  barcode?: string;
}

export class AddPackageBarcodeDto {
  @IsString({ message: 'Barcode must be a string' })
  @IsNotEmpty({ message: 'Barcode cannot be empty' })
  @Length(1, 50, { message: 'Barcode must be between 1 and 50 characters' })
  barcode: string;

  @IsOptional()
  @IsString({ message: 'Added by must be a string' })
  addedBy?: string;
}

export class RemovePackageBarcodeDto {
  @IsString({ message: 'Barcode must be a string' })
  @IsNotEmpty({ message: 'Barcode cannot be empty' })
  barcode: string;

  @IsOptional()
  @IsString({ message: 'Removed by must be a string' })
  removedBy?: string;
}

// ============================================================================
// EXPORT ALL DTOs
// ============================================================================

export const ProductDTOs = [
  CreateProductDto,
  UpdateProductDto,
  ProductFiltersDto,
  ProductSpecificationDto,
  ProductMediaDto
];

export const StockDTOs = [
  CreateStockDto,
  UpdateStockDto,
  StockBatchDto,
  ReserveStockDto,
  ReleaseStockReservationDto,
  ConsumeStockDto,
  AdjustStockDto,
  StockFiltersDto
];

export const FamilyDTOs = [
  CreateFamilyDto,
  UpdateFamilyDto,
  FamilyFiltersDto
];

export const PackageDTOs = [
  CreatePackageDto,
  UpdatePackageDto,
  PackageFiltersDto,
  PackageDimensionsDto,
  AddPackageBarcodeDto,
  RemovePackageBarcodeDto
];

export const CommonDTOs = [
  PaginationDto
];

// Re-export Response DTOs
export * from './response.dto';
