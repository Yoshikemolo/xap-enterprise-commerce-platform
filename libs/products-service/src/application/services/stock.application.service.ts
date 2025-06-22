import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Import Commands
import {
  CreateStockCommand,
  UpdateStockCommand,
  AddStockBatchCommand,
  UpdateStockBatchCommand,
  ReserveStockCommand,
  ReleaseStockReservationCommand,
  ConsumeStockCommand,
  AdjustStockCommand
} from '../commands';

// Import Queries
import {
  GetStockByIdQuery,
  GetStockByProductQuery,
  GetStockByLocationQuery,
  GetBatchByNumberQuery,
  GetBatchesByNumberQuery,
  GetExpiringBatchesQuery,
  GetAvailableStockQuery,
  GetReservedStockQuery,
  GetInventorySummaryQuery,
  GetBatchTraceabilityQuery,
  PaginatedResult
} from '../queries';

// Import DTOs
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
  BatchTraceabilityResponseDto,
  InventorySummaryResponseDto,
  StockReservationResultDto,
  ApiResponseDto,
  OperationResultDto
} from '../dto';

import { Stock } from '../../domain/entities';

/**
 * Stock Application Service
 * 
 * Orchestrates stock-related operations with advanced batch management.
 * Provides comprehensive inventory control with FIFO/FEFO logic.
 * 
 * Features:
 * - Complete batch traceability system
 * - FIFO/FEFO automatic rotation logic
 * - Stock reservations with expiration
 * - Real-time stock level monitoring
 * - Expiration date management
 * - Advanced inventory analytics
 * - Comprehensive audit trail
 */
