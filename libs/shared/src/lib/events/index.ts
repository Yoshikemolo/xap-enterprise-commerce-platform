import { DomainEvent } from '../types/index';
import { IdGenerator, DateUtils } from '../utils/index';

// Base Domain Event Implementation
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly id: string;
  public readonly occurredOn: Date;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly eventData: Record<string, any>;
  public readonly metadata?: Record<string, any>;

  constructor(
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    eventData: Record<string, any>,
    metadata?: Record<string, any>
  ) {
    this.id = IdGenerator.generate();
    this.occurredOn = DateUtils.now();
    this.eventType = eventType;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.eventData = eventData;
    this.metadata = metadata;
  }
}

// User Domain Events
export class UserCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
    },
    metadata?: Record<string, any>
  ) {
    super('user.created', aggregateId, 'User', data, metadata);
  }
}

export class UserUpdatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
      updatedFields: string[];
    },
    metadata?: Record<string, any>
  ) {
    super('user.updated', aggregateId, 'User', data, metadata);
  }
}

export class UserDeletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      email: string;
      deletedBy: string;
      reason?: string;
    },
    metadata?: Record<string, any>
  ) {
    super('user.deleted', aggregateId, 'User', data, metadata);
  }
}

export class UserLoggedInEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      email: string;
      ipAddress: string;
      userAgent: string;
      timestamp: Date;
    },
    metadata?: Record<string, any>
  ) {
    super('user.logged_in', aggregateId, 'User', data, metadata);
  }
}

export class UserLoggedOutEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      email: string;
      sessionDuration: number;
      timestamp: Date;
    },
    metadata?: Record<string, any>
  ) {
    super('user.logged_out', aggregateId, 'User', data, metadata);
  }
}

// Product Domain Events
export class ProductCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      name: string;
      sku: string;
      familyId: string;
      price: { amount: number; currency: string };
      initialStock: number;
      createdBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('product.created', aggregateId, 'Product', data, metadata);
  }
}

export class ProductUpdatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      updatedBy: string;
      updatedFields: string[];
    },
    metadata?: Record<string, any>
  ) {
    super('product.updated', aggregateId, 'Product', data, metadata);
  }
}

export class ProductPriceChangedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      oldPrice: { amount: number; currency: string };
      newPrice: { amount: number; currency: string };
      reason: string;
      effectiveDate: Date;
      changedBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('product.price_changed', aggregateId, 'Product', data, metadata);
  }
}

export class StockUpdatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      productId: string;
      locationId: string;
      oldQuantity: number;
      newQuantity: number;
      changeType: 'INCREASE' | 'DECREASE' | 'ADJUSTMENT';
      reason: string;
      updatedBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('product.stock_updated', aggregateId, 'Stock', data, metadata);
  }
}

export class StockLowEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      productId: string;
      locationId: string;
      currentQuantity: number;
      threshold: number;
      severity: 'LOW' | 'CRITICAL';
    },
    metadata?: Record<string, any>
  ) {
    super('product.stock_low', aggregateId, 'Stock', data, metadata);
  }
}

export class StockOutEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      productId: string;
      locationId: string;
      lastQuantity: number;
      outOfStockSince: Date;
    },
    metadata?: Record<string, any>
  ) {
    super('product.stock_out', aggregateId, 'Stock', data, metadata);
  }
}

// Order Domain Events
export class OrderCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      customerId: string;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: { amount: number; currency: string };
      }>;
      totalAmount: { amount: number; currency: string };
      shippingAddress: any;
      billingAddress: any;
    },
    metadata?: Record<string, any>
  ) {
    super('order.created', aggregateId, 'Order', data, metadata);
  }
}

export class OrderConfirmedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      customerId: string;
      confirmationNumber: string;
      estimatedDeliveryDate: Date;
      confirmedBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('order.confirmed', aggregateId, 'Order', data, metadata);
  }
}

export class OrderShippedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      customerId: string;
      trackingNumber: string;
      carrier: string;
      shippedDate: Date;
      estimatedDeliveryDate: Date;
      shippedBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('order.shipped', aggregateId, 'Order', data, metadata);
  }
}

export class OrderDeliveredEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      customerId: string;
      deliveredDate: Date;
      deliveredTo: string;
      signature?: string;
      notes?: string;
    },
    metadata?: Record<string, any>
  ) {
    super('order.delivered', aggregateId, 'Order', data, metadata);
  }
}

export class OrderCancelledEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      customerId: string;
      reason: string;
      cancelledBy: string;
      cancellationDate: Date;
      refundAmount?: { amount: number; currency: string };
    },
    metadata?: Record<string, any>
  ) {
    super('order.cancelled', aggregateId, 'Order', data, metadata);
  }
}

// Payment Domain Events
export class PaymentInitiatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      orderId: string;
      customerId: string;
      amount: { amount: number; currency: string };
      paymentMethod: string;
      initiatedBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('payment.initiated', aggregateId, 'Payment', data, metadata);
  }
}

export class PaymentCompletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      orderId: string;
      customerId: string;
      amount: { amount: number; currency: string };
      paymentMethod: string;
      transactionId: string;
      completedDate: Date;
    },
    metadata?: Record<string, any>
  ) {
    super('payment.completed', aggregateId, 'Payment', data, metadata);
  }
}

export class PaymentFailedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      orderId: string;
      customerId: string;
      amount: { amount: number; currency: string };
      paymentMethod: string;
      failureReason: string;
      errorCode: string;
      attemptNumber: number;
    },
    metadata?: Record<string, any>
  ) {
    super('payment.failed', aggregateId, 'Payment', data, metadata);
  }
}

