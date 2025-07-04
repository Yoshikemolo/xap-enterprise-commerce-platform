// Enterprise Commerce Platform - Shared Library
// This library contains common interfaces, types, utilities, and classes
// used across all microservices in the platform.

// Export all the modules from lib
export * from './lib/types';
export * from './lib/interfaces';
export * from './lib/utils';
export * from './lib/constants';

// Pagination interfaces
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> extends PaginatedResult<T> {
  hasNext: boolean;
  hasPrev: boolean;
  success?: boolean;
}

// Query Options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  take?: number;
  skip?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  sortBy?: string;
  include?: string[];
  where?: Record<string, any>;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: any;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Validation Error Interface
export interface ValidationErrorDetails {
  field: string;
  message: string;
  value?: any;
}

// Error Classes - Export concrete classes, not interfaces
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
  public readonly errors: ValidationErrorDetails[];

  constructor(errors: ValidationErrorDetails[] | string) {
    if (typeof errors === 'string') {
      super(errors, 'VALIDATION_ERROR');
      this.errors = [{ field: 'general', message: errors }];
    } else {
      super(`Validation failed: ${errors.map(e => e.message).join(', ')}`, 'VALIDATION_ERROR');
      this.errors = errors;
    }
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 'NOT_FOUND', { resource, id });
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
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Access forbidden') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class BadRequestError extends DomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Domain Event
export interface DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventData: Record<string, any>;
  readonly metadata?: Record<string, any>;
}

// Aggregate Root Interface
export interface AggregateRoot extends BaseEntity {
  domainEvents: DomainEvent[];
  clearEvents(): void;
  addEvent(event: DomainEvent): void;
  updateTimestamp(): void;
}

// Abstract Aggregate Root Implementation
export abstract class AggregateRootImpl implements AggregateRoot {
  public id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public version!: number;
  public domainEvents: DomainEvent[] = [];

  clearEvents(): void {
    this.domainEvents = [];
  }

  addEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}

// Read Model Interface
export interface ReadModel<T> {
  findById(id: string, options?: QueryOptions): Promise<T | null>;
  findByUuid(uuid: string, options?: QueryOptions): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  findMany(filters: QueryFilter[], options?: QueryOptions): Promise<T[]>;
  findByField(field: string, value: any, options?: QueryOptions): Promise<T[]>;
  searchPaginated(query: string, options?: QueryOptions): Promise<PaginatedResult<T>>;
  findPaginated(filters: QueryFilter[], options?: QueryOptions): Promise<PaginatedResult<T>>;
  findBy(conditions: Record<string, any>, options?: QueryOptions): Promise<T[]>;
  count(filters?: QueryFilter[]): Promise<number>;
}

// Value Objects
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

export class Email extends ValueObject<string> {
  constructor(email: string) {
    Email.validate(email);
    super(email.toLowerCase());
  }

  private static validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  get value(): string {
    return this._value;
  }
}

// Money Value Object
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

