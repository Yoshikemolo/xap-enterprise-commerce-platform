import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { ProductApplicationService } from '../../application/services';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductFiltersDto, 
  PaginationDto,
  ProductResponseDto,
  ApiResponseDto 
} from '../../application/dto';

/**
 * Products REST Controller
 * 
 * Basic REST API for product management demonstrating:
 * - CRUD operations with productCode validation
 * - Search and filtering capabilities
 * - Pagination support
 * - Proper error handling
 * - API documentation with Swagger
 */
@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly productApplicationService: ProductApplicationService
  ) {}

  /**
   * Create a new product
   */
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - product code already exists' })
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<ApiResponseDto<ProductResponseDto>> {
    try {
      const result = await this.productApplicationService.createProduct(createProductDto);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get all products with optional filtering and pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'familyId', required: false, type: Number, description: 'Filter by family ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(
    @Query() filters: ProductFiltersDto,
    @Query() pagination: PaginationDto
  ) {
    try {
      return await this.productApplicationService.getProducts(filters, pagination);
    } catch (error) {
      throw new HttpException('Failed to retrieve products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get product by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDto<ProductResponseDto>> {
    try {
      const result = await this.productApplicationService.getProductById(id);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get product by product code
   */
  @Get('code/:productCode')
  @ApiOperation({ summary: 'Get product by product code' })
  @ApiParam({ name: 'productCode', description: 'Product code' })
  @ApiResponse({ status: 200, description: 'Product found', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductByCode(@Param('productCode') productCode: string): Promise<ApiResponseDto<ProductResponseDto>> {
    try {
      const result = await this.productApplicationService.getProductByCode(productCode);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update product
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    try {
      const result = await this.productApplicationService.updateProduct(id, updateProductDto);
      
      if (!result.success) {
        const statusCode = result.errors?.includes('PRODUCT_NOT_FOUND') 
          ? HttpStatus.NOT_FOUND 
          : HttpStatus.BAD_REQUEST;
        throw new HttpException(result.message, statusCode);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete product
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete product with active stock' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.productApplicationService.deleteProduct(id);
      
      if (!result.success) {
        const statusCode = result.errors?.includes('PRODUCT_NOT_FOUND') 
          ? HttpStatus.NOT_FOUND 
          : HttpStatus.BAD_REQUEST;
        throw new HttpException(result.message, statusCode);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Activate product
   */
  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product activated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async activateProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productApplicationService.activateProduct(id);
    } catch (error) {
      throw new HttpException('Failed to activate product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deactivate product
   */
  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deactivateProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productApplicationService.deactivateProduct(id);
    } catch (error) {
      throw new HttpException('Failed to deactivate product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Search products
   */
  @Get('search/:searchTerm')
  @ApiOperation({ summary: 'Search products' })
  @ApiParam({ name: 'searchTerm', description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchProducts(
    @Param('searchTerm') searchTerm: string,
    @Query() filters: ProductFiltersDto,
    @Query() pagination: PaginationDto
  ) {
    try {
      return await this.productApplicationService.searchProducts(searchTerm, filters, pagination);
    } catch (error) {
      throw new HttpException('Search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get product stock summary
   */
  @Get(':id/stock-summary')
  @ApiOperation({ summary: 'Get product stock summary' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Stock summary retrieved' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductStockSummary(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.productApplicationService.getProductStockSummary(id);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get stock summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get products with low stock
   */
  @Get('alerts/low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiQuery({ name: 'locationId', required: false, type: Number, description: 'Filter by location' })
  @ApiResponse({ status: 200, description: 'Low stock products retrieved' })
  async getProductsWithLowStock(@Query('locationId') locationId?: number) {
    try {
      return await this.productApplicationService.getProductsWithLowStock(locationId);
    } catch (error) {
      throw new HttpException('Failed to get low stock products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
