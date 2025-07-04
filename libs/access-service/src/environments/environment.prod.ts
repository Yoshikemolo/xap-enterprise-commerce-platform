export const environment = {
  production: true,
  service: 'access-service',
  port: parseInt(process.env.PORT || '3001'),
  apiVersion: 'v1',
  database: {
    host: process.env.DATABASE_HOST || 'mysql',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USERNAME || 'app_user',
    password: process.env.DATABASE_PASSWORD || 'app_password',
    database: process.env.DATABASE_NAME || 'enterprise_commerce',
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  keycloak: {
    url: process.env.KEYCLOAK_URL || 'http://keycloak:8080',
    realm: process.env.KEYCLOAK_REALM || 'enterprise-commerce',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend-service',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-production-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};