// ID Generator utility
export class IdGenerator {
  static generate(): string {
    // Generate a simple UUID v4 without requiring external libraries
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateShortId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Decorator functions
export function StringField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function OptionalStringField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function EmailField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function OptionalEmailField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function BooleanField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function OptionalBooleanField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function UuidField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function OptionalUuidField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function ArrayField(type?: any, options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function OptionalArrayField(type?: any, options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function PaginationField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function SkipField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function SortByField(allowedFields?: string[], options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function OrderField(options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function EnumField(enumValues?: any[], options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

export function OptionalEnumField(enumValues?: any[], options?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol | undefined) => {
    // Implementation would depend on validation library
  };
}

// Class decorators
export function CreateEntityDto(): ClassDecorator {
  return (target: any) => {
    // Implementation would depend on validation library
  };
}

export function UpdateEntityDto(): ClassDecorator {
  return (target: any) => {
    // Implementation would depend on validation library
  };
}

// Base DTO Classes
export abstract class BaseCreateEntityDto {
  abstract toEntity(): any;
}

export abstract class BaseUpdateEntityDto {
  abstract applyToEntity(entity: any): void;
}

export abstract class BaseQueryDto {
  take?: number = 10;
  skip?: number = 0;
  sortBy?: string = 'createdAt';
  order?: 'ASC' | 'DESC' = 'ASC';
}

// Common type aliases
export type EntityId = string;
export type UserId = string;
export type ProductId = string;
export type OrderId = string;
export type GroupId = string;

// Domain Events - Concrete Classes
export class UserCreatedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'UserCreated';
  readonly aggregateId: string;
  readonly aggregateType: string = 'User';
  readonly eventData: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(userId: string, email: string, firstName: string, lastName: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = userId;
    this.eventData = { userId, email, firstName, lastName };
  }
}

export class UserUpdatedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'UserUpdated';
  readonly aggregateId: string;
  readonly aggregateType: string = 'User';
  readonly eventData: {
    userId: string;
    changes: Record<string, any>;
  };
  readonly metadata?: Record<string, any>;

  constructor(userId: string, changes: Record<string, any>) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = userId;
    this.eventData = { userId, changes };
  }
}

export class UserDeletedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'UserDeleted';
  readonly aggregateId: string;
  readonly aggregateType: string = 'User';
  readonly eventData: {
    userId: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(userId: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = userId;
    this.eventData = { userId };
  }
}

export class UserLoggedInEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'UserLoggedIn';
  readonly aggregateId: string;
  readonly aggregateType: string = 'User';
  readonly eventData: {
    userId: string;
    timestamp: Date;
    ipAddress?: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(userId: string, timestamp: Date, ipAddress?: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = userId;
    this.eventData = { userId, timestamp, ipAddress };
  }
}

export class UserLoggedOutEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'UserLoggedOut';
  readonly aggregateId: string;
  readonly aggregateType: string = 'User';
  readonly eventData: {
    userId: string;
    timestamp: Date;
  };
  readonly metadata?: Record<string, any>;

  constructor(userId: string, timestamp: Date) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = userId;
    this.eventData = { userId, timestamp };
  }
}

export class GroupCreatedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'GroupCreated';
  readonly aggregateId: string;
  readonly aggregateType: string = 'Group';
  readonly eventData: {
    groupId: string;
    name: string;
    description?: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(groupId: string, name: string, description?: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = groupId;
    this.eventData = { groupId, name, description };
  }
}

export class GroupUpdatedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'GroupUpdated';
  readonly aggregateId: string;
  readonly aggregateType: string = 'Group';
  readonly eventData: {
    groupId: string;
    changes: Record<string, any>;
  };
  readonly metadata?: Record<string, any>;

  constructor(groupId: string, changes: Record<string, any>) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = groupId;
    this.eventData = { groupId, changes };
  }
}

export class GroupDeletedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'GroupDeleted';
  readonly aggregateId: string;
  readonly aggregateType: string = 'Group';
  readonly eventData: {
    groupId: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(groupId: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = groupId;
    this.eventData = { groupId };
  }
}

export class GroupUserAddedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'GroupUserAdded';
  readonly aggregateId: string;
  readonly aggregateType: string = 'Group';
  readonly eventData: {
    groupId: string;
    userId: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(groupId: string, userId: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = groupId;
    this.eventData = { groupId, userId };
  }
}

export class GroupUserRemovedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'GroupUserRemoved';
  readonly aggregateId: string;
  readonly aggregateType: string = 'Group';
  readonly eventData: {
    groupId: string;
    userId: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(groupId: string, userId: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = groupId;
    this.eventData = { groupId, userId };
  }
}

export class GroupPermissionAddedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'GroupPermissionAdded';
  readonly aggregateId: string;
  readonly aggregateType: string = 'Group';
  readonly eventData: {
    groupId: string;
    permissionId: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(groupId: string, permissionId: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = groupId;
    this.eventData = { groupId, permissionId };
  }
}

export class GroupPermissionRemovedEvent implements DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string = 'GroupPermissionRemoved';
  readonly aggregateId: string;
  readonly aggregateType: string = 'Group';
  readonly eventData: {
    groupId: string;
    permissionId: string;
  };
  readonly metadata?: Record<string, any>;

  constructor(groupId: string, permissionId: string) {
    this.id = IdGenerator.generate();
    this.occurredOn = new Date();
    this.aggregateId = groupId;
    this.eventData = { groupId, permissionId };
  }
}

// User preferences interface
export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Library version
export const SHARED_VERSION = '1.0.0';