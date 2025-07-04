import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

@Module({})
class ApiGatewayStubModule {}

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayStubModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS configuration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ 
      status: 'development', 
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '0.0.1',
      message: 'API Gateway is in development phase',
      nextPhase: 'GraphQL Federation Implementation'
    });
  });

  // Gateway status endpoint
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'XAP Enterprise Commerce Platform - API Gateway',
      status: 'In Development',
      architecture: 'GraphQL Federation Gateway',
      expectedFeatures: [
        'GraphQL Schema Federation',
        'Service Discovery',
        'Authentication Middleware', 
        'Rate Limiting',
        'Request/Response Transformation',
        'Load Balancing',
        'API Versioning',
        'Real-time Subscriptions'
      ],
      availableServices: {
        'access-service': 'http://localhost:3001',
        'products-service': 'http://localhost:3002',
        'commerce-service': 'http://localhost:3003 (dev)',
        'scheduling-service': 'http://localhost:3004 (dev)',
        'business-service': 'http://localhost:3005 (dev)'
      }
    });
  });

  // Service discovery endpoint
  app.getHttpAdapter().get('/services', (req, res) => {
    res.json({
      services: [
        {
          name: 'access-service',
          url: 'http://localhost:3001',
          status: 'ready',
          health: 'http://localhost:3001/health',
          docs: 'http://localhost:3001/api/docs'
        },
        {
          name: 'products-service', 
          url: 'http://localhost:3002',
          status: 'ready',
          health: 'http://localhost:3002/health',
          docs: 'http://localhost:3002/api/docs'
        },
        {
          name: 'commerce-service',
          url: 'http://localhost:3003',
          status: 'development',
          health: 'http://localhost:3003/health'
        },
        {
          name: 'scheduling-service',
          url: 'http://localhost:3004', 
          status: 'development',
          health: 'http://localhost:3004/health'
        },
        {
          name: 'business-service',
          url: 'http://localhost:3005',
          status: 'development', 
          health: 'http://localhost:3005/health'
        }
      ]
    });
  });

  const port = process.env.API_GATEWAY_PORT || 3000;
  await app.listen(port);
  
  console.log(`🌐 API Gateway (DEV) is running on: http://localhost:${port}`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`🔍 Service Discovery: http://localhost:${port}/services`);
  console.log(`📋 Status: GraphQL Federation in Development`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting API Gateway stub:', error);
  process.exit(1);
});
