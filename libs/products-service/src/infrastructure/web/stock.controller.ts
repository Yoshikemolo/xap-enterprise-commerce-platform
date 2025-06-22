import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { StockApplicationService } from '../../application/services';
import { 
  CreateStockDto, 
  UpdateStockDto, 
  StockBatchDto,
  ReserveStockDto,
  ReleaseStockReservationDto,
  ConsumeStockDto,
  AdjustStockDto,
  StockFiltersDto, 
  PaginationDto,
  StockResponseDto,
  ApiResponseDto 
} from '../../application/dto';

/**
 * Stock REST Controller
 * 
 * Advanced inventory management API demonstrating:
 * - Batch management with FIFO/FEFO logic
 * - Stock reservations and consumption
 * - Inventory tracking and traceability
 * - Low stock and expiration alerts
 * - Movement history and audit trail
 */
@ApiTags('Stock Management')
@Controller('api/stock')
export class StockController {
  constructor(
    private readonly stockApplicationService: StockApplicationService
  ) {}

  /**
   * Create new stock record for product at location
   */
  @Post()
  @ApiOperation({ summary: 'Create new stock record' })
  @ApiResponse({ status: 201, description: 'Stock created successfully', type: StockResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Stock already exists for this product and location' })
  async createStock(@Body() createStockDto: CreateStockDto): Promise<ApiResponseDto<StockResponseDto>> {
    try {
      const result = await this.stockApplicationService.createStock(createStockDto);
      
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
   * Get stock by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get stock by ID' })
  @ApiParam({ name: 'id', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Stock found', type: StockResponseDto })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  async getStockById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDto<StockResponseDto>> {
    try {
      const result = await this.stockApplicationService.getStockById(id);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get stock by product and location
   */
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock by product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'locationId', required: false, type: Number, description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Stock records found' })
  async getStockByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('locationId') locationId?: number
  ) {
    try {
      return await this.stockApplicationService.getStockByProduct(productId, locationId);
    } catch (error) {
      throw new HttpException('Failed to retrieve stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update stock configuration
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update stock configuration' })
  @ApiParam({ name: 'id', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockDto: UpdateStockDto
  ) {
    try {
      const result = await this.stockApplicationService.updateStock(id, updateStockDto);
      
      if (!result.success) {
        const statusCode = result.errors?.includes('STOCK_NOT_FOUND') 
          ? HttpStatus.NOT_FOUND 
          : HttpStatus.BAD_REQUEST;
        throw new HttpException(result.message, statusCode);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Add batch to stock
   */
  @Post(':id/batches')
  @ApiOperation({ summary: 'Add new batch to stock' })
  @ApiParam({ name: 'id', description: 'Stock ID' })
  @ApiResponse({ status: 201, description: 'Batch added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Batch number already exists' })
  async addBatch(
    @Param('id', ParseIntPipe) stockId: number,
    @Body() batchData: StockBatchDto
  ) {
    try {
      const result = await this.stockApplicationService.addStockBatch(stockId, batchData);
      
      if (!result.success) {
        const statusCode = result.errors?.includes('BATCH_ALREADY_EXISTS') 
          ? HttpStatus.CONFLICT 
          : HttpStatus.BAD_REQUEST;
        throw new HttpException(result.message, statusCode);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to add batch', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Reserve stock with FIFO/FEFO logic
   */
  @Post(':id/reserve')
  @ApiOperation({ summary: 'Reserve stock with FIFO/FEFO logic' })
  @ApiParam({ name: 'id', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Stock reserved successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async reserveStock(
    @Param('id', ParseIntPipe) stockId: number,
    @Body() reserveStockDto: ReserveStockDto
  ) {
    try {
      const result = await this.stockApplicationService.reserveStock(stockId, reserveStockDto);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to reserve stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Release stock reservation
   */
  @Post(':id/release')
  @ApiOperation({ summary: 'Release stock reservation' })
  @ApiParam({ name: 'id', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Reservation released successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async releaseReservation(
    @Param('id', ParseIntPipe) stockId: number,
    @Body() releaseDto: ReleaseStockReservationDto
  ) {
    try {
      const result = await this.stockApplicationService.releaseStockReservation(stockId, releaseDto);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to release reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Consume reserved stock
   */
  @Post(':id/consume')
  @ApiOperation({ summary: 'Consume reserved stock' })
  @ApiParam({ name: 'id', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Stock consumed successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient reservation' })
  async consumeStock(
    @Param('id', ParseIntPipe) stockId: number,
    @Body() consumeDto: ConsumeStockDto
  ) {
    try {
      const result = await this.stockApplicationService.consumeStock(stockId, consumeDto);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to consume stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Adjust stock quantity
   */
  @Post(':id/adjust')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  @ApiParam({ name: 'id', description: 'Stock ID' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async adjustStock(
    @Param('id', ParseIntPipe) stockId: number,
    @Body() adjustDto: AdjustStockDto
  ) {
    try {
      const result = await this.stockApplicationService.adjustStock(stockId, adjustDto);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to adjust stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get available stock quantity
   */
  @Get('product/:productId/available')
  @ApiOperation({ summary: 'Get available stock quantity' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'locationId', required: false, type: Number, description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Available quantity retrieved' })
  async getAvailableStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('locationId') locationId?: number
  ) {
    try {
      return await this.stockApplicationService.getAvailableStock(productId, locationId);
    } catch (error) {
      throw new HttpException('Failed to get available stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get expiring batches
   */
  @Get('alerts/expiring')
  @ApiOperation({ summary: 'Get expiring batches' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Days ahead to check for expiration' })
  @ApiQuery({ name: 'locationId', required: false, type: Number, description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Expiring batches retrieved' })
  async getExpiringBatches(
    @Query('daysAhead') daysAhead: number = 30,
    @Query('locationId') locationId?: number
  ) {
    try {
      return await this.stockApplicationService.getExpiringBatches(daysAhead, locationId);
    } catch (error) {
      throw new HttpException('Failed to get expiring batches', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get batch traceability
   */
  @Get('batch/:batchNumber/traceability')
  @ApiOperation({ summary: 'Get complete batch traceability' })
  @ApiParam({ name: 'batchNumber', description: 'Batch number' })
  @ApiResponse({ status: 200, description: 'Batch traceability retrieved' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async getBatchTraceability(@Param('batchNumber') batchNumber: string) {
    try {
      const result = await this.stockApplicationService.getBatchTraceability(batchNumber);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to get batch traceability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get inventory summary
   */
  @Get('inventory/summary')
  @ApiOperation({ summary: 'Get inventory summary' })
  @ApiQuery({ name: 'locationId', required: false, type: Number, description: 'Location ID' })
  @ApiQuery({ name: 'familyId', required: false, type: Number, description: 'Family ID' })
  @ApiResponse({ status: 200, description: 'Inventory summary retrieved' })
  async getInventorySummary(
    @Query('locationId') locationId?: number,
    @Query('familyId') familyId?: number
  ) {
    try {
      return await this.stockApplicationService.getInventorySummary(locationId, familyId);
    } catch (error) {
      throw new HttpException('Failed to get inventory summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get reserved stock information
   */
  @Get('reservations')
  @ApiOperation({ summary: 'Get reserved stock information' })
  @ApiQuery({ name: 'orderId', required: false, type: String, description: 'Order ID' })
  @ApiQuery({ name: 'productId', required: false, type: Number, description: 'Product ID' })
  @ApiQuery({ name: 'locationId', required: false, type: Number, description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Reserved stock information retrieved' })
  async getReservedStock(
    @Query('orderId') orderId?: string,
    @Query('productId') productId?: number,
    @Query('locationId') locationId?: number
  ) {
    try {
      return await this.stockApplicationService.getReservedStock(orderId, productId, locationId);
    } catch (error) {
      throw new HttpException('Failed to get reserved stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
