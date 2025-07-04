import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsString, IsBoolean, IsNumber, IsEmail, IsUrl, MaxLength, MinLength, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PERMISSIONS } from '../constants/index';

// Permission Decorator
export const PERMISSION_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);

// Role Decorator
export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Public Route Decorator (Skip Authentication)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Cacheable Decorator
export const CACHE_KEY = 'cache';
export const CACHE_TTL_KEY = 'cacheTTL';
export const Cacheable = (ttl?: number) => applyDecorators(
  SetMetadata(CACHE_KEY, true),
  SetMetadata(CACHE_TTL_KEY, ttl)
);

// Rate Limit Decorator
export const RATE_LIMIT_KEY = 'rateLimit';
export const RateLimit = (limit: number, windowMs: number = 60000) => 
  SetMetadata(RATE_LIMIT_KEY, { limit, windowMs });

// Audit Log Decorator
export const AUDIT_LOG_KEY = 'auditLog';
export const AuditLog = (action: string, resource: string) => 
  SetMetadata(AUDIT_LOG_KEY, { action, resource });

// Field Decorators with Validation and Documentation
export const UuidField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'uuid',
    description: 'UUID identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    ...options
  }),
  IsUUID('4')
);

export const OptionalUuidField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'uuid',
    required: false,
    description: 'Optional UUID identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    ...options
  }),
  IsOptional(),
  IsUUID('4')
);

export const StringField = (options: ApiPropertyOptions & { min?: number; max?: number } = {}) => {
  const { min, max, ...apiOptions } = options;
  const decorators = [
    ApiProperty({
      type: String,
      description: 'String field',
      ...apiOptions
    }),
    IsString()
  ];

  if (min !== undefined) decorators.push(MinLength(min));
  if (max !== undefined) decorators.push(MaxLength(max));

  return applyDecorators(...decorators);
};

export const OptionalStringField = (options: ApiPropertyOptions & { min?: number; max?: number } = {}) => {
  const { min, max, ...apiOptions } = options;
  const decorators = [
    ApiProperty({
      type: String,
      required: false,
      description: 'Optional string field',
      ...apiOptions
    }),
    IsOptional(),
    IsString()
  ];

  if (min !== undefined) decorators.push(MinLength(min));
  if (max !== undefined) decorators.push(MaxLength(max));

  return applyDecorators(...decorators);
};

export const EmailField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'email',
    description: 'Email address',
    example: 'user@example.com',
    ...options
  }),
  IsEmail()
);

export const OptionalEmailField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'email',
    required: false,
    description: 'Optional email address',
    example: 'user@example.com',
    ...options
  }),
  IsOptional(),
  IsEmail()
);

export const UrlField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'url',
    description: 'URL',
    example: 'https://example.com',
    ...options
  }),
  IsUrl()
);

export const OptionalUrlField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'url',
    required: false,
    description: 'Optional URL',
    example: 'https://example.com',
    ...options
  }),
  IsOptional(),
  IsUrl()
);

export const NumberField = (options: ApiPropertyOptions & { min?: number; max?: number } = {}) => {
  const { min, max, ...apiOptions } = options;
  const decorators = [
    ApiProperty({
      type: Number,
      description: 'Number field',
      ...apiOptions
    }),
    IsNumber()
  ];

  if (min !== undefined) decorators.push(Min(min));
  if (max !== undefined) decorators.push(Max(max));

  return applyDecorators(...decorators);
};

export const OptionalNumberField = (options: ApiPropertyOptions & { min?: number; max?: number } = {}) => {
  const { min, max, ...apiOptions } = options;
  const decorators = [
    ApiProperty({
      type: Number,
      required: false,
      description: 'Optional number field',
      ...apiOptions
    }),
    IsOptional(),
    IsNumber()
  ];

  if (min !== undefined) decorators.push(Min(min));
  if (max !== undefined) decorators.push(Max(max));

  return applyDecorators(...decorators);
};

export const BooleanField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: Boolean,
    description: 'Boolean field',
    example: true,
    ...options
  }),
  IsBoolean()
);

export const OptionalBooleanField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: Boolean,
    required: false,
    description: 'Optional boolean field',
    example: true,
    ...options
  }),
  IsOptional(),
  IsBoolean()
);

export const DateField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Date field',
    example: '2024-01-01T00:00:00.000Z',
    ...options
  }),
  IsDateString()
);

export const OptionalDateField = (options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: String,
    format: 'date-time',
    required: false,
    description: 'Optional date field',
    example: '2024-01-01T00:00:00.000Z',
    ...options
  }),
  IsOptional(),
  IsDateString()
);

