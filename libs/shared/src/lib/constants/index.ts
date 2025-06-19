// API Constants
export const API_CONSTANTS = {
  VERSION: 'v1',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Codes
export const ERROR_CODES = {
  // Generic Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  
  // Business Logic Errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_PRICE: 'INVALID_PRICE',
  EXPIRED_PROMOTION: 'EXPIRED_PROMOTION',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  
  // System Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

// Database Constants
export const DATABASE_CONSTANTS = {
  DEFAULT_CONNECTION_TIMEOUT: 5000,
  DEFAULT_QUERY_TIMEOUT: 30000,
  MAX_CONNECTIONS: 100,
  CONNECTION_POOL_SIZE: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Cache Constants
export const CACHE_CONSTANTS = {
  DEFAULT_TTL: 3600, // 1 hour in seconds
  SHORT_TTL: 300,    // 5 minutes
  LONG_TTL: 86400,   // 24 hours
  VERY_LONG_TTL: 604800, // 7 days
  
  // Cache Keys
  KEYS: {
    USER_PROFILE: 'user:profile:',
    USER_PERMISSIONS: 'user:permissions:',
    PRODUCT_DETAILS: 'product:details:',
    PRODUCT_FAMILY: 'product:family:',
    STOCK_LEVEL: 'stock:level:',
    PROMOTION_ACTIVE: 'promotion:active:',
    ORDER_STATUS: 'order:status:',
    PRICING_RULES: 'pricing:rules:',
  },
} as const;

// Event Types
export const EVENT_TYPES = {
  // User Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  
  // Product Events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_PRICE_CHANGED: 'product.price_changed',
  STOCK_UPDATED: 'product.stock_updated',
  STOCK_LOW: 'product.stock_low',
  STOCK_OUT: 'product.stock_out',
  
  // Order Events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_REFUNDED: 'order.refunded',
  
  // Payment Events
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // Promotion Events
  PROMOTION_CREATED: 'promotion.created',
  PROMOTION_UPDATED: 'promotion.updated',
  PROMOTION_ACTIVATED: 'promotion.activated',
  PROMOTION_DEACTIVATED: 'promotion.deactivated',
  PROMOTION_EXPIRED: 'promotion.expired',
  
  // System Events
  SYSTEM_HEALTH_CHECK: 'system.health_check',
  SYSTEM_BACKUP_COMPLETED: 'system.backup_completed',
  SYSTEM_MAINTENANCE_START: 'system.maintenance_start',
  SYSTEM_MAINTENANCE_END: 'system.maintenance_end',
} as const;

// Queue Names
export const QUEUE_NAMES = {
  EMAIL_NOTIFICATIONS: 'email-notifications',
  SMS_NOTIFICATIONS: 'sms-notifications',
  PUSH_NOTIFICATIONS: 'push-notifications',
  ORDER_PROCESSING: 'order-processing',
  PAYMENT_PROCESSING: 'payment-processing',
  STOCK_UPDATES: 'stock-updates',
  ANALYTICS_EVENTS: 'analytics-events',
  FILE_PROCESSING: 'file-processing',
  AUDIT_LOGS: 'audit-logs',
  BACKUP_TASKS: 'backup-tasks',
} as const;

// Pagination Constants
export const PAGINATION_CONSTANTS = {
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
  MAX_SKIP: 10000, // Prevent deep pagination
} as const;

// Validation Constants
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Business Constants
export const BUSINESS_CONSTANTS = {
  DEFAULT_CURRENCY: 'EUR',
  SUPPORTED_CURRENCIES: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD'],
  DEFAULT_LANGUAGE: 'es',
  SUPPORTED_LANGUAGES: ['es', 'en', 'fr', 'de', 'it', 'pt'],
  DEFAULT_TIMEZONE: 'Europe/Madrid',
  
  // Stock Thresholds
  LOW_STOCK_THRESHOLD: 10,
  CRITICAL_STOCK_THRESHOLD: 5,
  
  // Order Limits
  MIN_ORDER_AMOUNT: 1.00,
  MAX_ORDER_AMOUNT: 10000.00,
  MAX_ORDER_ITEMS: 100,
  
  // Promotion Limits
  MAX_DISCOUNT_PERCENTAGE: 100,
  MAX_DISCOUNT_AMOUNT: 1000.00,
} as const;

// File Upload Constants
export const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'],
  UPLOAD_TIMEOUT: 300000, // 5 minutes
  
  // Image Processing
  MAX_IMAGE_WIDTH: 2048,
  MAX_IMAGE_HEIGHT: 2048,
  THUMBNAIL_SIZE: 200,
  MEDIUM_SIZE: 800,
} as const;

// Security Constants
export const SECURITY_CONSTANTS = {
  JWT_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '30d',
  PASSWORD_RESET_EXPIRY: '1h',
  EMAIL_VERIFICATION_EXPIRY: '24h',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  LOGIN_ATTEMPTS_LIMIT: 5,
  LOGIN_ATTEMPTS_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Session
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  SESSION_REFRESH_THRESHOLD: 30 * 60 * 1000, // 30 minutes
} as const;

// Monitoring Constants
export const MONITORING_CONSTANTS = {
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  METRICS_COLLECTION_INTERVAL: 60000, // 1 minute
  LOG_RETENTION_DAYS: 30,
  ALERT_THRESHOLDS: {
    CPU_USAGE: 80,
    MEMORY_USAGE: 85,
    DISK_USAGE: 90,
    RESPONSE_TIME: 2000, // 2 seconds
    ERROR_RATE: 5, // 5%
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_NEW_CHECKOUT: 'enable_new_checkout',
  ENABLE_PRODUCT_RECOMMENDATIONS: 'enable_product_recommendations',
  ENABLE_ADVANCED_ANALYTICS: 'enable_advanced_analytics',
  ENABLE_REAL_TIME_NOTIFICATIONS: 'enable_real_time_notifications',
  ENABLE_MULTI_CURRENCY: 'enable_multi_currency',
  ENABLE_WISHLIST: 'enable_wishlist',
  ENABLE_REVIEWS: 'enable_reviews',
  ENABLE_LOYALTY_PROGRAM: 'enable_loyalty_program',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  SKU: /^[A-Z0-9\-_]+$/,
  POSTAL_CODE: {
    ES: /^\d{5}$/,
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
    FR: /^\d{5}$/,
    DE: /^\d{5}$/,
  },
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
  DISPLAY_TIME: 'HH:mm',
  FILE_TIMESTAMP: 'YYYYMMDD_HHmmss',
  LOG_TIMESTAMP: 'YYYY-MM-DD HH:mm:ss.SSS',
} as const;

// Message Templates
export const MESSAGE_TEMPLATES = {
  EMAIL: {
    WELCOME: 'welcome_email',
    PASSWORD_RESET: 'password_reset_email',
    EMAIL_VERIFICATION: 'email_verification',
    ORDER_CONFIRMATION: 'order_confirmation_email',
    ORDER_SHIPPED: 'order_shipped_email',
    ORDER_DELIVERED: 'order_delivered_email',
    PROMOTION_ALERT: 'promotion_alert_email',
    STOCK_ALERT: 'stock_alert_email',
  },
  SMS: {
    VERIFICATION_CODE: 'sms_verification_code',
    ORDER_STATUS: 'sms_order_status',
    DELIVERY_NOTIFICATION: 'sms_delivery_notification',
    PROMOTION_ALERT: 'sms_promotion_alert',
  },
  PUSH: {
    ORDER_UPDATE: 'push_order_update',
    PROMOTION_ALERT: 'push_promotion_alert',
    STOCK_AVAILABLE: 'push_stock_available',
    DELIVERY_NOTIFICATION: 'push_delivery_notification',
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
    ADDRESSES: '/users/addresses',
    PAYMENT_METHODS: '/users/payment-methods',
  },
  PRODUCTS: {
    BASE: '/products',
    FAMILIES: '/products/families',
    SEARCH: '/products/search',
    STOCK: '/products/stock',
    REVIEWS: '/products/reviews',
  },
  ORDERS: {
    BASE: '/orders',
    CART: '/orders/cart',
    CHECKOUT: '/orders/checkout',
    HISTORY: '/orders/history',
    TRACKING: '/orders/tracking',
  },
  PAYMENTS: {
    BASE: '/payments',
    METHODS: '/payments/methods',
    PROCESS: '/payments/process',
    REFUND: '/payments/refund',
    HISTORY: '/payments/history',
  },
  PROMOTIONS: {
    BASE: '/promotions',
    ACTIVE: '/promotions/active',
    VALIDATE: '/promotions/validate',
    APPLY: '/promotions/apply',
  },
} as const;

// System Roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
  GUEST: 'guest',
} as const;

// Permissions
export const PERMISSIONS = {
  // User Management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Product Management
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  
  // Order Management
  ORDERS_CREATE: 'orders:create',
  ORDERS_READ: 'orders:read',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_PROCESS: 'orders:process',
  
  // Stock Management
  STOCK_READ: 'stock:read',
  STOCK_UPDATE: 'stock:update',
  STOCK_MANAGE: 'stock:manage',
  
  // Promotion Management
  PROMOTIONS_CREATE: 'promotions:create',
  PROMOTIONS_READ: 'promotions:read',
  PROMOTIONS_UPDATE: 'promotions:update',
  PROMOTIONS_DELETE: 'promotions:delete',
  
  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // System Administration
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_MONITORING: 'system:monitoring',
  SYSTEM_BACKUP: 'system:backup',
} as const;

// Order Status Flow
export const ORDER_STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
  RETURNED: ['REFUNDED'],
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Log Levels
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  HTTP: 3,
  VERBOSE: 4,
  DEBUG: 5,
  SILLY: 6,
} as const;

// Environment Types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

// Default Values
export const DEFAULTS = {
  AVATAR_URL: '/assets/images/default-avatar.png',
  PRODUCT_IMAGE_URL: '/assets/images/default-product.png',
  COMPANY_LOGO_URL: '/assets/images/company-logo.png',
  CURRENCY: 'EUR',
  LANGUAGE: 'es',
  TIMEZONE: 'Europe/Madrid',
  PAGE_SIZE: 10,
  CACHE_TTL: 3600,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
  REQUEST_TIMEOUT: 30000,
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  API: API_CONSTANTS,
  HTTP_STATUS,
  ERROR_CODES,
  DATABASE: DATABASE_CONSTANTS,
  CACHE: CACHE_CONSTANTS,
  EVENTS: EVENT_TYPES,
  QUEUES: QUEUE_NAMES,
  PAGINATION: PAGINATION_CONSTANTS,
  VALIDATION: VALIDATION_CONSTANTS,
  BUSINESS: BUSINESS_CONSTANTS,
  FILES: FILE_UPLOAD_CONSTANTS,
  SECURITY: SECURITY_CONSTANTS,
  MONITORING: MONITORING_CONSTANTS,
  FEATURES: FEATURE_FLAGS,
  REGEX: REGEX_PATTERNS,
  DATES: DATE_FORMATS,
  MESSAGES: MESSAGE_TEMPLATES,
  ENDPOINTS: API_ENDPOINTS,
  ROLES: SYSTEM_ROLES,
  PERMISSIONS,
  ORDER_FLOW: ORDER_STATUS_FLOW,
  PAYMENT: PAYMENT_STATUS,
  NOTIFICATIONS: NOTIFICATION_TYPES,
  LOGS: LOG_LEVELS,
  ENV: ENVIRONMENTS,
  DEFAULTS,
} as const;