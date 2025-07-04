// Common interfaces for the Enterprise Commerce Platform

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface EventHandler<T> {
  handle(event: T): Promise<void>;
}

export interface Command {
  readonly timestamp: Date;
}

export interface Query {
  readonly timestamp: Date;
}

export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
  readonly version: number;
}