// Enum Field Decorator
export const EnumField = <T extends Record<string, any>>(enumObject: T, options: ApiPropertyOptions = {}) => 
  applyDecorators(
    ApiProperty({
      enum: enumObject,
      description: 'Enum field',
      ...options
    })
  );

export const OptionalEnumField = <T extends Record<string, any>>(enumObject: T, options: ApiPropertyOptions = {}) => 
  applyDecorators(
    ApiProperty({
      enum: enumObject,
      required: false,
      description: 'Optional enum field',
      ...options
    }),
    IsOptional()
  );

// Array Field Decorator
export const ArrayField = (itemType: any, options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: [itemType],
    description: 'Array field',
    ...options
  }),
  Type(() => itemType)
);

export const OptionalArrayField = (itemType: any, options: ApiPropertyOptions = {}) => applyDecorators(
  ApiProperty({
    type: [itemType],
    required: false,
    description: 'Optional array field',
    ...options
  }),
  IsOptional(),
  Type(() => itemType)
);

// Transform Decorators
export const ToLowerCase = () => Transform(({ value }) => 
  typeof value === 'string' ? value.toLowerCase() : value
);

export const ToUpperCase = () => Transform(({ value }) => 
  typeof value === 'string' ? value.toUpperCase() : value
);

export const Trim = () => Transform(({ value }) => 
  typeof value === 'string' ? value.trim() : value
);

export const ToNumber = () => Transform(({ value }) => {
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }
  return value;
});

export const ToBoolean = () => Transform(({ value }) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
});

export const ToDate = () => Transform(({ value }) => {
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  }
  return value;
});

// Pagination Decorators
export const PaginationField = () => applyDecorators(
  ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of items per page',
    example: 10
  }),
  IsOptional(),
  IsNumber(),
  Min(1),
  Max(100),
  Transform(({ value }) => value ? parseInt(value, 10) : 10)
);

export const SkipField = () => applyDecorators(
  ApiProperty({
    type: Number,
    minimum: 0,
    default: 0,
    description: 'Number of items to skip',
    example: 0
  }),
  IsOptional(),
  IsNumber(),
  Min(0),
  Transform(({ value }) => value ? parseInt(value, 10) : 0)
);

export const SortByField = (allowedFields: string[] = []) => applyDecorators(
  ApiProperty({
    type: String,
    description: 'Field to sort by',
    example: 'createdAt',
    enum: allowedFields.length > 0 ? allowedFields : undefined
  }),
  IsOptional(),
  IsString()
);

export const OrderField = () => applyDecorators(
  ApiProperty({
    type: String,
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    description: 'Sort order',
    example: 'ASC'
  }),
  IsOptional(),
  IsString()
);

// Method Decorators
export const Transactional = () => SetMetadata('transactional', true);

export const Retryable = (maxAttempts: number = 3, delay: number = 1000) => 
  SetMetadata('retryable', { maxAttempts, delay });

export const Timeout = (ms: number) => SetMetadata('timeout', ms);

export const ValidateInput = () => SetMetadata('validateInput', true);

export const ValidateOutput = () => SetMetadata('validateOutput', true);

// Performance Monitoring Decorator
export const Monitor = (operation?: string) => SetMetadata('monitor', { operation });

// Feature Flag Decorator
export const FeatureFlag = (flag: string) => SetMetadata('featureFlag', flag);

// API Version Decorator
export const ApiVersion = (version: string) => SetMetadata('apiVersion', version);

// Deprecation Decorator
export const Deprecated = (message?: string, version?: string) => 
  SetMetadata('deprecated', { message, version });

// Custom Validation Decorators
export const IsValidUuid = () => IsUUID('4', { message: 'Must be a valid UUID v4' });

export const IsStrongPassword = () => 
  applyDecorators(
    IsString(),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    MaxLength(128, { message: 'Password must not exceed 128 characters' })
  );

export const IsPhoneNumber = () => 
  applyDecorators(
    IsString(),
    Transform(({ value }) => typeof value === 'string' ? value.replace(/\s/g, '') : value)
  );

// Composite Decorators for Common Patterns
export const CreateEntityDto = () => applyDecorators(
  ValidateInput(),
  AuditLog('CREATE', 'ENTITY')
);

export const UpdateEntityDto = () => applyDecorators(
  ValidateInput(),
  AuditLog('UPDATE', 'ENTITY')
);

export const DeleteEntity = () => applyDecorators(
  RequirePermissions('DELETE'),
  AuditLog('DELETE', 'ENTITY'),
  Transactional()
);

export const GetEntity = () => applyDecorators(
  Cacheable(300), // 5 minutes cache
  Monitor('GET_ENTITY')
);

export const ListEntities = () => applyDecorators(
  Cacheable(60), // 1 minute cache for lists
  Monitor('LIST_ENTITIES'),
  RateLimit(100, 60000) // 100 requests per minute
);