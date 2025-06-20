import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

export interface StockProps {
  id?: number;
  uuid?: string;
  productId: number;
  productCode: string;
  locationId: number;
  batches: StockBatch[];
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  minimumLevel?: number;
  maximumLevel?: number;
  reorderPoint?: number;
  isActive: boolean;
  lastMovementAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockBatch {
  batchNumber: string; // Número de lote único
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  productionDate?: Date;
  expirationDate?: Date;
  supplier?: string;
  cost?: number;
  location?: string; // Ubicación específica dentro del almacén
  status: BatchStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum BatchStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  QUARANTINE = 'quarantine',
  CONSUMED = 'consumed'
}

export enum MovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RESERVATION = 'reservation',
  RELEASE = 'release'
}

export interface StockMovement {
  id: string;
  batchNumber: string;
  type: MovementType;
  quantity: number;
  reason: string;
  referenceId?: string; // ID del pedido, transferencia, etc.
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Domain Events
export class StockCreatedEvent {
  constructor(
    public readonly stockId: number,
    public readonly productId: number,
    public readonly productCode: string,
    public readonly locationId: number
  ) {}
}

export class StockUpdatedEvent {
  constructor(
    public readonly stockId: number,
    public readonly productCode: string,
    public readonly changes: Partial<StockProps>
  ) {}
}

export class BatchAddedEvent {
  constructor(
    public readonly stockId: number,
    public readonly productCode: string,
    public readonly batch: StockBatch
  ) {}
}

export class BatchUpdatedEvent {
  constructor(
    public readonly stockId: number,
    public readonly productCode: string,
    public readonly batchNumber: string,
    public readonly changes: Partial<StockBatch>
  ) {}
}

export class StockMovementEvent {
  constructor(
    public readonly stockId: number,
    public readonly productCode: string,
    public readonly movement: StockMovement
  ) {}
}

export class LowStockAlertEvent {
  constructor(
    public readonly stockId: number,
    public readonly productCode: string,
    public readonly currentQuantity: number,
    public readonly minimumLevel: number
  ) {}
}

export class ExpirationAlertEvent {
  constructor(
    public readonly stockId: number,
    public readonly productCode: string,
    public readonly batchNumber: string,
    public readonly expirationDate: Date
  ) {}
}

export class Stock extends AggregateRoot {
  private _id: number;
  private _uuid: string;
  private _productId: number;
  private _productCode: string;
  private _locationId: number;
  private _batches: StockBatch[];
  private _totalQuantity: number;
  private _availableQuantity: number;
  private _reservedQuantity: number;
  private _minimumLevel?: number;
  private _maximumLevel?: number;
  private _reorderPoint?: number;
  private _isActive: boolean;
  private _movements: StockMovement[];
  private _lastMovementAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: StockProps) {
    super();
    this._id = props.id || 0;
    this._uuid = props.uuid || uuidv4();
    this._productId = props.productId;
    this._productCode = props.productCode;
    this._locationId = props.locationId;
    this._batches = props.batches || [];
    this._totalQuantity = props.totalQuantity || 0;
    this._availableQuantity = props.availableQuantity || 0;
    this._reservedQuantity = props.reservedQuantity || 0;
    this._minimumLevel = props.minimumLevel;
    this._maximumLevel = props.maximumLevel;
    this._reorderPoint = props.reorderPoint;
    this._isActive = props.isActive ?? true;
    this._movements = [];
    this._lastMovementAt = props.lastMovementAt;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Factory method
  static create(props: Omit<StockProps, 'id' | 'uuid' | 'createdAt' | 'updatedAt' | 'batches' | 'totalQuantity' | 'availableQuantity' | 'reservedQuantity'>): Stock {
    const stock = new Stock({
      ...props,
      uuid: uuidv4(),
      batches: [],
      totalQuantity: 0,
      availableQuantity: 0,
      reservedQuantity: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    stock.apply(new StockCreatedEvent(
      stock._id,
      stock._productId,
      stock._productCode,
      stock._locationId
    ));

    return stock;
  }

  // Getters
  get id(): number { return this._id; }
  get uuid(): string { return this._uuid; }
  get productId(): number { return this._productId; }
  get productCode(): string { return this._productCode; }
  get locationId(): number { return this._locationId; }
  get batches(): StockBatch[] { return this._batches; }
  get totalQuantity(): number { return this._totalQuantity; }
  get availableQuantity(): number { return this._availableQuantity; }
  get reservedQuantity(): number { return this._reservedQuantity; }
  get minimumLevel(): number | undefined { return this._minimumLevel; }
  get maximumLevel(): number | undefined { return this._maximumLevel; }
  get reorderPoint(): number | undefined { return this._reorderPoint; }
  get isActive(): boolean { return this._isActive; }
  get movements(): StockMovement[] { return this._movements; }
  get lastMovementAt(): Date | undefined { return this._lastMovementAt; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Batch Management Methods
  addBatch(batchData: Omit<StockBatch, 'availableQuantity' | 'reservedQuantity' | 'status' | 'createdAt' | 'updatedAt'>): void {
    // Check if batch already exists
    if (this.getBatch(batchData.batchNumber)) {
      throw new Error(`Batch ${batchData.batchNumber} already exists`);
    }

    const batch: StockBatch = {
      ...batchData,
      availableQuantity: batchData.quantity,
      reservedQuantity: 0,
      status: BatchStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._batches.push(batch);
    this.recalculateQuantities();
    this._updatedAt = new Date();

    // Create movement record
    const movement: StockMovement = {
      id: uuidv4(),
      batchNumber: batch.batchNumber,
      type: MovementType.INBOUND,
      quantity: batch.quantity,
      reason: 'New batch added',
      timestamp: new Date()
    };

    this._movements.push(movement);
    this._lastMovementAt = new Date();

    this.apply(new BatchAddedEvent(this._id, this._productCode, batch));
    this.apply(new StockMovementEvent(this._id, this._productCode, movement));

    this.checkAlerts();
  }

  updateBatch(batchNumber: string, updates: Partial<Pick<StockBatch, 'quantity' | 'expirationDate' | 'supplier' | 'cost' | 'location' | 'status' | 'metadata'>>): void {
    const batch = this.getBatch(batchNumber);
    if (!batch) {
      throw new Error(`Batch ${batchNumber} not found`);
    }

    const originalQuantity = batch.quantity;
    
    Object.assign(batch, updates, { updatedAt: new Date() });

    // If quantity changed, update available quantity
    if (updates.quantity !== undefined && updates.quantity !== originalQuantity) {
      const difference = updates.quantity - originalQuantity;
      batch.availableQuantity = Math.max(0, batch.availableQuantity + difference);
    }

    this.recalculateQuantities();
    this._updatedAt = new Date();

    // Create movement record if quantity changed
    if (updates.quantity !== undefined && updates.quantity !== originalQuantity) {
      const movement: StockMovement = {
        id: uuidv4(),
        batchNumber: batch.batchNumber,
        type: MovementType.ADJUSTMENT,
        quantity: updates.quantity - originalQuantity,
        reason: 'Batch quantity adjustment',
        timestamp: new Date()
      };

      this._movements.push(movement);
      this._lastMovementAt = new Date();
      this.apply(new StockMovementEvent(this._id, this._productCode, movement));
    }

    this.apply(new BatchUpdatedEvent(this._id, this._productCode, batchNumber, updates));
    this.checkAlerts();
  }

  // Stock Movement Methods (FIFO/FEFO Logic)
  reserveStock(quantity: number, orderId: string, preferFEFO: boolean = true): { batchNumber: string; quantity: number }[] {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    if (this._availableQuantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${this._availableQuantity}, Requested: ${quantity}`);
    }

    const availableBatches = this._batches
      .filter(batch => batch.status === BatchStatus.AVAILABLE && batch.availableQuantity > 0)
      .sort((a, b) => {
        if (preferFEFO && a.expirationDate && b.expirationDate) {
          return a.expirationDate.getTime() - b.expirationDate.getTime();
        }
        return a.createdAt.getTime() - b.createdAt.getTime(); // FIFO fallback
      });

    const reservations: { batchNumber: string; quantity: number }[] = [];
    let remainingQuantity = quantity;

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const reserveFromBatch = Math.min(batch.availableQuantity, remainingQuantity);
      
      batch.availableQuantity -= reserveFromBatch;
      batch.reservedQuantity += reserveFromBatch;
      batch.updatedAt = new Date();

      reservations.push({
        batchNumber: batch.batchNumber,
        quantity: reserveFromBatch
      });

      // Create movement record
      const movement: StockMovement = {
        id: uuidv4(),
        batchNumber: batch.batchNumber,
        type: MovementType.RESERVATION,
        quantity: reserveFromBatch,
        reason: 'Stock reservation for order',
        referenceId: orderId,
        timestamp: new Date()
      };

      this._movements.push(movement);

      remainingQuantity -= reserveFromBatch;
    }

    this.recalculateQuantities();
    this._lastMovementAt = new Date();
    this._updatedAt = new Date();

    this.apply(new StockUpdatedEvent(this._id, this._productCode, { reservedQuantity: this._reservedQuantity }));

    return reservations;
  }

  releaseReservation(batchNumber: string, quantity: number, orderId: string): void {
    const batch = this.getBatch(batchNumber);
    if (!batch) {
      throw new Error(`Batch ${batchNumber} not found`);
    }

    if (batch.reservedQuantity < quantity) {
      throw new Error(`Cannot release ${quantity} units. Reserved: ${batch.reservedQuantity}`);
    }

    batch.reservedQuantity -= quantity;
    batch.availableQuantity += quantity;
    batch.updatedAt = new Date();

    // Create movement record
    const movement: StockMovement = {
      id: uuidv4(),
      batchNumber: batch.batchNumber,
      type: MovementType.RELEASE,
      quantity: quantity,
      reason: 'Reservation released',
      referenceId: orderId,
      timestamp: new Date()
    };

    this._movements.push(movement);

    this.recalculateQuantities();
    this._lastMovementAt = new Date();
    this._updatedAt = new Date();

    this.apply(new StockMovementEvent(this._id, this._productCode, movement));
  }

  consumeStock(batchNumber: string, quantity: number, orderId: string): void {
    const batch = this.getBatch(batchNumber);
    if (!batch) {
      throw new Error(`Batch ${batchNumber} not found`);
    }

    if (batch.reservedQuantity < quantity) {
      throw new Error(`Cannot consume ${quantity} units. Reserved: ${batch.reservedQuantity}`);
    }

    batch.reservedQuantity -= quantity;
    batch.quantity -= quantity;

    if (batch.quantity <= 0) {
      batch.status = BatchStatus.CONSUMED;
    }

    batch.updatedAt = new Date();

    // Create movement record
    const movement: StockMovement = {
      id: uuidv4(),
      batchNumber: batch.batchNumber,
      type: MovementType.OUTBOUND,
      quantity: quantity,
      reason: 'Stock consumed for order fulfillment',
      referenceId: orderId,
      timestamp: new Date()
    };

    this._movements.push(movement);

    this.recalculateQuantities();
    this._lastMovementAt = new Date();
    this._updatedAt = new Date();

    this.apply(new StockMovementEvent(this._id, this._productCode, movement));
    this.checkAlerts();
  }

  // Utility Methods
  getBatch(batchNumber: string): StockBatch | undefined {
    return this._batches.find(batch => batch.batchNumber === batchNumber);
  }

  getBatchesByStatus(status: BatchStatus): StockBatch[] {
    return this._batches.filter(batch => batch.status === status);
  }

  getBatchesExpiringBefore(date: Date): StockBatch[] {
    return this._batches.filter(batch => 
      batch.expirationDate && 
      batch.expirationDate <= date && 
      batch.status === BatchStatus.AVAILABLE
    );
  }

  getOldestBatches(limit: number = 10): StockBatch[] {
    return this._batches
      .filter(batch => batch.status === BatchStatus.AVAILABLE)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
  }

  private recalculateQuantities(): void {
    this._totalQuantity = this._batches
      .filter(batch => batch.status !== BatchStatus.CONSUMED)
      .reduce((sum, batch) => sum + batch.quantity, 0);

    this._availableQuantity = this._batches
      .filter(batch => batch.status === BatchStatus.AVAILABLE)
      .reduce((sum, batch) => sum + batch.availableQuantity, 0);

    this._reservedQuantity = this._batches
      .filter(batch => batch.status === BatchStatus.AVAILABLE)
      .reduce((sum, batch) => sum + batch.reservedQuantity, 0);
  }

  private checkAlerts(): void {
    // Low stock alert
    if (this._minimumLevel && this._availableQuantity <= this._minimumLevel) {
      this.apply(new LowStockAlertEvent(
        this._id,
        this._productCode,
        this._availableQuantity,
        this._minimumLevel
      ));
    }

    // Expiration alerts (30 days warning)
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 30);

    const expiringBatches = this.getBatchesExpiringBefore(warningDate);
    expiringBatches.forEach(batch => {
      if (batch.expirationDate) {
        this.apply(new ExpirationAlertEvent(
          this._id,
          this._productCode,
          batch.batchNumber,
          batch.expirationDate
        ));
      }
    });
  }

  // Configuration Methods
  setMinimumLevel(level: number): void {
    this._minimumLevel = level;
    this._updatedAt = new Date();
    this.apply(new StockUpdatedEvent(this._id, this._productCode, { minimumLevel: level }));
    this.checkAlerts();
  }

  setMaximumLevel(level: number): void {
    this._maximumLevel = level;
    this._updatedAt = new Date();
    this.apply(new StockUpdatedEvent(this._id, this._productCode, { maximumLevel: level }));
  }

  setReorderPoint(point: number): void {
    this._reorderPoint = point;
    this._updatedAt = new Date();
    this.apply(new StockUpdatedEvent(this._id, this._productCode, { reorderPoint: point }));
  }

  // Serialization
  toSnapshot(): StockProps {
    return {
      id: this._id,
      uuid: this._uuid,
      productId: this._productId,
      productCode: this._productCode,
      locationId: this._locationId,
      batches: this._batches,
      totalQuantity: this._totalQuantity,
      availableQuantity: this._availableQuantity,
      reservedQuantity: this._reservedQuantity,
      minimumLevel: this._minimumLevel,
      maximumLevel: this._maximumLevel,
      reorderPoint: this._reorderPoint,
      isActive: this._isActive,
      lastMovementAt: this._lastMovementAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  static fromSnapshot(props: StockProps): Stock {
    return new Stock(props);
  }
}