import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Import Commands
import {
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
  ActivateProductCommand,
  DeactivateProductCommand,
  AddProductSpecificationCommand,
  RemoveProductSpecificationCommand,
  AddProductMediaCommand,
  RemoveProductMediaCommand,
  SetPrimaryProductMediaCommand
} from '../commands';

// Import Queries
import {
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
  GetProductsByCodesQuery,
  PaginatedResult
} from '../queries';

// Import DTOs
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFiltersDto,
  PaginationDto,
  ProductSpecificationDto,
  ProductMediaDto,
  ProductResponseDto,
  ProductStockSummaryResponseDto,
  ApiResponseDto,
  OperationResultDto
} from '../dto';

import { Product } from '../../domain/entities';

/**
 * Product Application Service
 * 
 * Orchestrates product-related operations by coordinating Commands and Queries.
 * Provides a unified interface for product management operations.
 * 
 * Features:
 * - Product CRUD operations with productCode validation
 * - Specification and media management
 * - Product activation/deactivation lifecycle
 * - Advanced search and filtering capabilities
 * - Stock summary integration
 * - Business rule enforcement
 */
@Injectable()
export class ProductApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ============================================================================
  // PRODUCT CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new product with validation
   */
  async createProduct(createProductDto: CreateProductDto): Promise<ApiResponseDto<ProductResponseDto>> {
    try {
      // Check if product code already exists
      const existingProduct = await this.queryBus.execute(
        new GetProductByCodeQuery(createProductDto.productCode)
      );

      if (existingProduct) {
        return new ApiResponseDto({
          success: false,
          message: `Product with code '${createProductDto.productCode}' already exists`,
          errors: ['PRODUCT_CODE_ALREADY_EXISTS']
        });
      }

      // Create the product
      const product: Product = await this.commandBus.execute(
        new CreateProductCommand(
          createProductDto.productCode,
          createProductDto.name,
          createProductDto.description,
          createProductDto.familyId,
          createProductDto.specifications,
          createProductDto.media,
          createProductDto.createdBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Product created successfully',
        data: this.mapToProductResponse(product)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to create product',
        errors: ['PRODUCT_CREATION_FAILED']
      });
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: number, updateProductDto: UpdateProductDto): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify product exists
      const product = await this.queryBus.execute(new GetProductByIdQuery(productId));
      if (!product) {
        return new ApiResponseDto({
          success: false,
          message: `Product with ID ${productId} not found`,
          errors: ['PRODUCT_NOT_FOUND']
        });
      }

      // Update the product
      await this.commandBus.execute(
        new UpdateProductCommand(
          productId,
          updateProductDto.name,
          updateProductDto.description,
          updateProductDto.familyId,
          updateProductDto.metadata,
          updateProductDto.updatedBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Product updated successfully',
        data: new OperationResultDto(true, 'Product updated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to update product',
        errors: ['PRODUCT_UPDATE_FAILED']
      });
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: number, deletedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify product exists
      const product = await this.queryBus.execute(new GetProductByIdQuery(productId));
      if (!product) {
        return new ApiResponseDto({
          success: false,
          message: `Product with ID ${productId} not found`,
          errors: ['PRODUCT_NOT_FOUND']
        });
      }

      // Check if product has active stock (business rule)
      const stockSummary = await this.queryBus.execute(new GetProductStockSummaryQuery(productId));
      const hasActiveStock = stockSummary.stockSummary.some(stock => stock.totalQuantity > 0);
      
      if (hasActiveStock) {
        return new ApiResponseDto({
          success: false,
          message: 'Cannot delete product with active stock',
          errors: ['PRODUCT_HAS_ACTIVE_STOCK']
        });
      }

      // Delete the product
      await this.commandBus.execute(new DeleteProductCommand(productId, deletedBy));

      return new ApiResponseDto({
        success: true,
        message: 'Product deleted successfully',
        data: new OperationResultDto(true, 'Product deleted successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to delete product',
        errors: ['PRODUCT_DELETE_FAILED']
      });
    }
  }

  // ============================================================================
  // PRODUCT LIFECYCLE OPERATIONS
  // ============================================================================

  /**
   * Activate a product
   */
  async activateProduct(productId: number, activatedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(new ActivateProductCommand(productId, activatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Product activated successfully',
        data: new OperationResultDto(true, 'Product activated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to activate product',
        errors: ['PRODUCT_ACTIVATION_FAILED']
      });
    }
  }

  /**
   * Deactivate a product
   */
  async deactivateProduct(productId: number, deactivatedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(new DeactivateProductCommand(productId, deactivatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Product deactivated successfully',
        data: new OperationResultDto(true, 'Product deactivated successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to deactivate product',
        errors: ['PRODUCT_DEACTIVATION_FAILED']
      });
    }
  }

  // ============================================================================
  // PRODUCT SPECIFICATIONS MANAGEMENT
  // ============================================================================

  /**
   * Add specification to product
   */
  async addProductSpecification(
    productId: number, 
    specification: ProductSpecificationDto, 
    updatedBy?: string
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(
        new AddProductSpecificationCommand(productId, specification, updatedBy)
      );
      
      return new ApiResponseDto({
        success: true,
        message: 'Product specification added successfully',
        data: new OperationResultDto(true, 'Specification added successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to add product specification',
        errors: ['SPECIFICATION_ADD_FAILED']
      });
    }
  }

  /**
   * Remove specification from product
   */
  async removeProductSpecification(
    productId: number, 
    specificationKey: string, 
    updatedBy?: string
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(
        new RemoveProductSpecificationCommand(productId, specificationKey, updatedBy)
      );
      
      return new ApiResponseDto({
        success: true,
        message: 'Product specification removed successfully',
        data: new OperationResultDto(true, 'Specification removed successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to remove product specification',
        errors: ['SPECIFICATION_REMOVE_FAILED']
      });
    }
  }

  /**
   * Get product specifications
   */
  async getProductSpecifications(productId: number): Promise<ApiResponseDto<ProductSpecificationDto[]>> {
    try {
      const specifications = await this.queryBus.execute(new GetProductSpecificationsQuery(productId));
      
      return new ApiResponseDto({
        success: true,
        data: specifications
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get product specifications',
        errors: ['SPECIFICATIONS_FETCH_FAILED']
      });
    }
  }

  // ============================================================================
  // PRODUCT MEDIA MANAGEMENT
  // ============================================================================

  /**
   * Add media to product
   */
  async addProductMedia(
    productId: number, 
    media: ProductMediaDto, 
    updatedBy?: string
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(new AddProductMediaCommand(productId, media, updatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Product media added successfully',
        data: new OperationResultDto(true, 'Media added successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to add product media',
        errors: ['MEDIA_ADD_FAILED']
      });
    }
  }

  /**
   * Remove media from product
   */
  async removeProductMedia(
    productId: number, 
    mediaId: string, 
    updatedBy?: string
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(new RemoveProductMediaCommand(productId, mediaId, updatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Product media removed successfully',
        data: new OperationResultDto(true, 'Media removed successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to remove product media',
        errors: ['MEDIA_REMOVE_FAILED']
      });
    }
  }

  /**
   * Set primary media for product
   */
  async setPrimaryProductMedia(
    productId: number, 
    mediaId: string, 
    updatedBy?: string
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      await this.commandBus.execute(new SetPrimaryProductMediaCommand(productId, mediaId, updatedBy));
      
      return new ApiResponseDto({
        success: true,
        message: 'Primary product media set successfully',
        data: new OperationResultDto(true, 'Primary media set successfully')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to set primary product media',
        errors: ['PRIMARY_MEDIA_SET_FAILED']
      });
    }
  }

  /**
   * Get product media
   */
  async getProductMedia(productId: number): Promise<ApiResponseDto<ProductMediaDto[]>> {
    try {
      const media = await this.queryBus.execute(new GetProductMediaQuery(productId));
      
      return new ApiResponseDto({
        success: true,
        data: media
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get product media',
        errors: ['MEDIA_FETCH_FAILED']
      });
    }
  }

  // ============================================================================
  // PRODUCT QUERY OPERATIONS
  // ============================================================================

  /**
   * Get product by ID
   */
  async getProductById(productId: number): Promise<ApiResponseDto<ProductResponseDto>> {
    try {
      const product = await this.queryBus.execute(new GetProductByIdQuery(productId));
      
      if (!product) {
        return new ApiResponseDto({
          success: false,
          message: `Product with ID ${productId} not found`,
          errors: ['PRODUCT_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToProductResponse(product)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get product',
        errors: ['PRODUCT_FETCH_FAILED']
      });
    }
  }

  /**
   * Get product by code
   */
  async getProductByCode(productCode: string): Promise<ApiResponseDto<ProductResponseDto>> {
    try {
      const product = await this.queryBus.execute(new GetProductByCodeQuery(productCode));
      
      if (!product) {
        return new ApiResponseDto({
          success: false,
          message: `Product with code '${productCode}' not found`,
          errors: ['PRODUCT_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToProductResponse(product)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get product',
        errors: ['PRODUCT_FETCH_FAILED']
      });
    }
  }

  /**
   * Get products with filtering and pagination
   */
  async getProducts(
    filters?: ProductFiltersDto, 
    pagination?: PaginationDto
  ): Promise<ApiResponseDto<PaginatedResult<ProductResponseDto>>> {
    try {
      const result = await this.queryBus.execute(new GetProductsQuery(filters, pagination));
      
      const mappedResult = {
        ...result,
        data: result.data.map(product => this.mapToProductResponse(product))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get products',
        errors: ['PRODUCTS_FETCH_FAILED']
      });
    }
  }

  /**
   * Search products
   */
  async searchProducts(
    searchTerm: string,
    filters?: ProductFiltersDto,
    pagination?: PaginationDto
  ): Promise<ApiResponseDto<PaginatedResult<ProductResponseDto>>> {
    try {
      const result = await this.queryBus.execute(
        new SearchProductsQuery(searchTerm, filters, pagination)
      );
      
      const mappedResult = {
        ...result,
        data: result.data.map(product => this.mapToProductResponse(product))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to search products',
        errors: ['PRODUCT_SEARCH_FAILED']
      });
    }
  }

  /**
   * Get products by family
   */
  async getProductsByFamily(
    familyId: number,
    includeSubfamilies: boolean = false,
    pagination?: PaginationDto
  ): Promise<ApiResponseDto<PaginatedResult<ProductResponseDto>>> {
    try {
      const result = await this.queryBus.execute(
        new GetProductsByFamilyQuery(familyId, includeSubfamilies, pagination)
      );
      
      const mappedResult = {
        ...result,
        data: result.data.map(product => this.mapToProductResponse(product))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get products by family',
        errors: ['PRODUCTS_BY_FAMILY_FETCH_FAILED']
      });
    }
  }

  /**
   * Get active products
   */
  async getActiveProducts(pagination?: PaginationDto): Promise<ApiResponseDto<PaginatedResult<ProductResponseDto>>> {
    try {
      const result = await this.queryBus.execute(new GetActiveProductsQuery(pagination));
      
      const mappedResult = {
        ...result,
        data: result.data.map(product => this.mapToProductResponse(product))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get active products',
        errors: ['ACTIVE_PRODUCTS_FETCH_FAILED']
      });
    }
  }

  /**
   * Get product stock summary
   */
  async getProductStockSummary(productId: number): Promise<ApiResponseDto<ProductStockSummaryResponseDto>> {
    try {
      const stockSummary = await this.queryBus.execute(new GetProductStockSummaryQuery(productId));
      
      return new ApiResponseDto({
        success: true,
        data: stockSummary
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get product stock summary',
        errors: ['STOCK_SUMMARY_FETCH_FAILED']
      });
    }
  }

  /**
   * Get products with low stock
   */
  async getProductsWithLowStock(locationId?: number): Promise<ApiResponseDto<any[]>> {
    try {
      const lowStockProducts = await this.queryBus.execute(
        new GetProductsWithLowStockQuery(locationId)
      );
      
      return new ApiResponseDto({
        success: true,
        data: lowStockProducts
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get products with low stock',
        errors: ['LOW_STOCK_PRODUCTS_FETCH_FAILED']
      });
    }
  }

  /**
   * Get products by codes (bulk operation)
   */
  async getProductsByCodes(productCodes: string[]): Promise<ApiResponseDto<ProductResponseDto[]>> {
    try {
      const products = await this.queryBus.execute(new GetProductsByCodesQuery(productCodes));
      
      const mappedProducts = products.map(product => this.mapToProductResponse(product));

      return new ApiResponseDto({
        success: true,
        data: mappedProducts
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get products by codes',
        errors: ['PRODUCTS_BY_CODES_FETCH_FAILED']
      });
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Map domain Product entity to ProductResponseDto
   */
  private mapToProductResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      description: product.description,
      familyId: product.familyId,
      isActive: product.isActive,
      specifications: product.specifications || [],
      media: product.media || [],
      metadata: product.metadata || {},
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
      // Note: createdBy and updatedBy properties don't exist in Product entity
      // createdBy: product.createdBy,
      // updatedBy: product.updatedBy
    } as ProductResponseDto;
  }
}
