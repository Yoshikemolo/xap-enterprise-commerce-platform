import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({})
class CommerceServiceStubModule {}

async function bootstrap() {
  const app = await NestFactory.create(CommerceServiceStubModule);

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
      service: 'commerce-service',
      version: '0.0.1',
      message: 'Commerce Service is in development phase',
      nextPhase: 'Order Management Implementation',
      documentation: '/docs/en/commerce-service-specification.md'
    });
  });

  // Stub endpoints
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'Commerce Service - Coming Soon!',
      status: 'In Development',
      expectedFeatures: [
        'Order Management',
        'Shopping Cart',
        'Promotions Engine',
        'Logistics Management',
        'Recommendation System'
      ],
      technicalSpec: '/docs/en/commerce-service-specification.md'
    });
  });

  const port = process.env.COMMERCE_SERVICE_PORT || 3003;
  await app.listen(port);
  
  console.log(`🛒 Commerce Service (DEV) is running on: http://localhost:${port}`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`📋 Status: In Development Phase`);
  console.log(`📚 Specification: ./docs/en/commerce-service-specification.md`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting Commerce Service stub:', error);
  process.exit(1);
});
