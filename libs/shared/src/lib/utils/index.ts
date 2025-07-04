// import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import { DomainEvent, QueryFilter, QueryOptions } from '../types/index';

// UUID Generator
export class IdGenerator {
  static generate(): string {
    // Generate a simple UUID v4 without requiring external libraries
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static isValid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  static isUuidV4(id: string): boolean {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(id);
  }

  static generateNumericId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// Date Utilities
export class DateUtils {
  static now(): Date {
    return new Date();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  static isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime();
  }

  static isBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  static formatISOString(date: Date): string {
    return date.toISOString();
  }

  static parseISOString(dateString: string): Date {
    return new Date(dateString);
  }
}

// Validation Utilities
export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  }

  static isPostalCode(postalCode: string, country: string = 'ES'): boolean {
    const patterns = {
      ES: /^\d{5}$/,
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
      FR: /^\d{5}$/,
      DE: /^\d{5}$/,
    };
    
    const pattern = patterns[country as keyof typeof patterns];
    return pattern ? pattern.test(postalCode) : true;
  }

  static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  static isPositiveNumber(value: number): boolean {
    return typeof value === 'number' && value > 0 && !isNaN(value);
  }

  static isNonNegativeNumber(value: number): boolean {
    return typeof value === 'number' && value >= 0 && !isNaN(value);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// String Utilities
export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static camelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  static kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  static snakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static padLeft(str: string, length: number, char: string = '0'): string {
    return str.padStart(length, char);
  }

  static padRight(str: string, length: number, char: string = ' '): string {
    return str.padEnd(length, char);
  }

  static removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static randomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Query Utilities
export class QueryUtils {
  static buildPagination(options: Partial<{ take: number; skip: number; sortBy: string; order: 'ASC' | 'DESC' }> = {}): Required<{ take: number; skip: number; sortBy: string; order: 'ASC' | 'DESC' }> {
    const take = Math.min(Math.max(options.take || 10, 1), 100); // Min 1, Max 100, Default 10
    const skip = Math.max(options.skip || 0, 0); // Min 0, Default 0
    const sortBy = options.sortBy || 'createdAt';
    const order = options.order || 'ASC';

    return { take, skip, sortBy, order };
  }

  static calculatePaginationMetadata(
    total: number,
    take: number,
    skip: number,
    sortBy?: string,
    order?: 'ASC' | 'DESC'
  ) {
    const page = Math.floor(skip / take) + 1;
    const pages = Math.ceil(total / take);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    return {
      page,
      limit: take,
      total,
      pages,
      hasNext,
      hasPrev,
      sortBy,
      order
    };
  }

  static sanitizeFilter(filter: any): any {
    if (!filter || typeof filter !== 'object') {
      return {};
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) {
        continue;
      }

      // Handle logical operators
      if (key === '$and' || key === '$or') {
        if (Array.isArray(value)) {
          sanitized[key] = value.map(v => QueryUtils.sanitizeFilter(v));
        }
        continue;
      }

      if (key === '$not') {
        sanitized[key] = QueryUtils.sanitizeFilter(value);
        continue;
      }

      // Handle regular fields and operators
      sanitized[key] = value;
    }

    return sanitized;
  }

  static buildOrderBy(sortBy: string, order: 'ASC' | 'DESC'): Record<string, 'ASC' | 'DESC'> {
    // Handle nested sorting like 'user.name' or 'product.family.name'
    const orderObj: Record<string, any> = {};
    const parts = sortBy.split('.');
    
    if (parts.length === 1) {
      orderObj[sortBy] = order;
    } else {
      // For nested relations, we need to handle this in the specific repository implementation
      orderObj[sortBy] = order;
    }

    return orderObj;
  }

  static validateSortField(sortBy: string, allowedFields: string[]): boolean {
    if (!sortBy) return false;
    
    // Check if the field (or its root for nested fields) is allowed
    const rootField = sortBy.split('.')[0];
    return allowedFields.includes(rootField) || allowedFields.includes(sortBy);
  }
}

// Filter Builder Utility
export class FilterBuilder {
  private filter: any = {};

  static create(): FilterBuilder {
    return new FilterBuilder();
  }

  where(field: string, value: any): FilterBuilder {
    this.filter[field] = value;
    return this;
  }

  whereEqual(field: string, value: any): FilterBuilder {
    this.filter[field] = { $eq: value };
    return this;
  }

  whereNotEqual(field: string, value: any): FilterBuilder {
    this.filter[field] = { $ne: value };
    return this;
  }

  whereIn(field: string, values: any[]): FilterBuilder {
    this.filter[field] = { $in: values };
    return this;
  }

  whereNotIn(field: string, values: any[]): FilterBuilder {
    this.filter[field] = { $nin: values };
    return this;
  }

  whereLike(field: string, pattern: string): FilterBuilder {
    this.filter[field] = { $like: pattern };
    return this;
  }

  whereILike(field: string, pattern: string): FilterBuilder {
    this.filter[field] = { $ilike: pattern };
    return this;
  }

  whereGreaterThan(field: string, value: any): FilterBuilder {
    this.filter[field] = { $gt: value };
    return this;
  }

  whereGreaterThanOrEqual(field: string, value: any): FilterBuilder {
    this.filter[field] = { $gte: value };
    return this;
  }

  whereLessThan(field: string, value: any): FilterBuilder {
    this.filter[field] = { $lt: value };
    return this;
  }

  whereLessThanOrEqual(field: string, value: any): FilterBuilder {
    this.filter[field] = { $lte: value };
    return this;
  }

  whereBetween(field: string, min: any, max: any): FilterBuilder {
    this.filter[field] = { $between: [min, max] };
    return this;
  }

  whereNull(field: string): FilterBuilder {
    this.filter[field] = { $isNull: true };
    return this;
  }

  whereNotNull(field: string): FilterBuilder {
    this.filter[field] = { $isNotNull: true };
    return this;
  }

  and(filters: any[]): FilterBuilder {
    this.filter.$and = [...(this.filter.$and || []), ...filters];
    return this;
  }

  or(filters: any[]): FilterBuilder {
    this.filter.$or = [...(this.filter.$or || []), ...filters];
    return this;
  }

  not(filter: any): FilterBuilder {
    this.filter.$not = filter;
    return this;
  }

  build(): any {
    return QueryUtils.sanitizeFilter(this.filter);
  }

  reset(): FilterBuilder {
    this.filter = {};
    return this;
  }
}

// Object Utilities
export class ObjectUtils {
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => ObjectUtils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = ObjectUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  }

  static deepMerge(target: any, ...sources: any[]): any {
    if (!sources.length) return target;
    const source = sources.shift();

    if (ObjectUtils.isObject(target) && ObjectUtils.isObject(source)) {
      for (const key in source) {
        if (ObjectUtils.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          ObjectUtils.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return ObjectUtils.deepMerge(target, ...sources);
  }

  static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  static isEmpty(obj: any): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  }

  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }

  static flatten(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (ObjectUtils.isObject(obj[key]) && !Array.isArray(obj[key])) {
          Object.assign(flattened, ObjectUtils.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }
}

// Array Utilities
export class ArrayUtils {
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  static uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  static sortBy<T>(array: T[], key: keyof T, order: 'ASC' | 'DESC' = 'ASC'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return order === 'ASC' ? comparison : -comparison;
    });
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static paginate<T>(array: T[], page: number, pageSize: number): T[] {
    const startIndex = (page - 1) * pageSize;
    return array.slice(startIndex, startIndex + pageSize);
  }
}

// Performance Utilities
export class PerformanceUtils {
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
}