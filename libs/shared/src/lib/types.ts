// Common types used across the Enterprise Commerce Platform
// Note: Error classes are now defined in the main index.ts to avoid conflicts

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

// Only keep the interface definition here, not the class
export interface ValidationErrorDetails {
  field: string;
  message: string;
  value?: any;
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

// Base Model Interface
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

export type EntityId = string;
export type UserId = string;
export type ProductId = string;
export type OrderId = string;