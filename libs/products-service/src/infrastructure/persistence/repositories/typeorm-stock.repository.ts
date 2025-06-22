import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { StockRepository } from '../../../domain/repositories';
import { Stock, StockBatch } from '../../../domain/entities';
import { StockEntity, StockMovementEntity } from '../entities/stock.entity';
import { PaginatedResult, StockFilters } from '../../../application/queries';
import { PaginationOptions } from '../../../application/dto';

/**
 * TypeORM Stock Repository Implementation
 * 
 * Advanced inventory management with batch tracking, FIFO/FEFO logic,
 * and comprehensive movement history.
 */
@Injectable()
export class TypeOrmStockRepository implements StockRepository {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stockEntityRepository: Repository<StockEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly movementEntityRepository: Repository<StockMovementEntity>
  ) {}

  async findById(id: number): Promise<Stock | null> {
    const entity = await this.stockEntityRepository.findOne({
      where: { id },
      relations: ['product', 'movements']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByProductId(productId: number): Promise<Stock[]> {
    const entities = await this.stockEntityRepository.find({
      where: { productId },
      relations: ['product', 'movements']
    });

    return entities.map(entity => this.mapToDomain(entity));
  }

  async findByProductAndLocation(productId: number, locationId: number): Promise<Stock | null> {
    const entity = await this.stockEntityRepository.findOne({
      where: { productId, locationId },
      relations: ['product', 'movements']
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findByLocation(
    locationId: number,
    filters?: StockFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Stock>> {
    const queryBuilder = this.createBaseQueryBuilder();
    queryBuilder.andWhere('stock.locationId = :locationId', { locationId });

    if (filters) {
      this.applyFilters(queryBuilder, filters);
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`stock.${pagination.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('stock.createdAt', 'DESC');
    }

    const [entities, total] = await queryBuilder.getManyAndCount();
    const stocks = entities.map(entity => this.mapToDomain(entity));

    return {
      data: stocks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findBatchByNumber(batchNumber: string): Promise<{ stock: Stock; batch: StockBatch } | null> {
    // Find stock that contains this batch
    const entity = await this.stockEntityRepository
      .createQueryBuilder('stock')
      .where("JSON_EXTRACT(stock.batches, '$[*].batchNumber') LIKE :batchNumber", 
             { batchNumber: `%${batchNumber}%` })
      .getOne();

    if (!entity) {
      return null;
    }

    const stock = this.mapToDomain(entity);
    const batch = stock.batches.find(b => b.batchNumber === batchNumber);

    return batch ? { stock, batch } : null;
  }

  async findBatchesByNumbers(batchNumbers: string[]): Promise<{ stock: Stock; batch: StockBatch }[]> {
    const results: { stock: Stock; batch: StockBatch }[] = [];

    for (const batchNumber of batchNumbers) {
      const result = await this.findBatchByNumber(batchNumber);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  async findExpiringBatches(
    expirationDate: Date,
    locationId?: number
  ): Promise<{ stock: Stock; batch: StockBatch }[]> {
    let query = this.stockEntityRepository.createQueryBuilder('stock');

    if (locationId) {
      query = query.where('stock.locationId = :locationId', { locationId });
    }

    const entities = await query.getMany();
    const results: { stock: Stock; batch: StockBatch }[] = [];

    for (const entity of entities) {
      const stock = this.mapToDomain(entity);
      const expiringBatches = stock.batches.filter(batch => 
        batch.expirationDate && 
        batch.expirationDate <= expirationDate &&
        batch.status === 'AVAILABLE'
      );

      for (const batch of expiringBatches) {
        results.push({ stock, batch });
      }
    }

    return results;
  }

  async findProductsWithLowStock(locationId?: number): Promise<any[]> {
    let query = this.stockEntityRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .where('stock.availableQuantity <= stock.minimumLevel')
      .andWhere('stock.minimumLevel IS NOT NULL');

    if (locationId) {
      query = query.andWhere('stock.locationId = :locationId', { locationId });
    }

    const entities = await query.getMany();

    return entities.map(entity => ({
      product: {
        id: entity.productId,
        productCode: entity.productCode,
        name: entity.product?.name || 'Unknown'
      },
      stock: {
        locationId: entity.locationId,
        currentStock: entity.availableQuantity,
        minimumLevel: entity.minimumLevel,
        urgencyLevel: this.calculateUrgencyLevel(entity.availableQuantity, entity.minimumLevel || 0)
      }
    }));
  }

  async findReservedStock(filters: {
    orderId?: string;
    productId?: number;
    locationId?: number;
  }): Promise<any[]> {
    let query = this.stockEntityRepository.createQueryBuilder('stock');

    if (filters.productId) {
      query = query.andWhere('stock.productId = :productId', { productId: filters.productId });
    }

    if (filters.locationId) {
      query = query.andWhere('stock.locationId = :locationId', { locationId: filters.locationId });
    }

    const entities = await query.getMany();
    const results: any[] = [];

    for (const entity of entities) {
      const stock = this.mapToDomain(entity);
      
      for (const batch of stock.batches) {
        if (batch.reservedQuantity > 0) {
          // In a real implementation, you'd track which order each reservation belongs to
          // For now, we'll include all reservations if no orderId filter is specified
          if (!filters.orderId || batch.metadata?.orderId === filters.orderId) {
            results.push({
              batchNumber: batch.batchNumber,
              quantity: batch.reservedQuantity,
              orderId: batch.metadata?.orderId || 'UNKNOWN',
              reservedAt: batch.metadata?.reservedAt || batch.updatedAt,
              expirationDate: batch.expirationDate
            });
          }
        }
      }
    }

    return results;
  }

  async getInventorySummary(locationId?: number, familyId?: number): Promise<any> {
    // This is a complex query that would typically involve joins with products and families
    // For now, we'll provide a basic implementation
    let query = this.stockEntityRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product');

    if (locationId) {
      query = query.andWhere('stock.locationId = :locationId', { locationId });
    }

    if (familyId) {
      query = query.andWhere('product.familyId = :familyId', { familyId });
    }

    const entities = await query.getMany();

    const summary = {
      locationId,
      familyId,
      totalProducts: entities.length,
      totalStockValue: 0,
      lowStockProducts: 0,
      expiringBatches: 0,
      totalBatches: 0,
      byFamily: [],
      generatedAt: new Date()
    };

    for (const entity of entities) {
      const stock = this.mapToDomain(entity);
      
      // Count batches
      summary.totalBatches += stock.batches.length;
      
      // Check for low stock
      if (entity.minimumLevel && entity.availableQuantity <= entity.minimumLevel) {
        summary.lowStockProducts++;
      }
      
      // Check for expiring batches
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      for (const batch of stock.batches) {
        if (batch.expirationDate && batch.expirationDate <= thirtyDaysFromNow) {
          summary.expiringBatches++;
        }
      }
    }

    return summary;
  }

  async getBatchMovements(batchNumber: string): Promise<any[]> {
    const movements = await this.movementEntityRepository.find({
      where: { batchNumber },
      order: { createdAt: 'DESC' }
    });

    return movements.map(movement => ({
      id: movement.id,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      orderId: movement.orderId,
      reason: movement.reason,
      createdAt: movement.createdAt,
      createdBy: movement.createdBy
    }));
  }

  async save(stock: Stock): Promise<Stock> {
    const entity = this.mapToEntity(stock);
    const savedEntity = await this.stockEntityRepository.save(entity);
    return this.mapToDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.stockEntityRepository.delete(id);
  }

  // Helper method to record stock movements
  async recordMovement(
    stockId: number,
    batchNumber: string,
    movementType: 'IN' | 'OUT' | 'RESERVE' | 'RELEASE' | 'ADJUST' | 'EXPIRE' | 'TRANSFER',
    quantity: number,
    previousQuantity: number,
    newQuantity: number,
    orderId?: string,
    reason?: string,
    createdBy?: string
  ): Promise<void> {
    const movement = new StockMovementEntity();
    movement.stockId = stockId;
    movement.batchNumber = batchNumber;
    movement.movementType = movementType;
    movement.quantity = quantity;
    movement.previousQuantity = previousQuantity;
    movement.newQuantity = newQuantity;
    movement.orderId = orderId;
    movement.reason = reason;
    movement.createdBy = createdBy;

    await this.movementEntityRepository.save(movement);
  }

  // Private helper methods
  private createBaseQueryBuilder(): SelectQueryBuilder<StockEntity> {
    return this.stockEntityRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.movements', 'movements');
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<StockEntity>, filters: StockFilters): void {
    if (filters.productId !== undefined) {
      queryBuilder.andWhere('stock.productId = :productId', { productId: filters.productId });
    }

    if (filters.productCode) {
      queryBuilder.andWhere('stock.productCode = :productCode', { productCode: filters.productCode });
    }

    if (filters.lowStock !== undefined && filters.lowStock) {
      queryBuilder.andWhere('stock.availableQuantity <= stock.minimumLevel');
      queryBuilder.andWhere('stock.minimumLevel IS NOT NULL');
    }

    if (filters.batchNumbers && filters.batchNumbers.length > 0) {
      // This would require a more complex JSON query for batch numbers
      // Implementation depends on database capabilities
    }

    if (filters.expiringBefore) {
      // This would also require JSON querying for batch expiration dates
      // Implementation depends on database capabilities
    }
  }

  private calculateUrgencyLevel(currentStock: number, minimumLevel: number): 'critical' | 'warning' | 'normal' {
    const ratio = currentStock / minimumLevel;
    
    if (ratio <= 0.2) return 'critical';
    if (ratio <= 0.5) return 'warning';
    return 'normal';
  }

  private mapToDomain(entity: StockEntity): Stock {
    // Create domain Stock from entity
    // This is a simplified mapping - in a real implementation, you'd use the domain factory
    return {
      id: entity.id,
      productId: entity.productId,
      productCode: entity.productCode,
      locationId: entity.locationId,
      totalQuantity: entity.totalQuantity,
      availableQuantity: entity.availableQuantity,
      reservedQuantity: entity.reservedQuantity,
      minimumLevel: entity.minimumLevel,
      maximumLevel: entity.maximumLevel,
      reorderPoint: entity.reorderPoint,
      isActive: entity.isActive,
      batches: entity.batches.map(batch => ({
        ...batch,
        productionDate: batch.productionDate ? new Date(batch.productionDate) : undefined,
        expirationDate: batch.expirationDate ? new Date(batch.expirationDate) : undefined,
        createdAt: new Date(batch.createdAt),
        updatedAt: new Date(batch.updatedAt)
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    } as Stock;
  }

  private mapToEntity(stock: Stock): StockEntity {
    const entity = new StockEntity();
    
    if (stock.id) {
      entity.id = stock.id;
    }
    
    entity.productId = stock.productId;
    entity.productCode = stock.productCode;
    entity.locationId = stock.locationId;
    entity.totalQuantity = stock.totalQuantity;
    entity.availableQuantity = stock.availableQuantity;
    entity.reservedQuantity = stock.reservedQuantity;
    entity.minimumLevel = stock.minimumLevel;
    entity.maximumLevel = stock.maximumLevel;
    entity.reorderPoint = stock.reorderPoint;
    entity.isActive = stock.isActive;
    entity.batches = stock.batches;
    entity.createdBy = stock.createdBy;
    entity.updatedBy = stock.updatedBy;

    return entity;
  }
}