export class PaymentRefundedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      orderId: string;
      customerId: string;
      refundAmount: { amount: number; currency: string };
      originalAmount: { amount: number; currency: string };
      reason: string;
      refundedBy: string;
      refundDate: Date;
    },
    metadata?: Record<string, any>
  ) {
    super('payment.refunded', aggregateId, 'Payment', data, metadata);
  }
}

// Promotion Domain Events
export class PromotionCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      name: string;
      type: string;
      discountValue: number;
      startDate: Date;
      endDate: Date;
      conditions: any[];
      createdBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('promotion.created', aggregateId, 'Promotion', data, metadata);
  }
}

export class PromotionActivatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      name: string;
      activatedDate: Date;
      activatedBy: string;
    },
    metadata?: Record<string, any>
  ) {
    super('promotion.activated', aggregateId, 'Promotion', data, metadata);
  }
}

export class PromotionExpiredEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      name: string;
      endDate: Date;
      usageCount: number;
      totalDiscount: { amount: number; currency: string };
    },
    metadata?: Record<string, any>
  ) {
    super('promotion.expired', aggregateId, 'Promotion', data, metadata);
  }
}

// System Domain Events
export class SystemHealthCheckEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      serviceName: string;
      status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED';
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
      activeConnections: number;
    },
    metadata?: Record<string, any>
  ) {
    super('system.health_check', aggregateId, 'System', data, metadata);
  }
}

export class SystemBackupCompletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    data: {
      backupType: 'FULL' | 'INCREMENTAL';
      backupSize: number;
      duration: number;
      location: string;
      status: 'SUCCESS' | 'FAILED';
      errorMessage?: string;
    },
    metadata?: Record<string, any>
  ) {
    super('system.backup_completed', aggregateId, 'System', data, metadata);
  }
}

// Event Factory
export class EventFactory {
  private static eventMap = new Map<string, any>([
    ['user.created', UserCreatedEvent],
    ['user.updated', UserUpdatedEvent],
    ['user.deleted', UserDeletedEvent],
    ['user.logged_in', UserLoggedInEvent],
    ['user.logged_out', UserLoggedOutEvent],
    ['product.created', ProductCreatedEvent],
    ['product.updated', ProductUpdatedEvent],
    ['product.price_changed', ProductPriceChangedEvent],
    ['product.stock_updated', StockUpdatedEvent],
    ['product.stock_low', StockLowEvent],
    ['product.stock_out', StockOutEvent],
    ['order.created', OrderCreatedEvent],
    ['order.confirmed', OrderConfirmedEvent],
    ['order.shipped', OrderShippedEvent],
    ['order.delivered', OrderDeliveredEvent],
    ['order.cancelled', OrderCancelledEvent],
    ['payment.initiated', PaymentInitiatedEvent],
    ['payment.completed', PaymentCompletedEvent],
    ['payment.failed', PaymentFailedEvent],
    ['payment.refunded', PaymentRefundedEvent],
    ['promotion.created', PromotionCreatedEvent],
    ['promotion.activated', PromotionActivatedEvent],
    ['promotion.expired', PromotionExpiredEvent],
    ['system.health_check', SystemHealthCheckEvent],
    ['system.backup_completed', SystemBackupCompletedEvent],
  ]);

  static createEvent(eventType: string, aggregateId: string, data: any, metadata?: any): DomainEvent {
    const EventClass = this.eventMap.get(eventType);
    if (!EventClass) {
      throw new Error(`Unknown event type: ${eventType}`);
    }
    return new EventClass(aggregateId, data, metadata);
  }

  static fromPlainObject(eventData: any): DomainEvent {
    const EventClass = this.eventMap.get(eventData.eventType);
    if (!EventClass) {
      throw new Error(`Unknown event type: ${eventData.eventType}`);
    }
    
    const event = Object.create(EventClass.prototype);
    Object.assign(event, eventData);
    return event;
  }

  static registerEventType(eventType: string, eventClass: any): void {
    this.eventMap.set(eventType, eventClass);
  }

  static getSupportedEventTypes(): string[] {
    return Array.from(this.eventMap.keys());
  }
}

// Event Bus Interface
export interface EventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  publishMany<T extends DomainEvent>(events: T[]): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: (event: T) => Promise<void>
  ): void;
  unsubscribe(eventType: string, handler: Function): void;
}

// Event Handler Interface
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void>;
  getEventType(): string;
}

// Abstract Event Handler
export abstract class AbstractEventHandler<T extends DomainEvent> implements EventHandler<T> {
  abstract handle(event: T): Promise<void>;
  abstract getEventType(): string;

  protected async withRetry<R>(
    operation: () => Promise<R>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<R> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }
}

// Event Store Interface
export interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getAllEvents(fromTimestamp?: Date): Promise<DomainEvent[]>;
  getEventsByType(eventType: string, fromTimestamp?: Date): Promise<DomainEvent[]>;
}

// Event Snapshot Interface
export interface EventSnapshot {
  aggregateId: string;
  aggregateType: string;
  version: number;
  data: any;
  timestamp: Date;
}

// Event Projector Interface
export interface EventProjector<T = any> {
  project(event: DomainEvent): Promise<void>;
  rebuild(fromTimestamp?: Date): Promise<void>;
  getProjection(id: string): Promise<T | null>;
}

// Event Saga Interface
export interface EventSaga {
  handle(event: DomainEvent): Promise<DomainEvent[]>;
  canHandle(event: DomainEvent): boolean;
  getSagaType(): string;
}