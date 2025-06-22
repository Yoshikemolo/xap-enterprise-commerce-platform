import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

/**
 * Stock Entity - TypeORM Implementation
 * 
 * Advanced inventory management with batch tracking, FIFO/FEFO logic,
 * and comprehensive traceability for enterprise operations.
 */
@Entity('stocks')
@Index(['productId', 'locationId'], { unique: true })
@Index(['productCode'])
@Index(['locationId'])
@Index(['isActive'])
@Index(['totalQuantity'])
@Index(['availableQuantity'])
export class StockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'product_code', type: 'varchar', length: 50 })
  productCode: string;

  @Column({ name: 'location_id', type: 'int' })
  locationId: number;

  @Column({ name: 'total_quantity', type: 'decimal', precision: 15, scale: 4, default: 0 })
  totalQuantity: number;

  @Column({ name: 'available_quantity', type: 'decimal', precision: 15, scale: 4, default: 0 })
  availableQuantity: number;

  @Column({ name: 'reserved_quantity', type: 'decimal', precision: 15, scale: 4, default: 0 })
  reservedQuantity: number;

  @Column({ name: 'minimum_level', type: 'decimal', precision: 15, scale: 4, nullable: true })
  minimumLevel?: number;

  @Column({ name: 'maximum_level', type: 'decimal', precision: 15, scale: 4, nullable: true })
  maximumLevel?: number;

  @Column({ name: 'reorder_point', type: 'decimal', precision: 15, scale: 4, nullable: true })
  reorderPoint?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json' })
  batches: Array<{
    batchNumber: string;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    productionDate?: Date;
    expirationDate?: Date;
    supplier?: string;
    cost?: number;
    location?: string; // Specific location within warehouse
    status: 'AVAILABLE' | 'RESERVED' | 'EXPIRED' | 'QUARANTINE' | 'CONSUMED';
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne('ProductEntity', 'stocks')
  @JoinColumn({ name: 'product_id' })
  product?: any; // Will be properly typed when ProductEntity is imported

  @OneToMany('StockMovementEntity', 'stock')
  movements?: any[]; // Will be properly typed when StockMovementEntity is defined
}

/**
 * Stock Movement Entity - TypeORM Implementation
 * 
 * Tracks all stock movements for complete audit trail and traceability.
 */
@Entity('stock_movements')
@Index(['stockId'])
@Index(['batchNumber'])
@Index(['movementType'])
@Index(['orderId'])
@Index(['createdAt'])
export class StockMovementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stock_id', type: 'int' })
  stockId: number;

  @Column({ name: 'batch_number', type: 'varchar', length: 100 })
  batchNumber: string;

  @Column({ name: 'movement_type', type: 'enum', enum: ['IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUST', 'EXPIRE', 'TRANSFER'] })
  movementType: 'IN' | 'OUT' | 'RESERVE' | 'RELEASE' | 'ADJUST' | 'EXPIRE' | 'TRANSFER';

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  quantity: number;

  @Column({ name: 'previous_quantity', type: 'decimal', precision: 15, scale: 4 })
  previousQuantity: number;

  @Column({ name: 'new_quantity', type: 'decimal', precision: 15, scale: 4 })
  newQuantity: number;

  @Column({ name: 'order_id', type: 'varchar', length: 100, nullable: true })
  orderId?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  // Relationships
  @ManyToOne('StockEntity', 'movements')
  @JoinColumn({ name: 'stock_id' })
  stock?: any; // Will be properly typed when StockEntity is imported
}