@Injectable()
export class StockApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ============================================================================
  // STOCK MANAGEMENT OPERATIONS
  // ============================================================================

  /**
   * Create new stock record for a product at a location
   */
  async createStock(createStockDto: CreateStockDto): Promise<ApiResponseDto<StockResponseDto>> {
    try {
      // Check if stock already exists for this product and location
      const existingStock = await this.queryBus.execute(
        new GetStockByProductQuery(createStockDto.productId, createStockDto.locationId)
      );

      if (existingStock && existingStock.length > 0) {
        return new ApiResponseDto({
          success: false,
          message: `Stock already exists for product ${createStockDto.productCode} at location ${createStockDto.locationId}`,
          errors: ['STOCK_ALREADY_EXISTS']
        });
      }

      // Create the stock
      const stock: Stock = await this.commandBus.execute(
        new CreateStockCommand(
          createStockDto.productId,
          createStockDto.productCode,
          createStockDto.locationId,
          createStockDto.minimumLevel,
          createStockDto.maximumLevel,
          createStockDto.reorderPoint,
          createStockDto.createdBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Stock created successfully',
        data: this.mapToStockResponse(stock)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to create stock',
        errors: ['STOCK_CREATION_FAILED']
      });
    }
  }

  /**
   * Update stock configuration (levels and alerts)
   */
  async updateStock(stockId: number, updateStockDto: UpdateStockDto): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify stock exists
      const stock = await this.queryBus.execute(new GetStockByIdQuery(stockId));
      if (!stock) {
        return new ApiResponseDto({
          success: false,
          message: `Stock with ID ${stockId} not found`,
          errors: ['STOCK_NOT_FOUND']
        });
      }

      // Validate business rules for levels
      if (updateStockDto.minimumLevel !== undefined && updateStockDto.maximumLevel !== undefined) {
        if (updateStockDto.minimumLevel >= updateStockDto.maximumLevel) {
          return new ApiResponseDto({
            success: false,
            message: 'Minimum level must be less than maximum level',
            errors: ['INVALID_STOCK_LEVELS']
          });
        }
      }

      // Update the stock
      await this.commandBus.execute(
        new UpdateStockCommand(
          stockId,
          updateStockDto.minimumLevel,
          updateStockDto.maximumLevel,
          updateStockDto.reorderPoint,
          updateStockDto.updatedBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: 'Stock updated successfully',
        data: new OperationResultDto(true, 'Stock configuration updated')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to update stock',
        errors: ['STOCK_UPDATE_FAILED']
      });
    }
  }

  // ============================================================================
  // BATCH MANAGEMENT OPERATIONS
  // ============================================================================

  /**
   * Add new batch to stock with validation
   */
  async addStockBatch(stockId: number, batchData: StockBatchDto, addedBy?: string): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify stock exists
      const stock = await this.queryBus.execute(new GetStockByIdQuery(stockId));
      if (!stock) {
        return new ApiResponseDto({
          success: false,
          message: `Stock with ID ${stockId} not found`,
          errors: ['STOCK_NOT_FOUND']
        });
      }

      // Check if batch number already exists
      const existingBatch = await this.queryBus.execute(
        new GetBatchByNumberQuery(batchData.batchNumber)
      );
      
      if (existingBatch) {
        return new ApiResponseDto({
          success: false,
          message: `Batch ${batchData.batchNumber} already exists`,
          errors: ['BATCH_ALREADY_EXISTS']
        });
      }

      // Validate expiration date
      if (batchData.expirationDate && batchData.expirationDate <= new Date()) {
        return new ApiResponseDto({
          success: false,
          message: 'Expiration date cannot be in the past',
          errors: ['INVALID_EXPIRATION_DATE']
        });
      }

      // Add the batch
      await this.commandBus.execute(
        new AddStockBatchCommand(stockId, batchData, addedBy)
      );

      return new ApiResponseDto({
        success: true,
        message: `Batch ${batchData.batchNumber} added successfully`,
        data: new OperationResultDto(true, 'Batch added to stock')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to add stock batch',
        errors: ['BATCH_ADD_FAILED']
      });
    }
  }

  /**
   * Update existing batch information
   */
  async updateStockBatch(
    stockId: number,
    batchNumber: string,
    updates: Partial<StockBatchDto>,
    updatedBy?: string
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify batch exists
      const batchInfo = await this.queryBus.execute(new GetBatchByNumberQuery(batchNumber));
      if (!batchInfo || batchInfo.stock.id !== stockId) {
        return new ApiResponseDto({
          success: false,
          message: `Batch ${batchNumber} not found in stock ${stockId}`,
          errors: ['BATCH_NOT_FOUND']
        });
      }

      // Validate expiration date if provided
      if (updates.expirationDate && updates.expirationDate <= new Date()) {
        return new ApiResponseDto({
          success: false,
          message: 'Expiration date cannot be in the past',
          errors: ['INVALID_EXPIRATION_DATE']
        });
      }

      // Update the batch
      await this.commandBus.execute(
        new UpdateStockBatchCommand(stockId, batchNumber, updates, updatedBy)
      );

      return new ApiResponseDto({
        success: true,
        message: `Batch ${batchNumber} updated successfully`,
        data: new OperationResultDto(true, 'Batch updated')
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to update stock batch',
        errors: ['BATCH_UPDATE_FAILED']
      });
    }
  }

  // ============================================================================
  // STOCK RESERVATION OPERATIONS
  // ============================================================================

  /**
   * Reserve stock with FIFO/FEFO logic
   */
  async reserveStock(stockId: number, reserveStockDto: ReserveStockDto): Promise<ApiResponseDto<StockReservationResultDto>> {
    try {
      // Verify stock exists and has available quantity
      const stock = await this.queryBus.execute(new GetStockByIdQuery(stockId));
      if (!stock) {
        return new ApiResponseDto({
          success: false,
          message: `Stock with ID ${stockId} not found`,
          errors: ['STOCK_NOT_FOUND']
        });
      }

      if (stock.availableQuantity < reserveStockDto.quantity) {
        return new ApiResponseDto({
          success: false,
          message: `Insufficient stock. Available: ${stock.availableQuantity}, Requested: ${reserveStockDto.quantity}`,
          errors: ['INSUFFICIENT_STOCK']
        });
      }

      // Execute reservation with FIFO/FEFO logic
      const reservations = await this.commandBus.execute(
        new ReserveStockCommand(
          stockId,
          reserveStockDto.quantity,
          reserveStockDto.orderId,
          reserveStockDto.preferFEFO,
          reserveStockDto.reservedBy
        )
      );

      const totalReserved = reservations.reduce((sum, res) => sum + res.quantity, 0);

      return new ApiResponseDto({
        success: true,
        message: `Stock reserved successfully using ${reserveStockDto.preferFEFO ? 'FEFO' : 'FIFO'} logic`,
        data: new StockReservationResultDto({
          success: true,
          reservations: reservations,
          totalReserved: totalReserved,
          orderId: reserveStockDto.orderId,
          message: `Reserved ${totalReserved} units across ${reservations.length} batch(es)`
        })
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to reserve stock',
        errors: ['STOCK_RESERVATION_FAILED']
      });
    }
  }

  /**
   * Release stock reservation
   */
  async releaseStockReservation(
    stockId: number,
    releaseDto: ReleaseStockReservationDto
  ): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify the reservation exists
      const reservedStock = await this.queryBus.execute(
        new GetReservedStockQuery(releaseDto.orderId, undefined, undefined)
      );

      const hasReservation = reservedStock.some(
        res => res.batchNumber === releaseDto.batchNumber && res.orderId === releaseDto.orderId
      );

      if (!hasReservation) {
        return new ApiResponseDto({
          success: false,
          message: `No reservation found for batch ${releaseDto.batchNumber} and order ${releaseDto.orderId}`,
          errors: ['RESERVATION_NOT_FOUND']
        });
      }

      // Release the reservation
      await this.commandBus.execute(
        new ReleaseStockReservationCommand(
          stockId,
          releaseDto.batchNumber,
          releaseDto.quantity,
          releaseDto.orderId,
          releaseDto.releasedBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: `Stock reservation released successfully`,
        data: new OperationResultDto(true, `Released ${releaseDto.quantity} units from batch ${releaseDto.batchNumber}`)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to release stock reservation',
        errors: ['RESERVATION_RELEASE_FAILED']
      });
    }
  }

  /**
   * Consume reserved stock (fulfill order)
   */
  async consumeStock(stockId: number, consumeDto: ConsumeStockDto): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify the reservation exists
      const reservedStock = await this.queryBus.execute(
        new GetReservedStockQuery(consumeDto.orderId, undefined, undefined)
      );

      const reservation = reservedStock.find(
        res => res.batchNumber === consumeDto.batchNumber && res.orderId === consumeDto.orderId
      );

      if (!reservation) {
        return new ApiResponseDto({
          success: false,
          message: `No reservation found for batch ${consumeDto.batchNumber} and order ${consumeDto.orderId}`,
          errors: ['RESERVATION_NOT_FOUND']
        });
      }

      if (reservation.quantity < consumeDto.quantity) {
        return new ApiResponseDto({
          success: false,
          message: `Cannot consume more than reserved. Reserved: ${reservation.quantity}, Requested: ${consumeDto.quantity}`,
          errors: ['INSUFFICIENT_RESERVATION']
        });
      }

      // Consume the stock
      await this.commandBus.execute(
        new ConsumeStockCommand(
          stockId,
          consumeDto.batchNumber,
          consumeDto.quantity,
          consumeDto.orderId,
          consumeDto.consumedBy
        )
      );

      return new ApiResponseDto({
        success: true,
        message: `Stock consumed successfully`,
        data: new OperationResultDto(true, `Consumed ${consumeDto.quantity} units from batch ${consumeDto.batchNumber}`)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to consume stock',
        errors: ['STOCK_CONSUMPTION_FAILED']
      });
    }
  }

  /**
   * Adjust stock quantity (inventory adjustments)
   */
  async adjustStock(stockId: number, adjustDto: AdjustStockDto): Promise<ApiResponseDto<OperationResultDto>> {
    try {
      // Verify batch exists
      const batchInfo = await this.queryBus.execute(new GetBatchByNumberQuery(adjustDto.batchNumber));
      if (!batchInfo || batchInfo.stock.id !== stockId) {
        return new ApiResponseDto({
          success: false,
          message: `Batch ${adjustDto.batchNumber} not found in stock ${stockId}`,
          errors: ['BATCH_NOT_FOUND']
        });
      }

      // Execute adjustment
      await this.commandBus.execute(
        new AdjustStockCommand(
          stockId,
          adjustDto.batchNumber,
          adjustDto.newQuantity,
          adjustDto.reason,
          adjustDto.adjustedBy
        )
      );

      const difference = adjustDto.newQuantity - batchInfo.batch.quantity;
      const adjustmentType = difference >= 0 ? 'increase' : 'decrease';

      return new ApiResponseDto({
        success: true,
        message: `Stock adjusted successfully`,
        data: new OperationResultDto(
          true, 
          `Stock ${adjustmentType} of ${Math.abs(difference)} units for batch ${adjustDto.batchNumber}. Reason: ${adjustDto.reason}`
        )
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to adjust stock',
        errors: ['STOCK_ADJUSTMENT_FAILED']
      });
    }
  }

  // ============================================================================
  // STOCK QUERY OPERATIONS
  // ============================================================================

  /**
   * Get stock by ID
   */
  async getStockById(stockId: number): Promise<ApiResponseDto<StockResponseDto>> {
    try {
      const stock = await this.queryBus.execute(new GetStockByIdQuery(stockId));
      
      if (!stock) {
        return new ApiResponseDto({
          success: false,
          message: `Stock with ID ${stockId} not found`,
          errors: ['STOCK_NOT_FOUND']
        });
      }

      return new ApiResponseDto({
        success: true,
        data: this.mapToStockResponse(stock)
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get stock',
        errors: ['STOCK_FETCH_FAILED']
      });
    }
  }

  /**
   * Get stock by product and location
   */
  async getStockByProduct(productId: number, locationId?: number): Promise<ApiResponseDto<StockResponseDto[]>> {
    try {
      const stocks = await this.queryBus.execute(new GetStockByProductQuery(productId, locationId));
      
      const mappedStocks = stocks.map(stock => this.mapToStockResponse(stock));

      return new ApiResponseDto({
        success: true,
        data: mappedStocks
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get stock by product',
        errors: ['STOCK_BY_PRODUCT_FETCH_FAILED']
      });
    }
  }

  /**
   * Get stocks by location with filtering
   */
  async getStocksByLocation(
    locationId: number,
    filters?: StockFiltersDto,
    pagination?: PaginationDto
  ): Promise<ApiResponseDto<PaginatedResult<StockResponseDto>>> {
    try {
      const result = await this.queryBus.execute(
        new GetStockByLocationQuery(locationId, filters, pagination)
      );
      
      const mappedResult = {
        ...result,
        data: result.data.map(stock => this.mapToStockResponse(stock))
      };

      return new ApiResponseDto({
        success: true,
        data: mappedResult
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get stocks by location',
        errors: ['STOCKS_BY_LOCATION_FETCH_FAILED']
      });
    }
  }

  /**
   * Get available stock quantity for a product
   */
  async getAvailableStock(productId: number, locationId?: number): Promise<ApiResponseDto<{ quantity: number }>> {
    try {
      const availableQuantity = await this.queryBus.execute(
        new GetAvailableStockQuery(productId, locationId)
      );

      return new ApiResponseDto({
        success: true,
        data: { quantity: availableQuantity }
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get available stock',
        errors: ['AVAILABLE_STOCK_FETCH_FAILED']
      });
    }
  }

  /**
   * Get expiring batches
   */
  async getExpiringBatches(daysAhead: number = 30, locationId?: number): Promise<ApiResponseDto<any[]>> {
    try {
      const expiringBatches = await this.queryBus.execute(
        new GetExpiringBatchesQuery(daysAhead, locationId)
      );

      return new ApiResponseDto({
        success: true,
        data: expiringBatches
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get expiring batches',
        errors: ['EXPIRING_BATCHES_FETCH_FAILED']
      });
    }
  }

  /**
   * Get batch traceability information
   */
  async getBatchTraceability(batchNumber: string): Promise<ApiResponseDto<BatchTraceabilityResponseDto>> {
    try {
      const traceability = await this.queryBus.execute(new GetBatchTraceabilityQuery(batchNumber));

      return new ApiResponseDto({
        success: true,
        data: traceability
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get batch traceability',
        errors: ['BATCH_TRACEABILITY_FETCH_FAILED']
      });
    }
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(locationId?: number, familyId?: number): Promise<ApiResponseDto<InventorySummaryResponseDto>> {
    try {
      const summary = await this.queryBus.execute(new GetInventorySummaryQuery(locationId, familyId));

      return new ApiResponseDto({
        success: true,
        data: summary
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get inventory summary',
        errors: ['INVENTORY_SUMMARY_FETCH_FAILED']
      });
    }
  }

  /**
   * Get reserved stock information
   */
  async getReservedStock(
    orderId?: string,
    productId?: number,
    locationId?: number
  ): Promise<ApiResponseDto<any[]>> {
    try {
      const reservedStock = await this.queryBus.execute(
        new GetReservedStockQuery(orderId, productId, locationId)
      );

      return new ApiResponseDto({
        success: true,
        data: reservedStock
      });
    } catch (error) {
      return new ApiResponseDto({
        success: false,
        message: error.message || 'Failed to get reserved stock',
        errors: ['RESERVED_STOCK_FETCH_FAILED']
      });
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Map domain Stock entity to StockResponseDto
   */
  private mapToStockResponse(stock: Stock): StockResponseDto {
    return {
      id: stock.id,
      productId: stock.productId,
      productCode: stock.productCode,
      locationId: stock.locationId,
      totalQuantity: stock.totalQuantity,
      availableQuantity: stock.availableQuantity,
      reservedQuantity: stock.reservedQuantity,
      minimumLevel: stock.minimumLevel,
      maximumLevel: stock.maximumLevel,
      reorderPoint: stock.reorderPoint,
      isActive: stock.isActive,
      batches: stock.batches || [],
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
      createdBy: stock.createdBy,
      updatedBy: stock.updatedBy
    } as StockResponseDto;
  }
}
