// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Aggregate Root Interface
export interface AggregateRoot extends BaseEntity {
  domainEvents: DomainEvent[];
  clearEvents(): void;
  addEvent(event: DomainEvent): void;
}

// Value Object Base
export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = Object.freeze(value);
  }

  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  get value(): T {
    return this._value;
  }
}

// Domain Event Interface
export interface DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventData: Record<string, any>;
  readonly metadata?: Record<string, any>;
}

// Command Interface
export interface Command {
  readonly id: string;
  readonly type: string;
  readonly payload: Record<string, any>;
  readonly metadata?: Record<string, any>;
}

// Query Interface
export interface Query {
  readonly id: string;
  readonly type: string;
  readonly parameters: Record<string, any>;
}

// Repository Interface
export interface Repository<T extends AggregateRoot> {
  findById(id: string): Promise<T | null>;
  save(aggregate: T): Promise<void>;
  delete(id: string): Promise<void>;
}

// Read Model Interface
export interface ReadModel<T> {
  findById(id: string): Promise<T | null>;
  findMany(criteria: Record<string, any>): Promise<T[]>;
  count(criteria: Record<string, any>): Promise<number>;
}

// Event Store Interface
export interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
}

// Message Bus Interface
export interface MessageBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void;
}

// Outbox Entry
export interface OutboxEntry {
  id: string;
  aggregateId: string;
  eventType: string;
  eventData: Record<string, any>;
  occurredOn: Date;
  processedAt?: Date;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  retryCount: number;
}

// Inbox Entry
export interface InboxEntry {
  id: string;
  eventId: string;
  eventType: string;
  eventData: Record<string, any>;
  occurredOn: Date;
  processedAt?: Date;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication & Authorization Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Product Domain Types
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  familyId: string;
  price: Money;
  stock: Stock;
  isActive: boolean;
  attributes: ProductAttribute[];
  images: ProductImage[];
}

export interface ProductFamily {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children: ProductFamily[];
  products: Product[];
  isActive: boolean;
}

export interface Stock {
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  locationId: string;
  lastUpdated: Date;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'LIST';
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

// Commerce Domain Types
export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: Money;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  discount?: Discount;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  conditions: PromotionCondition[];
  actions: PromotionAction[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export enum PromotionType {
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y'
}

export interface PromotionCondition {
  type: string;
  parameters: Record<string, any>;
}

export interface PromotionAction {
  type: string;
  parameters: Record<string, any>;
}

// Common Value Objects
export class Money extends ValueObject<{ amount: number; currency: string }> {
  constructor(amount: number, currency: string = 'EUR') {
    super({ amount, currency });
  }

  get amount(): number {
    return this._value.amount;
  }

  get currency(): string {
    return this._value.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  static zero(currency: string = 'EUR'): Money {
    return new Money(0, currency);
  }
}

export class Email extends ValueObject<string> {
  constructor(email: string) {
    Email.validate(email);
    super(email.toLowerCase());
  }

  private static validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  get value(): string {
    return this._value;
  }
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  details: Record<string, any>;
  isDefault: boolean;
}

export interface Discount {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  description: string;
}

// Error Types
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', { resource, id });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}